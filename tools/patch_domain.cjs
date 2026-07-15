// Domain-Umzug: Pfade domain-unabhängig (github.io behält /urbanlens, sonst Root)
// + Zitat-/Methodik-URLs auf inspector.nicehere.nl
const fs=require('fs');
let n=0;
function repIn(file,a,b){let h=fs.readFileSync(file,'utf8');if(h.indexOf(a)<0){console.error('MISS '+file+': '+a.slice(0,70));process.exitCode=1;return;}fs.writeFileSync(file,h.split(a).join(b));n++;}

const GH="(location.hostname==='leoorexx.github.io'?'/urbanlens':'')";

// index.html
repIn('index.html',
 "const DATA_BASE=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'data/layers':'/urbanlens/data/layers';",
 "const DATA_BASE="+GH+"+'/data/layers';");
repIn('index.html','fetch(`/urbanlens/data/layers/${f}`)','fetch(`${DATA_BASE}/${f}`)');
repIn('index.html','fetch(`/urbanlens/data/layers/${filename}`)','fetch(`${DATA_BASE}/${filename}`)');
repIn('index.html',
 "geojson:(location.hostname==='localhost'||location.hostname==='127.0.0.1'?'data/layers/stadtteile_ffm.geojson':'/urbanlens/data/layers/stadtteile_ffm.geojson')",
 "geojson:"+GH+"+'/data/layers/stadtteile_ffm.geojson'");
repIn('index.html',
 'geojson:"/urbanlens/data/layers/wijken_utrecht.geojson"',
 "geojson:"+GH+"+'/data/layers/wijken_utrecht.geojson'");

// dashboard.html
repIn('public/dashboard.html',
 "const DATA_BASE=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'data':'/urbanlens/data';",
 "const DATA_BASE="+GH+"+'/data';");

// Zitate & Methodik-Verweise → neue Domain (4 Stellen)
['index.html','index.html','public/dashboard.html','public/methodik.html'].forEach(()=>{});
[['index.html'],['public/dashboard.html'],['public/methodik.html']].forEach(([f])=>{
  let h=fs.readFileSync(f,'utf8');
  const c=h.split('leoorexx.github.io/urbanlens/methodik.html').length-1;
  if(c>0){h=h.split('leoorexx.github.io/urbanlens/methodik.html').join('inspector.nicehere.nl/methodik.html');fs.writeFileSync(f,h);n+=c;}
});

// QA-Stubs: relative Fetches (test.local/data/…) auf lokale Dateien mappen
const OLD="let f=null;if(u.includes('/_d/data/layers/'))";
const NEW="let f=null;if(u.includes('test.local/data/layers/'))f='public/data/layers/'+u.split('test.local/data/layers/')[1].split('?')[0];else if(u.includes('test.local/data/'))f='public/data/'+u.split('test.local/data/')[1].split('?')[0];else if(u.includes('/_d/data/layers/'))";
let qn=0;
fs.readdirSync('.').filter(x=>/^qa_.*\.cjs$/.test(x)).forEach(f=>{
  let h=fs.readFileSync(f,'utf8');
  if(h.indexOf(OLD)>=0&&h.indexOf('test.local/data/layers/')<0){fs.writeFileSync(f,h.split(OLD).join(NEW));qn++;}
});
console.log('OK — '+n+' Code-Ersetzungen, '+qn+' QA-Stubs erweitert');
