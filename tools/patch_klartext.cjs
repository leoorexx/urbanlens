// Design-Paket 2: Klartext-Titel + i18n-Lücken in Layer-Panel & Karten-Legende
const fs=require('fs');
const P='index.html';
let h=fs.readFileSync(P,'utf8');
let n=0;
function rep(a,b){if(h.indexOf(a)<0){console.error('MISS: '+a.slice(0,80));process.exitCode=1;return;}h=h.split(a).join(b);n++;}

// ── A · Layer-Panel: hartkodierte Titel → data-i18n + Klartext ──
rep('<div class="lp-section">Composite-Insights (2 Layer kombiniert)</div>',
    '<div class="lp-section"><span data-i18n="sec_composite">Kombinierte Analysen — zwei Ebenen in einer</span></div>');
rep('<div class="lp-section ffm-only">Amtliche Klimadaten — Geoportal Hessen</div>',
    '<div class="lp-section ffm-only"><span data-i18n="sec_official">Amtliche Klimadaten — Land Hessen</span></div>');
rep('<span class="lname">Hitzestress & LST — HLNUG amtlich</span>',
    '<span class="lname" title="Methode: LST-Hitzestress, HLNUG (amtlich)"><span data-i18n="lay_hessen_heat">Hitzestress — amtliche Messung</span></span>');
rep('<span class="lname">Versiegelung & Klimazonen — LCZ</span>',
    '<span class="lname" title="Methode: Local Climate Zones (LCZ)"><span data-i18n="lay_hessen_lcz">Versiegelung & Stadtklima-Zonen</span></span>');
rep('<span class="lname">Schulen in Hitzezone</span>',
    '<span class="lname"><span data-i18n="lay_schools_heat">Schulen in Hitzezonen</span></span>');
rep('<span class="lname">Lärm × Wohngebäude</span>',
    '<span class="lname"><span data-i18n="lay_noise_res">Lärm × Wohngebäude</span></span>');
rep('<span class="lname">Grün-Defizit Gebäude</span>',
    '<span class="lname"><span data-i18n="lay_green_def">Grün-Defizit je Gebäude</span></span>');
rep('<div class="lp-section s-soc">Soziale Qualität (PPS-Framework)</div>',
    '<div class="lp-section s-soc"><span data-i18n="sec_soc2" title="Methodik: Placemaking-Kriterien (PPS)">Aufenthalt & soziales Leben</span></div>');
rep('<span data-i18n="sec_mob">Mobilität (OSM Overpass)</span>','<span data-i18n="sec_mob">Mobilität & Wege</span>');
rep('<span data-i18n="sec_infra">Infrastruktur (OSM Overpass)</span>','<span data-i18n="sec_infra">Infrastruktur & Alltagsorte</span>');

// ── B · STR: bestehende Keys Klartext + neue Keys (DE/EN/NL) ──
rep("sec_mob:'Mobilität (OSM Overpass)'","sec_mob:'Mobilität & Wege (OpenStreetMap, live)'");
rep("sec_mob:'Mobility (OSM Overpass)'","sec_mob:'Mobility & paths (OpenStreetMap, live)'");
rep("sec_mob:'Mobiliteit (OSM Overpass)'","sec_mob:'Mobiliteit & routes (OpenStreetMap, live)'");
rep("sec_infra:'Infrastruktur (OSM Overpass)'","sec_infra:'Infrastruktur & Alltagsorte (OpenStreetMap, live)'");
rep("sec_infra:'Infrastructure (OSM Overpass)'","sec_infra:'Infrastructure & everyday places (OpenStreetMap, live)'");
rep("sec_infra:'Infrastructuur (OSM Overpass)'","sec_infra:'Infrastructuur & dagelijkse plekken (OpenStreetMap, live)'");
rep("sec_composite:'Composite-Analysen'","sec_composite:'Kombinierte Analysen — zwei Ebenen in einer'");
rep("sec_composite:'Composite analyses'","sec_composite:'Combined insights — two layers in one'");
rep("sec_composite:'Composiet-analyses'","sec_composite:'Gecombineerde inzichten — twee lagen in één'");
rep("sec_official:'Amtliche Klimadaten (Hessen WFS)'","sec_official:'Amtliche Klimadaten — Land Hessen'");
rep("sec_official:'Official climate data (Hessen WFS)'","sec_official:'Official climate data — State of Hesse'");
rep("sec_official:'Officiële klimaatdata (Hessen WFS)'","sec_official:'Officiële klimaatdata — deelstaat Hessen'");
rep("left_tab:'Stadtteile',","left_tab:'Stadtteile',lay_hessen_heat:'Hitzestress — amtliche Messung',lay_hessen_lcz:'Versiegelung & Stadtklima-Zonen',lay_schools_heat:'Schulen in Hitzezonen',lay_noise_res:'Lärm × Wohngebäude',lay_green_def:'Grün-Defizit je Gebäude',sec_soc2:'Aufenthalt & soziales Leben',");
rep("left_tab:'Districts',","left_tab:'Districts',lay_hessen_heat:'Heat stress — official measurement',lay_hessen_lcz:'Sealing & urban climate zones',lay_schools_heat:'Schools in heat zones',lay_noise_res:'Noise × housing',lay_green_def:'Green deficit per building',sec_soc2:'Public space & social life',");
rep("left_tab:'Wijken',","left_tab:'Wijken',lay_hessen_heat:'Hittestress — officiële meting',lay_hessen_lcz:'Verharding & stadsklimaatzones',lay_schools_heat:'Scholen in hittezones',lay_noise_res:'Geluid × woningen',lay_green_def:'Groentekort per gebouw',sec_soc2:'Verblijf & sociaal leven',");

// ── C · Legende: Klartext-Titel + exakte Übersetzungstabelle (kein Substring-Risiko) ──
rep("heat:{t:'Hitzeinsel (LST)'","heat:{t:'Hitzeinseln — Oberflächentemperatur'");
rep("flood:{t:'Hochwasser HQ100'","flood:{t:'Hochwasser — 100-Jahres-Ereignis'");
rep('// ── KARTEN-LEGENDE — feste Legende je aktivem Layer ─────────────',
`// ── KARTEN-LEGENDE — feste Legende je aktivem Layer ─────────────
// Exakt-Übersetzung je vollständigem Label (kein Substring-Ersatz → keine Kollisionen)
const LGT={
 'Verkehrs-CO₂ (Proxy)':['Traffic CO₂ (proxy)','Verkeers-CO₂ (proxy)'],'Raumklang (dB Lden)':['Soundscape (dB Lden)','Ruimteklank (dB Lden)'],
 'DUH Hitze-Check':['DUH heat check','DUH hitte-check'],'Gebäude-CO₂ (kg/m²)':['Building CO₂ (kg/m²)','Gebouw-CO₂ (kg/m²)'],
 'Hitzeinseln — Oberflächentemperatur':['Heat islands — surface temperature','Hitte-eilanden — oppervlaktetemperatuur'],
 'Pflanzenverf. Wasser':['Plant-available water','Plantbeschikbaar water'],
 'Hochwasser — 100-Jahres-Ereignis':['Flood — 1-in-100-year event','Overstroming — 1 op 100 jaar'],
 'Lärmbelastung':['Noise exposure','Geluidsbelasting'],'Radwege':['Cycle paths','Fietspaden'],'Bäume':['Trees','Bomen'],
 'Bänke':['Benches','Bankjes'],'Parks & Grün':['Parks & green','Parken & groen'],'Schulen & Kitas':['Schools & childcare','Scholen & opvang'],
 'Gesundheit':['Health','Zorg'],'Bäume (live)':['Trees (live)','Bomen (live)'],'Bänke (live)':['Benches (live)','Bankjes (live)'],
 'Trinkbrunnen':['Drinking fountains','Drinkfonteinen'],'Schulen/Kitas (live)':['Schools/childcare (live)','Scholen/opvang (live)'],
 'Gesundheit (live)':['Health (live)','Zorg (live)'],'ÖPNV':['Public transport','OV'],'Beleuchtung':['Lighting','Verlichting'],
 'Autobahn / Hauptstr.':['Motorway / arterial','Snelweg / hoofdweg'],'Sammelstraße':['Collector road','Verzamelweg'],
 'Nebenstraße':['Side street','Zijstraat'],'Wohnstraße':['Residential street','Woonstraat'],
 '<50 leise':['<50 quiet','<50 stil'],'55 EU-Wohnen':['55 EU housing','55 EU-wonen'],'65 EU-Grenze':['65 EU limit','65 EU-grens'],
 'Rote Karte':['Red card','Rode kaart'],'Gelbe Karte':['Yellow card','Gele kaart'],'Grüne Karte':['Green card','Groene kaart'],
 'kühl':['cool','koel'],'mittel':['medium','matig'],'heiß':['hot','heet'],
 'wassergesichert':['water-secure','waterzeker'],'ausreichend':['sufficient','voldoende'],'grenzwertig':['borderline','grensgeval'],
 'Trockenstress':['drought stress','droogtestress'],'vertrocknet zuerst':['dries out first','verdroogt eerst'],
 'gering':['low','laag'],'hoch':['high','hoog'],'kritisch':['critical','kritiek'],'leise':['quiet','stil'],'laut':['loud','luid'],
 'getrennt':['separated','vrijliggend'],'Schutzstreifen':['advisory lane','fietsstrook'],'fehlt':['missing','ontbreekt'],
 'Straßenbaum':['street tree','straatboom'],'Bank':['bench','bankje'],'Grünfläche':['green space','groen'],
 'Standort':['location','locatie'],'Baum':['tree','boom'],'Brunnen':['fountain','fontein'],'Haltestelle':['stop','halte'],'Laterne':['street light','lantaarn']
};
function lgT(s){const v=LGT[s];return v?(lang==='en'?v[0]:lang==='nl'?v[1]:s):s;}`);
// beide Render-Stellen (DV-Zweig + Normalzweig)
rep(`return '<div class="ml-g"><div class="ml-t">'+Lg.t+'</div>'+Lg.i.map(it=>'<div class="ml-r"><span class="ml-c" style="background:'+it[0]+'"></span>'+it[1]+'</div>').join('')+'</div>';}).join(''):'');`,
    `return '<div class="ml-g"><div class="ml-t">'+lgT(Lg.t)+'</div>'+Lg.i.map(it=>'<div class="ml-r"><span class="ml-c" style="background:'+it[0]+'"></span>'+lgT(it[1])+'</div>').join('')+'</div>';}).join(''):'');`);
rep(`ids.map(k=>{const Lg=LAYER_LEGEND[k];return '<div class="ml-g"><div class="ml-t">'+Lg.t+'</div>'+
      Lg.i.map(it=>'<div class="ml-r"><span class="ml-c" style="background:'+it[0]+'"></span>'+it[1]+'</div>').join('')+'</div>';}).join('');`,
    `ids.map(k=>{const Lg=LAYER_LEGEND[k];return '<div class="ml-g"><div class="ml-t">'+lgT(Lg.t)+'</div>'+
      Lg.i.map(it=>'<div class="ml-r"><span class="ml-c" style="background:'+it[0]+'"></span>'+lgT(it[1])+'</div>').join('')+'</div>';}).join('');`);

// ── D · Drawer-Risiko & Maßnahmen-Text: HQ100/MIV in Klartext ──
rep("L2('Hochwasserrisiko HQ100','Flood risk (HQ100)','Overstromingsrisico HQ100')",
    "L2('Hochwasserrisiko — 100-Jahres-Ereignis','Flood risk — 1-in-100-year event','Overstromingsrisico — 1 op 100 jaar')");
rep('desc:"Temporäre Sperrung von Schulumgebungen für den MIV während Schulzeiten."',
    'desc:"Temporäre Sperrung von Schulumgebungen für den Autoverkehr während Schulzeiten."');
rep('"Temporäre Sperrung von Schulumgebungen für den MIV während Schulzeiten.": {"en": "Temporary car closure around schools during school hours.", "nl": "Tijdelijke autoafsluiting rond scholen tijdens schooltijden."}',
    '"Temporäre Sperrung von Schulumgebungen für den Autoverkehr während Schulzeiten.": {"en": "Temporary car closure around schools during school hours.", "nl": "Tijdelijke autoafsluiting rond scholen tijdens schooltijden."}');

fs.writeFileSync(P,h);
console.log('OK — '+n+' Ersetzungen');
