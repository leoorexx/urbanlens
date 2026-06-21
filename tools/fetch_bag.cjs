// Lädt ALLE BAG-Gebäude (PDOK WFS) im Utrecht-Analysebereich.
// PDOK deckelt startIndex bei 50000 → BBox in 4×4 Kacheln teilen, jede ab 0 paginieren.
// Kompaktformat: {y:bouwjaar, u:nutzungscode, a:flaeche, n:einheiten, g:ring[ [lon,lat]@5dec ]}
const fs = require('fs');
const S=52.0389, W=5.0495, N=52.1401, E=5.2003;
const NX=4, NY=4, PAGE=1000;
const BASE='https://service.pdok.nl/lv/bag/wfs/v2_0';
const USE={woonfunctie:'res',kantoorfunctie:'off',winkelfunctie:'ret',industriefunctie:'ind',
  gezondheidszorgfunctie:'hea',onderwijsfunctie:'edu',bijeenkomstfunctie:'asm',
  logiesfunctie:'hot',sportfunctie:'spo','overige gebruiksfunctie':'oth'};
function useCode(g){if(!g)return '';const parts=String(g).split(',').map(s=>s.trim());
  if(parts.includes('woonfunctie'))return 'res';for(const p of parts)if(USE[p])return USE[p];return 'oth';}
function tileURL(s,w,n,e,start){
  const q=new URLSearchParams({service:'WFS',version:'2.0.0',request:'GetFeature',typeNames:'bag:pand',
    count:String(PAGE),startIndex:String(start),outputFormat:'application/json',srsName:'EPSG:4326',
    bbox:`${s},${w},${n},${e},EPSG:4326`});
  return BASE+'?'+q;
}
async function getPage(s,w,n,e,start,tries=3){
  for(let t=0;t<tries;t++){try{
    const r=await fetch(tileURL(s,w,n,e,start),{signal:AbortSignal.timeout(40000)});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return (await r.json()).features||[];
  }catch(err){if(t===tries-1)throw err;await new Promise(r=>setTimeout(r,1500));}}
}
function compact(f){
  const p=f.properties,geo=f.geometry;if(!geo)return null;
  let ring=geo.type==='Polygon'?geo.coordinates[0]:geo.type==='MultiPolygon'?geo.coordinates[0][0]:null;
  if(!ring||ring.length<4)return null;
  ring=ring.map(c=>[+c[0].toFixed(5),+c[1].toFixed(5)]);
  return {id:p.identificatie, y:p.bouwjaar||null, u:useCode(p.gebruiksdoel),
          a:p.oppervlakte_max||p.oppervlakte_min||null, n:p.aantal_verblijfsobjecten||0, g:ring};
}
(async()=>{
  const seen=new Set(), out=[];
  for(let ix=0;ix<NX;ix++)for(let iy=0;iy<NY;iy++){
    const w=W+(E-W)*ix/NX, e=W+(E-W)*(ix+1)/NX, s=S+(N-S)*iy/NY, n=S+(N-S)*(iy+1)/NY;
    let start=0, got=0;
    while(true){
      let feats;
      try{feats=await getPage(s,w,n,e,start);}catch(err){console.error(`Kachel ${ix},${iy} @${start} FEHLER`,err.message);break;}
      if(feats.length===0)break;           // erschöpft (PDOK liefert ~990/Seite, nicht exakt PAGE)
      for(const f of feats){const c=compact(f);if(!c)continue;if(seen.has(c.id))continue;seen.add(c.id);delete c.id;out.push(c);got++;}
      start+=feats.length;                 // um tatsächlich gelieferte Anzahl weiter (keine Lücken)
      if(start>=49000){console.error(`Kachel ${ix},${iy} >49k — zu dicht!`);break;}
    }
    console.log(`Kachel ${ix},${iy}: +${got} (gesamt ${out.length})`);
  }
  fs.mkdirSync('tools/_src',{recursive:true});
  fs.writeFileSync('tools/_src/bag_utr_raw.json',JSON.stringify(out));
  console.log(`FERTIG: ${out.length} eindeutige Gebäude, ${(fs.statSync('tools/_src/bag_utr_raw.json').size/1e6).toFixed(1)} MB`);
})();
