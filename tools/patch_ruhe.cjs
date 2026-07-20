// Design-Paket 3 · Ruhe-Pass: eine Schattenstufe (+Modal), Rundungs-Skala,
// Schriftgrößen-Rampe ohne .5-Zwischenschritte, Challenge-Farbtokens,
// Rot nur für kritische Zustände (Gesundheits-Marker → Violett), Emoji raus.
const fs=require('fs');
let n=0;
function repF(file,a,b,all){let h=fs.readFileSync(file,'utf8');if(h.indexOf(a)<0){console.error('MISS '+file+': '+a.slice(0,70));process.exitCode=1;return;}h=h.split(a).join(b);fs.writeFileSync(file,h);n++;}
function repOpt(file,a,b){let h=fs.readFileSync(file,'utf8');if(h.indexOf(a)<0)return;h=h.split(a).join(b);fs.writeFileSync(file,h);n++;}

// ── 1 · Tokens: eine Schattenstufe + Modal-Schatten + Challenge-Farben ──
repF('index.html','--sh:0 1px 2px rgba(0,0,0,0.05)','--sh:0 3px 14px rgba(0,0,0,0.10)');
repF('index.html','--shl:0 3px 14px rgba(0,0,0,0.10);',
 '--shl:0 3px 14px rgba(0,0,0,0.10);--shm:0 18px 50px rgba(0,0,0,0.22);--c-heat:#f97316;--c-water:#2563eb;--c-green:#16a34a;--c-soc:#7c3aed;--c-mob:#0ea5e9;--c-energy:#eab308;');

// ── 2 · Streuschatten → Tokens (dunkle 3D-Overlays bleiben) ──
repF('index.html','box-shadow:0 4px 16px rgba(0,0,0,0.1)','box-shadow:var(--shl)');
repF('index.html','box-shadow:0 2px 8px rgba(0,0,0,0.1)!important','box-shadow:var(--shl)!important');
repF('index.html','box-shadow:0 2px 16px rgba(0,0,0,0.08)','box-shadow:var(--shl)');
repF('index.html','box-shadow:0 2px 12px rgba(0,0,0,.07)','box-shadow:var(--shl)');
repF('index.html','box-shadow:0 1px 3px rgba(0,0,0,0.2)','box-shadow:var(--sh)');
repF('index.html','box-shadow:0 24px 70px rgba(0,0,0,0.35)','box-shadow:var(--shm)');
repF('index.html','box-shadow:0 14px 44px rgba(0,0,0,.16)','box-shadow:var(--shm)');
repF('index.html','box-shadow:0 6px 24px rgba(0,0,0,.3)','box-shadow:var(--shm)');

// ── 3 · Rundungs-Skala: {2,3,4}→4 · {6,7,8}→8 · {9,10,11}→10 · {12,13,14}→12 · {16,17}→16 ──
const RAD=[['border-radius:2px','border-radius:4px'],['border-radius:3px','border-radius:4px'],
 ['border-radius:6px','border-radius:8px'],['border-radius:7px','border-radius:8px'],
 ['border-radius:9px','border-radius:10px'],['border-radius:11px','border-radius:10px'],
 ['border-radius:13px','border-radius:12px'],['border-radius:14px','border-radius:12px'],
 ['border-radius:17px','border-radius:16px']];
['index.html','public/dashboard.html'].forEach(f=>RAD.forEach(([a,b])=>repOpt(f,a,b)));

// ── 4 · Schrift-Rampe: .5-Zwischenschritte auf ganze Stufen (leicht größer) ──
const FS=[['font-size:7.5px','font-size:8px'],['font-size:8.5px','font-size:9px'],
 ['font-size:9.5px','font-size:10px'],['font-size:10.5px','font-size:11px'],
 ['font-size:11.5px','font-size:12px'],['font-size:12.5px','font-size:13px'],
 ['font-size:13.5px','font-size:14px'],['font-size:17.5px','font-size:18px']];
['index.html','public/dashboard.html'].forEach(f=>FS.forEach(([a,b])=>repOpt(f,a,b)));

// ── 5 · Rot nur kritisch: Gesundheits-Marker → Violett-Familie, Emoji raus ──
repF('index.html',"hospital:{color:'#7f1d1d',size:9","hospital:{color:'#4c1d95',size:9");
repF('index.html',"clinic:{color:'#b91c1c',size:7","clinic:{color:'#6d28d9',size:7");
repF('index.html',"doctors:{color:'#dc2626',size:6,label:'⚕️ Hausarzt'}","doctors:{color:'#7c3aed',size:6,label:'<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:-2px\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><path d=\"M12 8v8M8 12h8\"/></svg> Hausarzt'}");
repF('index.html',"pharmacy:{color:'#ef4444',size:5","pharmacy:{color:'#8b5cf6',size:5");
repF('index.html',"out:'tags center qt',color:'#dc2626',r:6,  cap:2000","out:'tags center qt',color:'#7c3aed',r:6,  cap:2000");
repF('index.html'," health:{t:'Gesundheit',i:[['#dc2626','Standort']]}"," health:{t:'Gesundheit',i:[['#7c3aed','Standort']]}");
repF('index.html'," osm_health:{t:'Gesundheit (live)',i:[['#dc2626','Standort']]}"," osm_health:{t:'Gesundheit (live)',i:[['#7c3aed','Standort']]}");

console.log('OK — '+n+' Ersetzungen');
