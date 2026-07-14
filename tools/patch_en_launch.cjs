#!/usr/bin/env node
// EN-Launch-Patch: English-first Default, Layer-Zeilen i18n, Entwirrung.
const fs=require('fs');
let h=fs.readFileSync('index.html','utf8');
let n=0; const rep=(a,b,label)=>{ if(h.includes(a)){h=h.split(a).join(b);n++;} else console.log('⚠ NICHT GEFUNDEN:',label||a.slice(0,60)); };

// ── 1) Default-Sprache: gespeichert > Browser nl→NL / de→DE > EN ─────────
rep("let lang=localStorage.getItem('ul_lang')||'de';",
    "let lang=localStorage.getItem('ul_lang')||(((navigator.language||'').slice(0,2)==='nl')?'nl':(((navigator.language||'').slice(0,2)==='de')?'de':'en'));",
    'lang default index');

// ── 2) Layer-Zeilen mit data-i18n versehen ───────────────────────────────
const LAYERS=[
 ['lay_duh','DUH Hitze-Ampel (Stadtteile)','DUH heat report card (districts)','DUH hitte-rapport (wijken)'],
 ['lay_tco2','Verkehrs-CO₂ (Emissionen)','Traffic CO₂ (emissions)','Verkeers-CO₂ (emissies)'],
 ['lay_sound','Raumklang (Schallausbreitung)','Soundscape (noise propagation)','Geluidslandschap (geluidsuitbreiding)'],
 ['lay_flood','Hochwasser HQ100 — Gebäude','Flood risk HQ100 — buildings','Overstroming HQ100 — gebouwen'],
 ['lay_heat','Hitzeinsel — Gebäude-Level','Heat island — building level','Hitte-eiland — gebouwniveau'],
 ['lay_noise','Lärmbelastung Straße','Road noise','Verkeerslawaai'],
 ['lay_flight','Fluglärm-Zonen FRA','Aircraft noise zones FRA','Vliegtuiglawaai FRA'],
 ['lay_bike','Radwege (Qualitätsstufen)','Cycle paths (quality levels)','Fietspaden (kwaliteitsniveaus)'],
 ['lay_repair','Reparieren &amp; Wiederverwenden','Repair &amp; reuse','Repareren &amp; hergebruik'],
 ['lay_waste','Entsorgen &amp; Recyceln','Waste &amp; recycling','Afval &amp; recycling'],
 ['lay_biodiv','Heimische Arten (GBIF)','Native species (GBIF)','Inheemse soorten (GBIF)'],
 ['lay_parks','Parks & Grünflächen','Parks & green spaces','Parken & groen'],
 ['lay_schools','Schulen & Kitas','Schools & childcare','Scholen & kinderopvang'],
 ['lay_health','Gesundheitsversorgung','Healthcare','Zorgvoorzieningen'],
 ['lay_community','Community Places','Community places','Buurtplekken'],
 ['lay_trees','Straßenbäume & Alleen','Street trees & avenues','Straatbomen & lanen'],
 ['lay_parking','Parkplätze (MIV-Dominanz)','Parking (car dominance)','Parkeerplaatsen (autodominantie)'],
 ['lay_osm_trees','Bäume (live)','Trees (live)','Bomen (live)'],
 ['lay_osm_drink','Trinkbrunnen (live)','Drinking fountains (live)','Drinkfonteinen (live)'],
 ['lay_osm_bench','Bänke (live)','Benches (live)','Bankjes (live)'],
 ['lay_osm_school','Schulen & Kitas (live)','Schools & childcare (live)','Scholen & opvang (live)'],
 ['lay_osm_health','Gesundheit (live)','Health (live)','Zorg (live)'],
 ['lay_osm_transit','ÖPNV-Haltestellen (live)','Public transport stops (live)','OV-haltes (live)'],
 ['lay_osm_lamp','Beleuchtung (Sicherheitsgefühl)','Lighting (perceived safety)','Verlichting (veiligheidsgevoel)'],
];
for(const [k,de] of LAYERS.map(x=>[x[0],x[1]])){
  const a='</svg> '+de+'</span>';
  const b='</svg> <span data-i18n="'+k+'">'+de+'</span></span>';
  if(h.includes(a)){h=h.split(a).join(b);n++;}
  else console.log('⚠ Layer-Label nicht gefunden:',de);
}
// Dict-Einträge in alle 3 Sprachen (an lay_paw anhängen — existiert je Sprache 1×)
const mkDict=i=>LAYERS.map(x=>x[0]+":'"+x[i].replace(/&amp;/g,'&').replace(/'/g,"\\'")+"'").join(',');
rep("lay_paw:'Pflanzenverfügbares Wasser — Dürre',","lay_paw:'Pflanzenverfügbares Wasser — Dürre',"+mkDict(1)+",",'dict de');
rep("lay_paw:'Plant-available water — drought',","lay_paw:'Plant-available water — drought',"+mkDict(2)+",",'dict en');
rep("lay_paw:'Plantbeschikbaar water — droogte',","lay_paw:'Plantbeschikbaar water — droogte',"+mkDict(3)+",",'dict nl');

// ── 3) Entwirrung: Linsen & Werkzeug umbenennen ─────────────────────────
rep("lens_water:'Wasser'","lens_water:'Hochwasser'");
rep("lens_water:'Water'","lens_water:'Flood'");
rep("lens_water:'Water',lens_noise:'Geluid'","lens_water:'Overstroming',lens_noise:'Geluid'");
rep("lens_life:'Lebensqualität'","lens_life:'Grün & Aufenthalt'");
rep("lens_life:'Livability'","lens_life:'Green & place quality'");
rep("lens_life:'Leefkwaliteit'","lens_life:'Groen & verblijf'");
rep("tool_heat:'Hitze'","tool_heat:'Kühlung'");
rep("tool_heat:'Heat'","tool_heat:'Cooling'");
rep("tool_heat:'Hitte'","tool_heat:'Koeling'");
// statische Fallback-Texte im HTML angleichen
rep('<span data-i18n="tool_heat">Hitze</span>','<span data-i18n="tool_heat">Kühlung</span>');
// DUH-Ampel ist ein deutscher Benchmark → nur Frankfurt zeigen
rep('<div class="lrow" onclick="toggleLayer(\'duh_ampel\')">','<div class="lrow ffm-only" onclick="toggleLayer(\'duh_ampel\')">','duh ffm-only');

// ── 4) FFM-Auto-3D aus (irritierte Erstnutzer) ───────────────────────────
rep(`  // Skyline-Stadt (Frankfurt): beim Wechsel einmal pro Sitzung die 3D-Skyline zeigen
  if(CITY_CFG[c].skyline && !skylineShown){ skylineWanted=true; }
  // sonst: Stadt im 3D-Modus gewechselt → 3D-Modell der neuen Stadt laden
  else if(M3.active&&M3.map){const cc=CITY_CFG[c].center;M3.map.flyTo({center:[cc[1],cc[0]],zoom:15,pitch:55,duration:900});m3load();}`,
`  // Stadt im 3D-Modus gewechselt → 3D-Modell der neuen Stadt laden
  if(M3.active&&M3.map){const cc=CITY_CFG[c].center;M3.map.flyTo({center:[cc[1],cc[0]],zoom:15,pitch:55,duration:900});m3load();}`,'auto-3d switchCity');
rep(`  // Skyline-Stadt per Deep-Link geöffnet → Skyline zeigen (nur wenn kein Intro dazwischenfunkt)
  try{ if(CITY_CFG[startCity].skyline && localStorage.getItem('nh_intro_v1') && !document.body.classList.contains('embed')) skylineWanted=true; }catch(e){}
`,'','auto-3d deeplink');
rep("if(skylineWanted&&cfg.skyline){ skylineWanted=false; setTimeout(showcaseSkyline,650); }\n      ","",'auto-3d loadCity');

// ── 5) Infobox breiter (Lesbarkeit) ──────────────────────────────────────
rep('.right{position:fixed;top:62px;right:10px;bottom:10px;width:320px;','.right{position:fixed;top:62px;right:10px;bottom:10px;width:364px;','drawer width');
rep('transform:translateX(340px);','transform:translateX(388px);','drawer transform');

// ── 6) Score-Erklärung ans Ende der Übersicht (erst Überblick, dann Erklärung) ─
const EXPL=`    <div class="sec">Wie wird der Score berechnet?</div>
    <div class="ibox">
      Der NICE Score = <b>Ø der 8 Dimensionen</b> (je 0–100). Höher = besser. Alle Dimensionen gleichgewichtet.<br><br>
      <b>Kartenfarbe</b>: Quintile im Stadtvergleich — kein absoluter Schwellwert. Rot = unteres Fünftel im Vergleich zu allen Stadtteilen.
    </div>
`;
if(h.includes(EXPL)){ h=h.replace(EXPL,''); h=h.replace('${dailyStory(name,d)}','${dailyStory(name,d)}\n'+EXPL); n++; } else console.log('⚠ Score-Erklärung nicht gefunden');

fs.writeFileSync('index.html',h);
console.log('index.html: '+n+' Patches angewendet');

// ── dashboard.html: Default-Sprache ──────────────────────────────────────
let d=fs.readFileSync('public/dashboard.html','utf8');
const dOld="let lang=localStorage.getItem('ul_lang')||'de';";
if(d.includes(dOld)){d=d.replace(dOld,"let lang=localStorage.getItem('ul_lang')||(((navigator.language||'').slice(0,2)==='nl')?'nl':(((navigator.language||'').slice(0,2)==='de')?'de':'en'));");fs.writeFileSync('public/dashboard.html',d);console.log('dashboard.html: lang default ✓');}
else console.log('⚠ dashboard lang default nicht gefunden');

// ── start.html: Fallback en statt de ─────────────────────────────────────
let s=fs.readFileSync('public/start.html','utf8');
const sOld="let lang=(navigator.language||'de').slice(0,2); if(!T[lang])lang='de';";
if(s.includes(sOld)){s=s.replace(sOld,"let lang=(navigator.language||'en').slice(0,2); if(!T[lang])lang='en';");fs.writeFileSync('public/start.html',s);console.log('start.html: fallback en ✓');}
else console.log('⚠ start fallback nicht gefunden');
