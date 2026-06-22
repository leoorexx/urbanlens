// Lädt Daseinsvorsorge-/Kreislauf-POIs (OSM Overpass) für den Utrecht-Bereich
// und schreibt public/data/layers/daseinsvorsorge_utr.json (kompakt).
// Kategorien: repair, reuse, milieu (Recyclinghof), recycling (Container), waste.
const fs=require('fs');
const CITY=process.argv[2]||'utr';
const BBOX={utr:'52.0389,5.0495,52.1401,5.2003',ffm:'50.0152,8.4728,50.2271,8.8004'};
const BB=BBOX[CITY];
const Q=`[out:json][timeout:90];(
  nwr["shop"="repair"](${BB});
  nwr["craft"~"^(electronics_repair|shoemaker|tailor|watchmaker|saddler|key_cutter|bookbinder)$"](${BB});
  nwr["amenity"="bicycle_repair_station"](${BB});
  nwr["service:bicycle:repair"="yes"](${BB});
  nwr["amenity"="recycling"](${BB});
  nwr["amenity"="waste_disposal"](${BB});
  nwr["shop"="second_hand"](${BB});
  nwr["shop"="charity"](${BB});
);out center tags 6000;`;
function pos(e){return e.type==='node'?[e.lat,e.lon]:(e.center?[e.center.lat,e.center.lon]:null);}
function cat(t){
  if(t.shop==='repair'||t.craft||t['service:bicycle:repair']==='yes'||t.amenity==='bicycle_repair_station')return 'repair';
  if(t.shop==='second_hand'||t.shop==='charity')return 'reuse';
  if(t.amenity==='recycling')return t.recycling_type==='centre'?'milieu':'recycling';
  if(t.amenity==='waste_disposal')return 'waste';
  return null;}
function mats(t){const m=[];for(const k in t)if(k.startsWith('recycling:')&&t[k]==='yes')m.push(k.slice(10));return m.slice(0,6).join(',');}
const ENDPOINTS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
async function overpass(q){
  for(let t=0;t<6;t++){
    const url=ENDPOINTS[t%ENDPOINTS.length];
    try{
      const r=await fetch(url,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(120000)});
      const txt=await r.text();
      if(r.ok && txt.trim().startsWith('{')) return JSON.parse(txt);
      console.error('  Versuch',t+1,url.split('/')[2],'→',r.status,txt.slice(0,60).replace(/\n/g,' '));
    }catch(e){console.error('  Versuch',t+1,'Fehler',e.message);}
    await new Promise(r=>setTimeout(r,4000));
  }
  throw new Error('Overpass nach Retries nicht erreichbar');
}
(async()=>{
  const j=await overpass(Q);
  const out=[];
  (j.elements||[]).forEach(e=>{const p=pos(e);if(!p||!e.tags)return;const c=cat(e.tags);if(!c)return;
    out.push({y:+p[0].toFixed(5),x:+p[1].toFixed(5),c,n:e.tags.name||'',m:(c==='recycling'?mats(e.tags):undefined)});});
  fs.writeFileSync(`public/data/layers/daseinsvorsorge_${CITY}.json`,JSON.stringify(out));
  const byc={};out.forEach(o=>byc[o.c]=(byc[o.c]||0)+1);
  console.log(`FERTIG (${CITY}):`,out.length,'Punkte →',JSON.stringify(byc));
})();
