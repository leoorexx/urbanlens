#!/usr/bin/env node
// Vollständige EN/NL-Abdeckung der Karte: TR-Erweiterung + Code-Edits.
const fs=require('fs');
let h=fs.readFileSync('index.html','utf8');
let n=0; const rep=(a,b,lbl)=>{ if(h.includes(a)){h=h.split(a).join(b);n++;} else console.log('⚠ fehlt:',lbl||String(a).slice(0,70)); };

// ── 1) Übersetzungen für die 54 Feld-Strings (Reihenfolge = tr_gap.json) ──
const gap=JSON.parse(fs.readFileSync('/private/tmp/claude-501/-Users-leonardrexhepi/9b11222a-6c67-4dd0-a166-86554a0d3a1f/scratchpad/tr_gap.json','utf8'));
const EN=[
"Surface temperature (LST), NDVI deficit, population vulnerability, surface sealing.",
"PM2.5 + NO₂ (EU AQI, annual mean), noise exposure Lden dB, respiratory-illness rate.",
"Transit frequency (GTFS), cycle-path length per km², 10-minute-city score (34 POIs), crash density.",
"Childcare rate, school drop-out rate, youth unemployment U25, social-assistance rate.",
"Rent-burden ratio (>30% of income), gentrification pressure (5-yr rent rise), overcrowding.",
"Voter turnout (national + municipal), association density, community places per 10,000 residents.",
"NDVI (green share), tree vitality + canopy density, biotope connectivity, water retention.",
"Flood risk HQ100 (area within flood zone), critical infrastructure, fire-service response time.",
"Modal filters, 30 km/h zone and school streets per CROW guideline — through-traffic out, liveability in.",
"Break open sealed surfaces, stones out, planting & infiltration in — every de-sealed m² means less heat and more water buffer.",
"Planting with native species (see the “Native species” layer): cow parsley, ground ivy and native shrubs as food and nesting base.",
"Wadis, rain barrels, green roofs and disconnecting roofs from the combined sewer — cloudbursts are buffered instead of overloading the system.",
"Replace dark asphalt with light, reflective (high-albedo) and permeable surfaces — cooler and rain-resilient.",
"EU Nature Restoration Reg. 2024/1991: 30% green space by 2030",
"SDG 4 · childcare target: >90%",
"Housing-benefit law: affordable rent share ≤30% of net income",
"Heat island: LST well above city average, high sealing.",
"Well greened, low heat exposure.",
"Above EU limit values. Measurable health risk.",
"Healthy air, low noise burden.",
"Near limit values; measures advisable.",
"Poor transit access, few cycle paths.",
"Medium connectivity, room to grow.",
"Low childcare rate + high youth unemployment.",
"Acute housing crisis: rent burden >40%, strong gentrification pressure.",
"Stable housing situation.",
"Noticeable pressure; prevention advisable.",
"Active civil society.",
"Participation with room to grow.",
"Heavily sealed, little biodiversity.",
"Good ecosystem quality.",
"Average green provision, expandable.",
"Elevated flood risk and/or constrained infrastructure.",
"Housing-construction ban",
"NL national fund, €20bn for growth & sustainability",
"NL national funding for municipal climate adaptation",
"Renovating public buildings in NL",
"DE–NL cooperation projects — ideal for a Frankfurt–Utrecht tandem",
"Participatory budgets, participation platforms, city partnerships",
"For greening, biotopes, climate adaptation",
"Cycle highways, public-transport infrastructure",
"For industrial restructuring & climate change",
"Trees, parks, façade greening",
"Tram, bus, metro infrastructure",
"Highest rate. For advice centres, youth participation",
"For disadvantaged districts",
"Cool islands, flood protection, heat protection",
"District heat pumps, local/district heating",
"Façades, roofs, insulation",
"0.6% p.a. interest (as of March 2026). For municipalities.",
"1.0% p.a. interest. Budget €800m for 2025/2026.",
"Grant for integrated neighbourhood concepts",
"For all climate-mitigation measures in Hesse",
"For scientific evaluation of nice here"];
const NL=[
"Oppervlaktetemperatuur (LST), NDVI-tekort, bevolkingskwetsbaarheid, verhardingsgraad.",
"PM2.5 + NO₂ (EU AQI, jaargemiddelde), geluidsbelasting Lden dB, luchtwegaandoeningen.",
"OV-frequentie (GTFS), fietspadlengte per km², 10-minutenstad-score (34 POI's), ongevalsdichtheid.",
"Opvangquote, schooluitval, jeugdwerkloosheid U25, bijstandsquote.",
"Huurquote (>30% inkomen), gentrificatiedruk (huurstijging 5 jr), overbewoning.",
"Opkomst (nationaal + gemeentelijk), verenigingsdichtheid, buurtplekken per 10.000 inwoners.",
"NDVI (groenaandeel), boomvitaliteit + kroondichtheid, biotoopconnectiviteit, waterretentie.",
"Overstromingsrisico HQ100 (oppervlak in zone), kritieke infrastructuur, responstijd brandweer.",
"Modale filters, 30 km/u-zone en schoolstraten volgens CROW — doorgaand verkeer eruit, verblijf erin.",
"Verharding openbreken, stenen eruit, beplanting & infiltratie erin — per onthard m² minder hitte en meer waterbuffer.",
"Beplanting met inheemse soorten (laag ‘Inheemse soorten’): fluitenkruid, hondsdraf en inheemse struiken als voedsel- en nestbasis.",
"Wadi's, regentonnen, groendaken en afkoppelen van daken van het gemengde riool — piekbuien worden gebufferd in plaats van het stelsel te overbelasten.",
"Donker asfalt vervangen door lichte, reflecterende (hoge albedo), waterdoorlatende verharding — koeler en regenbestendig.",
"EU-natuurherstelverordening 2024/1991: 30% groen in 2030",
"SDG 4 · opvangdoel: >90%",
"Norm: draagbare huurquote ≤30% van het netto-inkomen",
"Hitte-eiland: LST ver boven stadsgemiddelde, hoge verharding.",
"Goed groen, lage hittebelasting.",
"Boven EU-grenswaarden. Meetbaar gezondheidsrisico.",
"Gezonde lucht, weinig geluidshinder.",
"Nabij grenswaarden; maatregelen zinvol.",
"Slechte OV-ontsluiting, weinig fietspaden.",
"Gemiddelde connectiviteit, groeipotentieel.",
"Lage opvangquote + hoge jeugdwerkloosheid.",
"Acute wooncrisis: huurlast >40%, sterke gentrificatiedruk.",
"Stabiele woonsituatie.",
"Merkbare druk; preventie zinvol.",
"Actieve burgersamenleving.",
"Participatie met groeipotentieel.",
"Sterk verhard, weinig biodiversiteit.",
"Goede ecosysteemkwaliteit.",
"Gemiddeld groen, uitbreidbaar.",
"Verhoogd overstromingsrisico en/of beperkte infrastructuur.",
"Woningbouwverbod",
"NL-staatsfonds, €20 mrd voor groei & duurzaamheid",
"Rijkssubsidie voor gemeentelijke klimaatadaptatie",
"Verduurzaming van publieke gebouwen in NL",
"DE–NL-samenwerkingsprojecten — ideaal voor een Frankfurt–Utrecht-tandem",
"Burgerbegrotingen, participatieplatforms, stedenbanden",
"Voor vergroening, biotopen, klimaatadaptatie",
"Snelfietsroutes, OV-infrastructuur",
"Voor industriële herstructurering & klimaat",
"Bomen, parken, gevelgroen",
"Tram-, bus-, metro-infrastructuur",
"Hoogste percentage. Voor adviescentra, jongerenparticipatie",
"Voor achterstandswijken",
"Koele eilanden, overstromings- en hittebescherming",
"Wijkwarmtepompen, stads-/blokverwarming",
"Gevels, daken, isolatie",
"0,6% rente p.j. (per maart 2026). Voor gemeenten.",
"1,0% rente p.j. Budget €800 mln voor 2025/2026.",
"Subsidie voor integrale wijkconcepten",
"Voor alle klimaatmaatregelen in Hessen",
"Voor wetenschappelijke begeleiding van nice here"];
if(gap.length!==EN.length||gap.length!==NL.length){console.log('❌ Längen: gap',gap.length,'EN',EN.length,'NL',NL.length);process.exit(1);}
const add={};
gap.forEach((k,i)=>{add[k]={en:EN[i],nl:NL[i]};});

// ── 2) Template-Segmente (Hitze-Block, Szenarien, Labels) ──
Object.assign(add,{
"Hitzebetroffenheit — Satelliten- & Erdbeobachtungsanalyse":{en:"Heat exposure — satellite & earth-observation analysis",nl:"Hittebelasting — satelliet- & aardobservatieanalyse"},
"DUH Hitze-Check: ":{en:"DUH heat check: ",nl:"DUH hitte-check: "},
"Hitzebetroffenheitsindex":{en:"Heat-exposure index",nl:"Hittebelastingsindex"},
"Hitzebetroffenheit-Score":{en:"heat-exposure score",nl:"hittebelastingsscore"},
" — Composite Hitzebetroffenheit":{en:" — composite heat exposure",nl:" — samengestelde hittebelasting"},
"Grünvolumen":{en:"Green volume",nl:"Groenvolume"},
"LST = Oberflächentemperatur ≠ Lufttemperatur.":{en:"LST = surface temperature ≠ air temperature.",nl:"LST = oppervlaktetemperatuur ≠ luchttemperatuur."},
"Satelliten messen Wärmestrahlung von Asphalt, Dächern und Böden — nicht die Lufttemperatur auf Augenhöhe. Methodik: Surface Urban Heat Island Indikator (SUHI), Hotspot-Analyse Top-10%-Perzentil. DWD: Wärmeinseleffekt besonders ausgeprägt bei wolkenarmen, windschwachen Nächten.":{en:"Satellites measure thermal radiation from asphalt, roofs and soil — not air temperature at eye level. Method: Surface Urban Heat Island indicator (SUHI), hotspot analysis at the top-10% percentile. DWD: the heat-island effect is most pronounced on cloud-free, low-wind nights.",nl:"Satellieten meten warmtestraling van asfalt, daken en bodem — niet de luchttemperatuur op ooghoogte. Methode: Surface Urban Heat Island-indicator (SUHI), hotspotanalyse top-10%-percentiel. DWD: het hitte-eilandeffect is het sterkst in wolkenloze, windstille nachten."},
"NDVI (Normalized Difference Vegetation Index): Vegetationsvitalität aus Sentinel-2 Rot- und NIR-Band. NDBI (Normalized Difference Built-up Index): Bebauungsintensität. Copernicus Tree Cover Density liefert Baumkronendichte als eigenständigen Kühlungsfaktor. Fraunhofer IBP 2024: Grünflächen kühlen durch Evapotranspiration lokal bis −4°C.":{en:"NDVI (Normalized Difference Vegetation Index): vegetation vitality from Sentinel-2 red and NIR bands. NDBI (Normalized Difference Built-up Index): built-up intensity. Copernicus Tree Cover Density adds canopy density as a separate cooling factor. Fraunhofer IBP 2024: green spaces cool locally by up to −4°C through evapotranspiration.",nl:"NDVI (Normalized Difference Vegetation Index): vegetatievitaliteit uit Sentinel-2 rood- en NIR-band. NDBI (Normalized Difference Built-up Index): bebouwingsintensiteit. Copernicus Tree Cover Density levert kroondichtheid als aparte koelfactor. Fraunhofer IBP 2024: groen koelt lokaal tot −4°C via evapotranspiratie."},
"Copernicus HRL Imperviousness (20m): europaweit harmonisierter Versiegelungsgrad. Local Climate Zone (LCZ) nach Stewart & Oke (2012): 17 Zonentypen nach Bebauungsstruktur — dichte LCZ-Typen (LCZ 1–3) speichern Wärme tagsüber und geben sie nachts langsam ab → erhöhte Tropennächte. BBSR 2023: 10% Entsiegelung → LST-Reduktion 0,8–1,2°C.":{en:"Copernicus HRL Imperviousness (20 m): EU-harmonised sealing degree. Local Climate Zones (LCZ) after Stewart & Oke (2012): 17 zone types by built structure — dense LCZ types (1–3) store heat by day and release it slowly at night → more tropical nights. BBSR 2023: 10% de-sealing → LST reduction of 0.8–1.2°C.",nl:"Copernicus HRL Imperviousness (20 m): EU-geharmoniseerde verhardingsgraad. Local Climate Zones (LCZ) volgens Stewart & Oke (2012): 17 zonetypen naar bebouwing — dichte LCZ-typen (1–3) slaan overdag warmte op en geven die 's nachts langzaam af → meer tropennachten. BBSR 2023: 10% ontharding → LST-reductie 0,8–1,2°C."},
"Humane Wärmebelastung (Proxy)":{en:"Human heat stress (proxy)",nl:"Menselijke hittebelasting (proxy)"},
"Vollständige humanbiometeorologische Bewertung erfolgt via PET (Physiological Equivalent Temperature) oder UTCI (Universal Thermal Climate Index) — unter Einbezug von Lufttemperatur, Luftfeuchte, Wind, Strahlung und Verschattung (VDI 3787 Bl. 2). Vulnerable Gruppen: ":{en:"A full human-biometeorological assessment uses PET (Physiological Equivalent Temperature) or UTCI (Universal Thermal Climate Index) — incorporating air temperature, humidity, wind, radiation and shading (VDI 3787 pt. 2). Vulnerable groups: ",nl:"Een volledige humaan-biometeorologische beoordeling gebeurt via PET (Physiological Equivalent Temperature) of UTCI (Universal Thermal Climate Index) — met luchttemperatuur, vocht, wind, straling en schaduw (VDI 3787 dl. 2). Kwetsbare groepen: "},
"75J, Kleinkinder, chronisch Erkrankte, Obdachlose. UBA MK 4.0: ~2 Mio€ Folgekosten/Hitzetod. Frankfurt 2022: ~180 hitzebedingte Übersterblichkeit.":{en:"75+, young children, the chronically ill, homeless people. UBA MK 4.0: ~€2m follow-up costs per heat death. Frankfurt 2022: ~180 heat-related excess deaths.",nl:"75+, jonge kinderen, chronisch zieken, daklozen. UBA MK 4.0: ~€2 mln vervolgkosten per hittedode. Frankfurt 2022: ~180 hittegerelateerde oversterfte."},
"LST-Werte ≠ Lufttemperatur auf Augenhöhe. Einzelzeitpunkte begrenzt — ideal sind mehrjährige Zeitreihen aus mehreren Hitzetagen. Straßenzuggenaue Aussagen erfordern Mikroklimamodellierung (ENVI-met) oder mobile Messungen zur Validierung. Sozialdaten unter Datenschutzvorbehalt (ISO 14091).":{en:"LST values ≠ air temperature at eye level. Single snapshots are limited — multi-year series over several heat days are ideal. Street-level statements require microclimate modelling (ENVI-met) or mobile measurements for validation. Social data subject to privacy safeguards (ISO 14091).",nl:"LST-waarden ≠ luchttemperatuur op ooghoogte. Losse momentopnamen zijn beperkt — meerjarige reeksen over meerdere hittedagen zijn ideaal. Uitspraken op straatniveau vergen microklimaatmodellering (ENVI-met) of mobiele metingen. Sociale data onder privacyvoorbehoud (ISO 14091)."},
"Umlandmittel (SUHI)":{en:"rural reference mean (SUHI)",nl:"omlandgemiddelde (SUHI)"},
"Rote Karte":{en:"Red card",nl:"Rode kaart"},"Gelbe Karte":{en:"Yellow card",nl:"Gele kaart"},"Grüne Karte":{en:"Green card",nl:"Groene kaart"},
"Hohe Versiegelung (":{en:"High surface sealing (",nl:"Hoge verharding ("},
"verhindert natürliche Kühlung. LST-Delta aktuell":{en:"prevents natural cooling. Current LST delta",nl:"verhindert natuurlijke koeling. Actuele LST-delta"},
" — basierend auf Klimaprojektionen (DWD RCP 4.5), IAB-Armutsforschung und verfügbaren Förderprogrammen.":{en:" — based on climate projections (DWD RCP 4.5), IAB poverty research and available funding programmes.",nl:" — gebaseerd op klimaatprojecties (DWD RCP 4.5), IAB-armoedeonderzoek en beschikbare subsidieprogramma's."},
"Klimarisiko aktuell überschaubar, aber steigend. Frühe Maßnahmen jetzt sind deutlich günstiger als Reaktionen später.":{en:"Climate risk currently manageable but rising. Early action now is far cheaper than reacting later.",nl:"Klimaatrisico nu beheersbaar maar stijgend. Vroeg ingrijpen is veel goedkoper dan later reageren."},
"Förderfenster verpassen, höhere Eigenmittel nötig":{en:"funding windows missed, higher own funds needed",nl:"subsidievensters gemist, meer eigen middelen nodig"},
"2–3 sofort umsetzbare Maßnahmen mit hohem Wirkungsgrad und verfügbarer Förderung. Stoppwirkung gegen den negativen Trend, aber keine strukturelle Lösung.":{en:"2–3 immediately implementable measures with high impact and available funding. Halts the negative trend, but no structural solution.",nl:"2–3 direct uitvoerbare maatregelen met hoge impact en beschikbare subsidie. Stopt de negatieve trend, maar geen structurele oplossing."},
"bis 75% Förderung möglich":{en:"up to 75% funding possible",nl:"tot 75% subsidie mogelijk"},
"Vollständige Transformation":{en:"Full transformation",nl:"Volledige transformatie"},
"adressierbaren Maßnahmen werden umgesetzt — koordiniert über EU/Bund/Land-Programme.":{en:"addressable measures are implemented — coordinated across EU/federal/state programmes.",nl:"adresseerbare maatregelen worden uitgevoerd — gecoördineerd via EU-/rijks-/provinciale programma's."},
" wird zum Modellstadtteil mit messbarer Wirkung für den EUI Call 4 Antrag.":{en:" becomes a model district with measurable impact for the EUI Call 4 application.",nl:" wordt modelwijk met meetbaar effect voor de EUI Call 4-aanvraag."},
"Förderung (72% Ø)":{en:"funding (72% avg)",nl:"subsidie (72% gem.)"},
"Konkrete Maßnahmen:":{en:"Concrete measures:",nl:"Concrete maatregelen:"},
"Heute: ":{en:"Today: ",nl:"Nu: "},
"Klimadimension A+G: +":{en:"Climate dimensions A+G: +",nl:"Klimaatdimensies A+G: +"},
" Punkte durch Begrünung & Entsiegelung":{en:" points via greening & de-sealing",nl:" punten door vergroening & ontharding"},
"Mobilitysdimension C: +":{en:"Mobility dimension C: +",nl:"Mobiliteitsdimensie C: +"},
" Punkte durch ÖPNV & Radwege":{en:" points via transit & cycle paths",nl:" punten door OV & fietspaden"},
"nach Förderabzug":{en:"after funding deduction",nl:"na subsidieaftrek"},
"Szenario A":{en:"Scenario A",nl:"Scenario A"},"Szenario B":{en:"Scenario B",nl:"Scenario B"},"Szenario C":{en:"Scenario C",nl:"Scenario C"},
"Empfehlungen basieren auf den <b>schwächsten Dimensionen</b>. Alle Kosten und ROI sind methodisch belegt (Quellen aufklappbar). Institutionelle Quellen: Fraunhofer IBP · JRC EU · BBSR · WHO Europa · UBA · DWD.":{en:"Recommendations target the <b>weakest dimensions</b>. All costs and ROI are methodically sourced (expand for sources). Institutional sources: Fraunhofer IBP · JRC EU · BBSR · WHO Europe · UBA · DWD.",nl:"Aanbevelingen richten zich op de <b>zwakste dimensies</b>. Alle kosten en ROI zijn methodisch onderbouwd (bronnen uitklapbaar). Institutionele bronnen: Fraunhofer IBP · JRC EU · BBSR · WHO Europa · UBA · DWD."},
"Institutionelle Grundlage:":{en:"Institutional basis:",nl:"Institutionele basis:"},
"Prioritätskandidat (niedriger Score = starke EUI-Begründung)":{en:"priority candidate (low score = strong EUI justification)",nl:"prioriteitskandidaat (lage score = sterke EUI-onderbouwing)"},
"Förderangaben zur Orientierung. Kein Ersatz für individuelle Beratung. Konditionen können sich ändern. Alle 25 Programme: Layer-Architektur in Notion.":{en:"Funding figures are indicative. No substitute for individual advice. Conditions may change. All 25 programmes: layer architecture in Notion.",nl:"Subsidiecijfers zijn indicatief. Geen vervanging voor individueel advies. Voorwaarden kunnen wijzigen. Alle 25 programma's: layer-architectuur in Notion."},
"Quelle:":{en:"Source:",nl:"Bron:"},
"Stand 2024":{en:"Vintage 2024",nl:"Stand 2024"},"Stand 2023":{en:"Vintage 2023",nl:"Stand 2023"},"Stand 2022":{en:"Vintage 2022",nl:"Stand 2022"},"Stand 2021":{en:"Vintage 2021",nl:"Stand 2021"},
"Rot = unteres Fünftel im Vergleich zu allen Stadtteilen":{en:"Red = bottom fifth compared with all districts",nl:"Rood = onderste vijfde vergeleken met alle wijken"},
"Der NICE Score = ":{en:"The NICE score = ",nl:"De NICE-score = "},
"Ø der 8 Dimensionen":{en:"mean of the 8 dimensions",nl:"gemiddelde van de 8 dimensies"},
" (je 0–100). ":{en:" (each 0–100). ",nl:" (elk 0–100). "},
"Quellen:":{en:"Sources:",nl:"Bronnen:"},
"Sehr gute multimodale Erreichbarkeit.":{en:"Very good multimodal accessibility.",nl:"Zeer goede multimodale bereikbaarheid."},
"Gute Bildungsinfrastruktur.":{en:"Good education infrastructure.",nl:"Goede onderwijsinfrastructuur."},
"Gute Durchgrünung, geringe Hitzeexposition.":{en:"Well greened, low heat exposure.",nl:"Goed doorgroend, lage hittebelasting."}
});

// ── 3) TR erweitern (vor TR_KEYS einfügen, damit Keys mitzählen) ──
const ser=Object.entries(add).map(([k,v])=>JSON.stringify(k)+':{"en":'+JSON.stringify(v.en)+',"nl":'+JSON.stringify(v.nl)+'}').join(',');
rep('const TR_KEYS=','Object.assign(TR,{'+ser+'});\nconst TR_KEYS=','TR_KEYS-Anker');

// ── 4) Code-Edits ──
// grade(): Labels sprachabhängig
rep("if(s>=75)return{g:'A',lbl:'Sehr gut'","if(s>=75)return{g:'A',lbl:(lang==='en'?'Very good':lang==='nl'?'Zeer goed':'Sehr gut')");
rep("if(s>=62)return{g:'B',lbl:'Gut'","if(s>=62)return{g:'B',lbl:(lang==='en'?'Good':lang==='nl'?'Goed':'Gut')");
rep("if(s>=50)return{g:'C',lbl:'Mittel'","if(s>=50)return{g:'C',lbl:(lang==='en'?'Fair':lang==='nl'?'Matig':'Mittel')");
rep("if(s>=38)return{g:'D',lbl:'Kritisch'","if(s>=38)return{g:'D',lbl:(lang==='en'?'Critical':lang==='nl'?'Kritiek':'Kritisch')");
rep("return{g:'E',lbl:'Akut'","return{g:'E',lbl:(lang==='en'?'Acute':lang==='nl'?'Acuut':'Akut')");
// dGrade "Note"
rep('gp.innerHTML=`Note ${g.g} — ${g.lbl}`;','gp.innerHTML=`${lang==="en"?"Grade":lang==="nl"?"Cijfer":"Note"} ${g.g} — ${g.lbl}`;','dGrade Note');
// dAlert L2
rep('</svg> Strukturelle Doppelbenachteiligung</b><br>Score ${s} + Wahlbeteiligung ${d.wb}% = höchster Handlungsbedarf bei geringster politischer Gegenwehr.`;}',
    '</svg> ${lang==="en"?"Structural double disadvantage":lang==="nl"?"Structurele dubbele achterstand":"Strukturelle Doppelbenachteiligung"}</b><br>${lang==="en"?`Score ${s} + turnout ${d.wb}% = highest need for action, lowest political pushback.`:lang==="nl"?`Score ${s} + opkomst ${d.wb}% = hoogste handelingsdruk, laagste politieke tegendruk.`:`Score ${s} + Wahlbeteiligung ${d.wb}% = höchster Handlungsbedarf bei geringster politischer Gegenwehr.`}`;}','dAlert');
// dExplain EW/Wahlbet.
rep('</b> EW · Wahlbet. <b>','</b> ${lang==="en"?"res. · turnout":lang==="nl"?"inw. · opkomst":"EW · Wahlbet."} <b>','dExplain');
// hbMeta-Label übersetzen
rep('function mT(de,en,nl){return lang===\'en\'?en:lang===\'nl\'?nl:de;}',
    'function mT(de,en,nl){return lang===\'en\'?en:lang===\'nl\'?nl:de;}\nfunction trHeatLbl(l){const M={\'Extrem\':[\'Extreme\',\'Extreem\'],\'Sehr hoch\':[\'Very high\',\'Zeer hoog\'],\'Hoch\':[\'High\',\'Hoog\'],\'Mittel\':[\'Medium\',\'Matig\'],\'Gering\':[\'Low\',\'Gering\'],\'Niedrig\':[\'Low\',\'Laag\']};const v=M[l];return v?mT(l,v[0],v[1]):l;}','mT/trHeatLbl');
rep('${hbMeta.lbl} — Composite','${trHeatLbl(hbMeta.lbl)} — Composite','hbMeta');
// ✕ Schließen + Skala-Footer
rep('>✕ Schließen','>✕ <span data-i18n="close">Schließen</span>','Schließen');
rep('>Skala<','><span data-i18n="lg_scale">Skala</span><','Skala');
rep('>Unteres Fünftel<','><span data-i18n="lg_low">Unteres Fünftel</span><','Unteres Fünftel');
rep('>Oberes Fünftel<','><span data-i18n="lg_high">Oberes Fünftel</span><','Oberes Fünftel');
// STR-Dict-Einträge je Sprache (an flt_heat-Anker)
rep("flt_heat:'Hitze'","flt_heat:'Hitze',close:'Schließen',lg_scale:'Skala',lg_low:'Unteres Fünftel',lg_high:'Oberes Fünftel'");
rep("flt_heat:'Heat'","flt_heat:'Heat',close:'Close',lg_scale:'Scale',lg_low:'Bottom fifth',lg_high:'Top fifth'");
rep("flt_heat:'Hitte'","flt_heat:'Hitte',close:'Sluiten',lg_scale:'Schaal',lg_low:'Onderste vijfde',lg_high:'Bovenste vijfde'");
// 3D-Modusleiste
rep('onclick="set3DMode(\'heat\')">Hitze<','onclick="set3DMode(\'heat\')"><span data-i18n="lens_heat">Hitze</span><','3D heat btn');
rep('onclick="set3DMode(\'flood\')">Hochwasser<','onclick="set3DMode(\'flood\')"><span data-i18n="lens_water">Hochwasser</span><','3D flood btn');
// linke Liste: EW/Wahlbet. im Item-Template
rep("k EW · ${d.wb}% Wahlbet.","k ${lang==='en'?'res.':lang==='nl'?'inw.':'EW'} · ${d.wb}% ${lang==='en'?'turnout':lang==='nl'?'opkomst':'Wahlbet.'}",'Listen-Item');
// m3legend/m3info
rep("h:'CO₂ Gebäude (kg/m²·a)'","h:mT('CO₂ Gebäude (kg/m²·a)','Building CO₂ (kg/m²·yr)','Gebouw-CO₂ (kg/m²·jr)')");
rep("'< 20 · effizient'","mT('< 20 · effizient','< 20 · efficient','< 20 · efficiënt')");
rep("'≥ 46 · ineffizient'","mT('≥ 46 · ineffizient','≥ 46 · inefficient','≥ 46 · inefficiënt')");
rep("[M3_GREY,'Nebengebäude']","[M3_GREY,mT('Nebengebäude','Outbuilding','Bijgebouw')]");
rep("h:'Hitze ΔLST (°C)'","h:mT('Hitze ΔLST (°C)','Heat ΔLST (°C)','Hitte ΔLST (°C)')");
rep("'< 1,2 · unauffällig'","mT('< 1,2 · unauffällig','< 1.2 · unremarkable','< 1,2 · onopvallend')");
rep("'> 3 · Hotspot'","mT('> 3 · Hotspot','> 3 · hotspot','> 3 · hotspot')");
rep("h:'Hochwasser-Nähe'","h:mT('Hochwasser-Nähe','Flood proximity','Overstromingsnabijheid')");
rep("[['#1d4ed8','hoch'],['#3b82f6','mittel'],['#93c5fd','gering'],[M3_GREY,'außerhalb']]","[['#1d4ed8',mT('hoch','high','hoog')],['#3b82f6',mT('mittel','medium','matig')],['#93c5fd',mT('gering','low','gering')],[M3_GREY,mT('außerhalb','outside','buiten')]]");
rep("const fl=p.flood?({high:'hoch',medium:'mittel',low:'gering'})[p.flood]:'—';","const fl=p.flood?({high:mT('hoch','high','hoog'),medium:mT('mittel','medium','matig'),low:mT('gering','low','gering')})[p.flood]:'—';");
rep("<span>Baujahr-Epoche</span>","<span>${mT('Baujahr-Epoche','Construction era','Bouwperiode')}</span>");
rep("<span>Hitze ΔLST</span>","<span>${mT('Hitze ΔLST','Heat ΔLST','Hitte ΔLST')}</span>");
rep("<span>Hochwasser</span>","<span>${mT('Hochwasser','Flood','Overstroming')}</span>");
rep("<span>Höhe</span>","<span>${mT('Höhe','Height','Hoogte')}</span>");
// M3_USE mehrsprachig
rep("const M3_USE={res:'Wohnen',off:'Büro',ret:'Handel',ind:'Industrie',hea:'Gesundheit',edu:'Bildung',asm:'Versammlung',hot:'Beherbergung',spo:'Sport',oth:'sonstige','':'Nebengebäude'};",
    "function m3Use(u){const M={res:['Wohnen','Residential','Wonen'],off:['Büro','Office','Kantoor'],ret:['Handel','Retail','Winkel'],ind:['Industrie','Industry','Industrie'],hea:['Gesundheit','Health','Zorg'],edu:['Bildung','Education','Onderwijs'],asm:['Versammlung','Assembly','Bijeenkomst'],hot:['Beherbergung','Hospitality','Logies'],spo:['Sport','Sports','Sport'],oth:['sonstige','other','overig'],'':['Nebengebäude','Outbuilding','Bijgebouw']};const v=M[u];return v?mT(v[0],v[1],v[2]):undefined;}",'M3_USE');
rep("M3_USE[p.use]||p.use||'Gebäude'","m3Use(p.use)||p.use||mT('Gebäude','Building','Gebouw')",'m3info use');
// m3loader Texte
rep("document.getElementById('m3loader').style.display='flex';\n  const url=","document.getElementById('m3loader').style.display='flex';\n  try{document.getElementById('m3loaderTxt').textContent=mT('3D-Stadtmodell wird geladen…','Loading 3D city model…','3D-stadsmodel laden…');}catch(e){}\n  const url=",'m3loader txt');
rep("'Daten konnten nicht geladen werden.'","mT('Daten konnten nicht geladen werden.','Data could not be loaded.','Data kon niet worden geladen.')");
rep("'3D konnte nicht geladen werden (Netz?).'","mT('3D konnte nicht geladen werden (Netz?).','3D could not be loaded (network?).','3D kon niet laden (netwerk?).')");

fs.writeFileSync('index.html',h);
console.log('index.html: '+n+' Patches · TR +'+Object.keys(add).length+' Einträge');

// ── 5) start.html: 29 Indikatoren / 30+ Datenebenen in den Pitch ──
let s=fs.readFileSync('public/start.html','utf8');let m=0;
const rep2=(a,b)=>{if(s.includes(a)){s=s.split(a).join(b);m++;}else console.log('⚠ start fehlt:',a.slice(0,50));};
rep2("verdichtet nice here alles zu 8 Dimensionen","verdichtet Inspector Nice 29 dokumentierte Indikatoren über 30+ Datenebenen zu 8 Dimensionen");
rep2("nice here condenses everything into 8 dimensions","Inspector Nice condenses 29 documented indicators across 30+ data layers into 8 dimensions");
rep2("verdicht nice here alles tot 8 dimensies","verdicht Inspector Nice 29 gedocumenteerde indicatoren over 30+ datalagen tot 8 dimensies");
fs.writeFileSync('public/start.html',s);
console.log('start.html: '+m+' Patches');
