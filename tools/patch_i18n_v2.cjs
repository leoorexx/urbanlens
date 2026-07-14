#!/usr/bin/env node
// i18n v2: kw-Quellen, Restsegmente, &amp;-Varianten, Re-localize-Hooks.
const fs=require('fs');
let h=fs.readFileSync('index.html','utf8');
let n=0;const rep=(a,b,l)=>{if(h.includes(a)){h=h.split(a).join(b);n++;}else console.log('⚠',l||String(a).slice(0,60));};

// kw-Strings in Quellreihenfolge (aus kw.txt)
const kw=[...new Set([...h.matchAll(/kw:"([^"]{8,})"/g)].map(m=>m[1]))];
const KWEN=[
"FFM parks dept.: ~€3,000/tree. Reference: FFM tree-protection programme 2022.",
"Landscaping association: €120–180/m² depending on system. Reference: Grüne Meile Frankfurt.",
"FFM utilities: sewer rate €95/m². Construction: ~€100/m² de-sealing incl. planting.",
"Reference: Hesse green-roof programme 2023. Cost €80–150/m² by build-up.",
"Hesse forestry: ~€7,000/ha installation + €3,000/ha/yr care. 5 ha reference project.",
"Reference project Kühlmeile Munich 2023: ~€180,000, adjusted +10% Frankfurt wage level.",
"FIS BMVI: avg €12,000–18,000/street from 12 German cities.",
"RMV operating costs 2024: ~€600k/bus/yr + €400k vehicle investment, amortised over 12 yrs.",
"FFM public-order office: signage + bollards ~€6,000–10,000 per school. Closed 3h daily.",
"BW transport ministry: avg €600k–1.2m/km cycle highway incl. marking, lighting, drainage.",
"FFM social report 2023: 2 staff posts (€58k), rent €14k, equipment €8k.",
"2 staff posts (€58k), rent €24k, interpreters €14k, IT €8k, translators €16k.",
"FFM youth office: €40k one-off equipment + €40k/yr staffing. Rent not included.",
"Federal grid agency 2024: ~€700/kWp installation. 500 kWp = €350,000. Payback ~8 yrs.",
"Netatmo/Luftdaten.info: ~€800/sensor × 50 = €40,000 + €5,000 installation and platform.",
"Fraunhofer IBP 2023: market cost of shading installations €3,500–5,500/unit incl. foundation and mounting.",
"BBSR study 'Urban de-sealing as climate adaptation' (2023): removal + replanting €75–95/m². 2,000 m² = €180k.",
"WHO Europe 'Heat and Health' (2023): drinking fountains ~€2,500/unit, misting systems ~€8,000/site.",
"JRC EU 'Cool Surfaces for Urban Heat Islands' (2022): light surfaces, albedo effect, €85–110/m² incl. installation.",
"WHO heat action plan Europe 2023: identification, signage, extended opening + air conditioning ~€20–25k/building.",
"HLNUG + DWD climate atlas: licences + analysis ~€25k. Own sensors (20 stations): ~€100k.",
"Reference: Frankfurt housing fund 2024 · avg €2,500/m² purchase+renovation · 1,000 m² pilot volume.",
"1 staff post (€62k) + legal-advice budget €18k + outreach €10k.",
"Reference: participatory budget Eberswalde, district budgets Berlin-Lichtenberg (€250k/district/yr).",
"Open-source platform (decidim/CONSUL): hosting+customisation €25k + moderation €40k/yr.",
"20 IoT level sensors (€2k each) + KATWARN/NINA integration €30k + operation €15k/yr.",
"3 sites × €100k (30 kWp PV + 60 kWh storage + backup distribution). Reference: BBK lighthouse concept.",
"FFM parks dept.: conversion €2–3/m² one-off, then −40% maintenance (2 instead of 8 mowings).",
"City of Barcelona Superilla: avg €400–600k/block. Darmstadt + Berlin pilots 2024 comparable.",
"CROW design guideline 'Duurzaam Veilig' · Utrecht mobility plan 'Slimme Routes, Slim Regelen, Slim Bestemmen'.",
"Steenbreek programme / NK Tegelwippen · every de-sealed surface relieves the combined sewer (Waterschap HDSR).",
"Native species support local food chains (carder bee, hedgehog, birds). NDFF/GBIF records as species base.",
"Klimaatadaptatie Utrecht · Waterschap HDSR storage standard · NBS retention instead of sewer expansion.",
"UBA/JRC: cool pavements lower surface temperature by 5–10 °C · permeable paving (light concrete, drainage bed)."];
const KWNL=[
"Groenbeheer FFM: ~€3.000/boom. Referentie: boombeschermingsprogramma FFM 2022.",
"Brancheorganisatie groenbouw: €120–180/m² per systeem. Referentie: Grüne Meile Frankfurt.",
"Stadswerken FFM: riooltarief €95/m². Aanleg: ~€100/m² ontharding incl. beplanting.",
"Referentie: Hessisch groendakprogramma 2023. Kosten €80–150/m² per opbouw.",
"Bosbeheer Hessen: ~€7.000/ha aanleg + €3.000/ha/jr onderhoud. 5 ha referentieproject.",
"Referentieproject Kühlmeile München 2023: ~€180.000, aangepast +10% loonniveau Frankfurt.",
"FIS BMVI: gem. €12.000–18.000/straat uit 12 Duitse steden.",
"RMV-exploitatie 2024: ~€600k/bus/jr + €400k voertuiginvestering, afgeschreven over 12 jr.",
"Handhaving FFM: bebording + palen ~€6.000–10.000 per school. Dagelijks 3u afgesloten.",
"Ministerie BW: gem. €600k–1,2 mln/km snelfietsroute incl. markering, verlichting, afwatering.",
"Sociaal rapport FFM 2023: 2 fte (€58k), huur €14k, inrichting €8k.",
"2 fte (€58k), huur €24k, tolken €14k, IT €8k, vertalers €16k.",
"Jeugdzorg FFM: €40k eenmalig inrichting + €40k/jr personeel. Huur niet inbegrepen.",
"Bundesnetzagentur 2024: ~€700/kWp installatie. 500 kWp = €350.000. Terugverdientijd ~8 jr.",
"Netatmo/Luftdaten.info: ~€800/sensor × 50 = €40.000 + €5.000 installatie en platform.",
"Fraunhofer IBP 2023: marktkosten schaduwinstallaties €3.500–5.500/stuk incl. fundering en montage.",
"BBSR-studie 'Urbane ontharding als klimaatadaptatie' (2023): verwijdering + herbeplanting €75–95/m². 2.000 m² = €180k.",
"WHO Europa 'Heat and Health' (2023): drinkfonteinen ~€2.500/stuk, vernevelinstallaties ~€8.000/locatie.",
"JRC EU 'Cool Surfaces for Urban Heat Islands' (2022): lichte verharding, albedo-effect, €85–110/m² incl. aanleg.",
"WHO-hitteplan Europa 2023: aanwijzing, bebording, ruimere openingstijden + airco ~€20–25k/gebouw.",
"HLNUG + DWD-klimaatatlas: licenties + analyse ~€25k. Eigen sensoren (20 stations): ~€100k.",
"Referentie: woningfonds Frankfurt 2024 · gem. €2.500/m² aankoop+renovatie · 1.000 m² pilot.",
"1 fte (€62k) + budget juridisch advies €18k + communicatie €10k.",
"Referentie: burgerbegroting Eberswalde, wijkbudgetten Berlin-Lichtenberg (€250k/wijk/jr).",
"Open-sourceplatform (decidim/CONSUL): hosting+maatwerk €25k + moderatie €40k/jr.",
"20 IoT-peilsensoren (€2k/stuk) + KATWARN/NINA-integratie €30k + beheer €15k/jr.",
"3 locaties × €100k (30 kWp PV + 60 kWh opslag + noodstroomverdeling). Referentie: BBK-concept.",
"Groenbeheer FFM: omvorming €2–3/m² eenmalig, daarna −40% onderhoud (2 i.p.v. 8 maaibeurten).",
"Barcelona Superilla: gem. €400–600k/blok. Darmstadt + Berlijnse pilots 2024 vergelijkbaar.",
"CROW-ontwerprichtlijn 'Duurzaam Veilig' · Utrecht mobiliteitsplan 'Slimme Routes, Slim Regelen, Slim Bestemmen'.",
"Programma Steenbreek / NK Tegelwippen · elke ontharde m² ontlast het gemengde riool (Waterschap HDSR).",
"Inheemse soorten dragen lokale voedselketens (akkerhommel, egel, vogels). NDFF/GBIF-waarnemingen als soortenbasis.",
"Klimaatadaptatie Utrecht · HDSR-bergingsnorm (bui bergen) · NBS-retentie in plaats van rioolverzwaring.",
"UBA/JRC: cool pavements verlagen oppervlaktetemperatuur 5–10 °C · waterpasserende verharding (lichte betonstenen, drainagebed)."];
if(kw.length!==KWEN.length||kw.length!==KWNL.length){console.log('❌ kw-Längen',kw.length,KWEN.length,KWNL.length);process.exit(1);}
const add={};kw.forEach((k,i)=>{add[k]={en:KWEN[i],nl:KWNL[i]};});

Object.assign(add,{
"Methodik angelehnt an Deutsche Umwelthilfe Hitze-Check 2026 (Versiegelung · Grünvolumen · Oberflächentemperatur) — von nice here auf Stadtteilebene heruntergebrochen. DUH bewertet nur Gesamtstädte.":{en:"Methodology adapted from the German Environmental Aid (DUH) heat check 2026 (sealing · green volume · surface temperature) — scaled down to district level by nice here. DUH only rates whole cities.",nl:"Methodiek ontleend aan de DUH-hittecheck 2026 (verharding · groenvolume · oppervlaktetemperatuur) — door nice here teruggeschaald naar wijkniveau. DUH beoordeelt alleen hele steden."},
"Konfidenz & Datenstand je Dimension siehe Tab „Dimensionen\". Vollständige Methodik & Quellen auf der ":{en:"Confidence & data vintage per dimension: see the “Dimensions” tab. Full methodology & sources on the ",nl:"Betrouwbaarheid & datastand per dimensie: zie tab “Dimensies”. Volledige methodiek & bronnen op de "},
"Methodikseite":{en:"methodology page",nl:"methodiekpagina"},
"Maßnahmen nach Hotspot-Typ":{en:"Measures by hotspot type",nl:"Maatregelen per hotspottype"},
"Hohe Strahlungsbelastung (+":{en:"High radiant load (+",nl:"Hoge stralingsbelasting (+"},
"°C LST) — Verschattung + Kühlung":{en:"°C LST) — shading + cooling",nl:"°C LST) — schaduw + koeling"},
"Vulnerable Bevölkerungsgruppen — Präventiver Hitzeschutz":{en:"Vulnerable population groups — preventive heat protection",nl:"Kwetsbare groepen — preventieve hittebescherming"},
"Hitzeschutz — Priorität":{en:"Heat protection — priority",nl:"Hittebescherming — prioriteit"},
"MITTEL":{en:"MEDIUM",nl:"GEMIDDELD"},"HOCH":{en:"HIGH",nl:"HOOG"},"NIEDRIG":{en:"LOW",nl:"LAAG"},
"% versiegelt":{en:"% sealed",nl:"% verhard"},
"Erhöht":{en:"Elevated",nl:"Verhoogd"},
"Zitat":{en:"Cite",nl:"Citaat"},
"Weitere Maßnahmen nach NICE-Score":{en:"Further measures by NICE score",nl:"Verdere maatregelen naar NICE-score"},
"Stadtteil-Bericht (PDF)":{en:"District report (PDF)",nl:"Wijkrapport (PDF)"},
" von nice here":{en:" by nice here",nl:" door nice here"}
});

// TR erweitern (an denselben Anker)
const ser=Object.entries(add).map(([k,v])=>JSON.stringify(k)+':{"en":'+JSON.stringify(v.en)+',"nl":'+JSON.stringify(v.nl)+'}').join(',');
rep('const TR_KEYS=','Object.assign(TR,{'+ser+'});\n// &-Keys zusätzlich als &amp;-Variante (innerHTML enkodiert &)\nObject.keys(TR).forEach(k=>{if(k.indexOf("&")>=0){const k2=k.split("&").join("&amp;");if(!TR[k2])TR[k2]=TR[k];}});\nconst TR_KEYS=','TR-Anker v2');

// Re-localize: bei Tab-Wechsel + verzögerter Sicherheitspass (asynchron gebaute Inhalte)
rep("function showTab(","function showTab(i){try{setTimeout(()=>{const p=document.getElementById('tp'+i);if(p&&typeof localize==='function')p.innerHTML=localize(p.innerHTML);},50);}catch(e){} return _showTab(i);}\nfunction _showTab(",'showTab wrap');
rep("['tp0','tp1','tp2','tp3','tp4','dRisks','dExplain'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=localize(el.innerHTML);});",
    "const __loc=()=>['tp0','tp1','tp2','tp3','tp4','dRisks','dExplain','dAlert'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=localize(el.innerHTML);}); __loc(); setTimeout(__loc,700);",'localize-Pass');

fs.writeFileSync('index.html',h);
console.log('v2: '+n+' Patches · TR +'+Object.keys(add).length);
