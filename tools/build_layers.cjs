// Baut aus echten BAG-Daten (bag_utr_raw.json) die App-Layer:
//  - bag_utr.json               (ALLE Gebäude, kompakt, 3D-Vollkontext)
//  - co2_buildings_utr.geojson  (2D, analysierte Gebäude, echtes CO2)
//  - heat_exposure_utr.geojson  (2D Hitze)
//  - flood_exposure_utr.geojson (2D Hochwasser, konsistent)
const fs = require('fs');
const L = 'public/data/layers/';
const SRC = 'tools/_src/';
const raw = JSON.parse(fs.readFileSync(SRC+'bag_utr_raw.json','utf8'));
console.log('BAG roh:', raw.length, 'Gebäude');

const MLAT = 111320, MLON = 111320*Math.cos(52*Math.PI/180);
function centroid(ring){let x=0,y=0;for(const p of ring){x+=p[0];y+=p[1];}return [x/ring.length,y/ring.length];}
function areaM2(ring){let a=0;for(let i=0;i<ring.length-1;i++){const[x1,y1]=ring[i],[x2,y2]=ring[i+1];a+=(x1*MLON)*(y2*MLAT)-(x2*MLON)*(y1*MLAT);}return Math.abs(a/2);}

// Douglas-Peucker (ε≈0.6 m) — entfernt kollineare Stützpunkte, ~9→~6 Punkte
const EPS = 0.6/MLAT; // in Grad
function dp(pts){
  if(pts.length<4) return pts;
  const closed = pts[0][0]===pts[pts.length-1][0] && pts[0][1]===pts[pts.length-1][1];
  const open = closed ? pts.slice(0,-1) : pts;
  function rec(s,e){
    let dmax=0,idx=-1;const[ax,ay]=open[s],[bx,by]=open[e];
    const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1e-9;
    for(let i=s+1;i<e;i++){const[px,py]=open[i];const d=Math.abs((px-ax)*dy-(py-ay)*dx)/len;if(d>dmax){dmax=d;idx=i;}}
    if(dmax>EPS&&idx>0){const l=rec(s,idx),r=rec(idx,e);return l.slice(0,-1).concat(r);}
    return [open[s],open[e]];
  }
  let out = open.length>2 ? rec(0,open.length-1) : open.slice();
  if(closed) out=out.concat([out[0]]);
  return out.length>=4 ? out.map(p=>[+p[0].toFixed(5),+p[1].toFixed(5)]) : pts;
}

// ─── CO2-Modell: echte Energie-Intensität nach Bauepoche ─────────────────
// Wärmebedarf (kWh/m²·a) — NL-Normverschärfung (Ölkrise '75, EPC '95, BENG '20)
function heatDemand(y){
  if(!y) return 150;
  if(y<1920) return 195; if(y<1945) return 200; if(y<1965) return 190;
  if(y<1975) return 175; if(y<1988) return 140; if(y<1992) return 120;
  if(y<2000) return 100; if(y<2010) return 80;  if(y<2015) return 55;
  if(y<2020) return 40;  return 25;
}
const ELEC={res:30,off:70,ret:120,ind:80,hea:90,edu:40,asm:50,hot:80,oth:30,'':0};
const HEATMULT={res:1.0,off:1.05,ret:1.1,ind:1.2,hea:1.5,edu:0.8,asm:0.9,hot:1.15,oth:0.7,'':0};
const GAS_EF=0.19, GRID_EF=0.27;
function co2PerM2(y,use){
  if(use==='') return null;
  return Math.round(heatDemand(y)*GAS_EF*(HEATMULT[use]??1) + (ELEC[use]??30)*GRID_EF);
}
function era(y){
  if(!y) return 'unbekannt';
  if(y<1920) return 'pre1920'; if(y<1945) return '1920_1944'; if(y<1965) return '1945_1964';
  if(y<1975) return '1965_1974'; if(y<1988) return '1975_1987'; if(y<2000) return '1988_1999';
  if(y<2010) return '2000_2009'; if(y<2020) return '2010_2019'; return 'post2020';
}
// Höhe Utrecht-realistisch (überwiegend Niedrigbau). WICHTIG: oppervlakte_max ist
// nur die GRÖSSTE Einheit, nicht die Gesamtfläche → Fläche/Footprint überschätzt
// Groß-/Industriebauten massiv. Darum: Nicht-Wohnen = Typ-Höhe (keine Inflation),
// Wohnen = aus Wohnungszahl (Mehrfamilien) bzw. Fläche (Einfamilien), hart gedeckelt.
const NONRES_H={off:14,ret:6,ind:8,hea:14,edu:9,asm:8,hot:18,spo:9,oth:5,'':3};
function heightFor(b,fp){
  if(b.u==='res'){
    let floors;
    if(b.n>1 && fp>20){ const upf=Math.max(1,Math.round(fp/95)); floors=Math.round(b.n/upf); } // Mehrfamilien: Wohnungen/Geschoss
    else if(b.a && fp>15){ floors=Math.round(b.a/fp); }                                          // Einfamilien: Gesamtfläche
    else floors=2;
    floors=Math.max(1,Math.min(16,floors));   // Deckel: ~50 m (Utrecht-Türme), killt Fake-Hochhäuser
    return +(floors*3.1).toFixed(1);
  }
  return NONRES_H[b.u] ?? 6;   // Nicht-Wohnen: feste Typ-Höhe, kein Footprint-Aufblähen
}

// ─── Gitter-Index für Nachbarsuche ───────────────────────────────────────
function gridIndex(pts,cell){const idx=new Map();for(const p of pts){const k=Math.round(p[0]/cell)+'_'+Math.round(p[1]/cell);(idx.get(k)||idx.set(k,[]).get(k)).push(p);}return {idx,cell};}
function nearest({idx,cell},lon,lat){let best=null,bd=1e9;for(let r=0;r<=4&&!best;r++){for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(r>0&&Math.abs(dx)<r&&Math.abs(dy)<r)continue;const arr=idx.get((Math.round(lon/cell)+dx)+'_'+(Math.round(lat/cell)+dy));if(!arr)continue;for(const p of arr){const d=((p[0]-lon)*MLON)**2+((p[1]-lat)*MLAT)**2;if(d<bd){bd=d;best=p;}}}}return {p:best,dist:Math.sqrt(bd)};}

const heatSrc=JSON.parse(fs.readFileSync(SRC+'heat_field_src_utr.geojson','utf8')).features
  .map(f=>{const c=centroid(f.geometry.coordinates[0]);return [c[0],c[1],f.properties.lst_delta,f.properties.green_dist_m];});
const heatIdx=gridIndex(heatSrc,0.004);
console.log('Hitze-Quellpunkte:',heatSrc.length);
const ww=JSON.parse(fs.readFileSync(L+'waterways_utr.geojson','utf8')).features;
const wpts=[];(function(){for(const f of ww){const walk=a=>{if(typeof a[0]==='number')wpts.push([a[0],a[1]]);else a.forEach(walk);};walk(f.geometry.coordinates);}})();
const waterIdx=gridIndex(wpts,0.003);
console.log('Wasser-Stützpunkte:',wpts.length);

function heatClass(d){return d>=2.3?'high':d>=1.2?'medium':'low';}
function floodClass(m){return m<25?'high':m<70?'medium':m<160?'low':null;}

// ─── Verarbeitung ────────────────────────────────────────────────────────
const all=[];
let analyzed=0,ancillary=0,tiny=0;
for(const b of raw){
  let ring=b.g; if(!ring||ring.length<4) continue;
  const fpFull=areaM2(ring);
  ring=dp(ring);
  const c=centroid(ring);
  const h=heightFor(b,fpFull);
  const co2=co2PerM2(b.y,b.u);
  const hn=nearest(heatIdx,c[0],c[1]);
  const lst=hn.p?+hn.p[2].toFixed(1):0, grn=hn.p?Math.round(hn.p[3]):60;
  const wd=nearest(waterIdx,c[0],c[1]).dist;
  const flood=floodClass(wd);
  if(co2==null) ancillary++; else analyzed++;
  all.push({g:ring, fp:Math.round(fpFull), h, y:b.y, u:b.u, era:era(b.y), co2, lst, grn, flood, fd:Math.round(wd)});
}
console.log('verarbeitet:',all.length,'| analysiert:',analyzed,'| Nebengebäude:',ancillary);

// CO2-Verteilung (Perzentile) zur Farb-Kalibrierung
const cvals=all.filter(b=>b.co2!=null).map(b=>b.co2).sort((a,b)=>a-b);
const pct=q=>cvals[Math.floor(q*cvals.length)];
console.log('CO2 kg/m² Perzentile: p10='+pct(.1)+' p30='+pct(.3)+' p50='+pct(.5)+' p70='+pct(.7)+' p90='+pct(.9)+' max='+cvals[cvals.length-1]);

// 1) 3D-Vollkontext: alle „echten" Gebäude (Footprint ≥12 m² → ohne Gartenschuppen)
const ctx=all.filter(b=>b.fp>=12);
const bag3d=ctx.map(b=>({g:b.g,h:b.h,co2:b.co2,lst:b.lst,flood:b.flood,era:b.era,u:b.u}));
fs.writeFileSync(L+'bag_utr.json', JSON.stringify(bag3d));
console.log('→ bag_utr.json',ctx.length,'Gebäude,',(fs.statSync(L+'bag_utr.json').size/1e6).toFixed(1),'MB');

// 2D: gekappt auf größte Gebäude (Performance; Löcher bei Übersichts-Zoom subpixel)
function gj(features){return {type:'FeatureCollection',features};}
function poly(ring,props){return {type:'Feature',geometry:{type:'Polygon',coordinates:[ring]},properties:props};}
const byArea=[...all].sort((a,b)=>b.fp-a.fp);
const CAP=20000; // 2D-Leaflet-Performance (alt: 8.000); 3D nutzt alle Gebäude

// 2) 2D CO2 (nur analysierte)
const co2Set=byArea.filter(b=>b.co2!=null).slice(0,CAP);
fs.writeFileSync(L+'co2_buildings_utr.geojson', JSON.stringify(gj(co2Set.map(b=>poly(b.g,{
  building:b.u, age_class:b.era, co2_kg_m2:b.co2, lst_delta:b.lst, heat_class:heatClass(b.lst), green_dist_m:b.grn})))));
console.log('→ co2_buildings_utr.geojson',co2Set.length);

// 3) 2D Hitze (alle, gekappt)
const heatSet=byArea.slice(0,CAP);
fs.writeFileSync(L+'heat_exposure_utr.geojson', JSON.stringify(gj(heatSet.map(b=>poly(b.g,{
  building:b.u, lst_delta:b.lst, heat_class:heatClass(b.lst), green_dist_m:b.grn})))));
console.log('→ heat_exposure_utr.geojson',heatSet.length);

// 4) 2D Hochwasser (konsistent) — nach Risiko priorisiert (alle high+medium, dann low), gekappt
const RANK={high:0,medium:1,low:2};
const floodSet=byArea.filter(b=>b.flood).sort((a,b)=>RANK[a.flood]-RANK[b.flood]).slice(0,CAP);
fs.writeFileSync(L+'flood_exposure_utr.geojson', JSON.stringify(gj(floodSet.map(b=>poly(b.g,{
  building:b.u, flood_risk:b.flood, flood_dist_m:b.fd, lst_delta:b.lst, heat_class:heatClass(b.lst), green_dist_m:b.grn})))));
console.log('→ flood_exposure_utr.geojson',floodSet.length);

const ages={};all.forEach(b=>ages[b.era]=(ages[b.era]||0)+1);
console.log('\nBaualter (ECHT):',JSON.stringify(ages));
const fr={};all.forEach(b=>{if(b.flood)fr[b.flood]=(fr[b.flood]||0)+1;});
console.log('Hochwasser-Klassen:',JSON.stringify(fr));
