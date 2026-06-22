// Heimische Arten Utrecht via GBIF: häufigste Arten im Bereich, gruppiert,
// mit wissenschaftlichem + niederländischem/deutschem Namen.
// → public/data/layers/biodiv_utr.json
const fs=require('fs');
const BBOX='decimalLatitude=52.04,52.14&decimalLongitude=5.05,5.20&hasCoordinate=true';
const GROUP=(k,cl)=>{
  if(cl==='Aves')return 'birds';
  if(cl==='Mammalia')return 'mammals';
  if(cl==='Insecta')return 'insects';
  if(cl==='Amphibia'||cl==='Reptilia')return 'herps';
  if(k==='Plantae')return 'plants';
  if(k==='Fungi')return 'fungi';
  return null;
};
async function jget(u,tries=3){for(let t=0;t<tries;t++){try{const r=await fetch(u,{signal:AbortSignal.timeout(25000)});if(r.ok)return await r.json();}catch(e){}await new Promise(r=>setTimeout(r,600));}return null;}
(async()=>{
  const fc=await jget(`https://api.gbif.org/v1/occurrence/search?${BBOX}&limit=0&facet=speciesKey&facetLimit=220&facetMincount=150`);
  const counts=(fc&&fc.facets&&fc.facets[0]&&fc.facets[0].counts)||[];
  console.log('Arten-Kandidaten:',counts.length,'| Gesamtbeobachtungen:',fc&&fc.count);
  const byGroup={birds:[],mammals:[],insects:[],herps:[],plants:[],fungi:[]};
  let done=0;
  for(let i=0;i<counts.length;i+=6){
    const batch=counts.slice(i,i+6);
    await Promise.all(batch.map(async ({name:key,count})=>{
      const sp=await jget(`https://api.gbif.org/v1/species/${key}`); if(!sp||sp.rank!=='SPECIES')return;
      const grp=GROUP(sp.kingdom,sp.class); if(!grp||byGroup[grp].length>=12)return;
      const vn=await jget(`https://api.gbif.org/v1/species/${key}/vernacularNames?limit=60`);
      const find=l=>{const v=(vn&&vn.results||[]).find(x=>x.language===l);return v?v.vernacularName:null;};
      byGroup[grp].push({key,sci:sp.canonicalName||sp.scientificName,nl:find('nld'),de:find('deu'),en:find('eng'),obs:count});
    }));
    done+=batch.length; if(done%30===0)console.log('  …',done,'/',counts.length);
  }
  // je Gruppe nach Beobachtungen sortieren, top 10
  for(const g in byGroup)byGroup[g]=byGroup[g].sort((a,b)=>b.obs-a.obs).slice(0,10);
  const out={area:'Utrecht', total:fc&&fc.count, source:'GBIF', groups:byGroup};
  fs.writeFileSync('public/data/layers/biodiv_utr.json',JSON.stringify(out));
  console.log('FERTIG → biodiv_utr.json',Object.entries(byGroup).map(([g,a])=>g+':'+a.length).join(' '));
})();
