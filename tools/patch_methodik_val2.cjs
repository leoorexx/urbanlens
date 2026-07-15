// Dritte Validierungsquelle je Indikator (methodik.html): val2-Feld + Spalte + Texte (DE/EN/NL)
const fs=require('fs');
const P='public/methodik.html';
let h=fs.readFileSync(P,'utf8');
let n=0;
function rep(a,b){if(h.indexOf(a)<0){console.error('MISS: '+a.slice(0,70));process.exitCode=1;return;}h=h.split(a).join(b);n++;}

// --- DIMS: val2 einfügen (nach val:, vor norm:) ---
const dims={
 "val:'DWD/KNMI Klimaatlas · HLNUG',norm:":"val:'DWD/KNMI Klimaatlas · HLNUG',val2:'NASA Landsat 8/9 Collection 2 (USGS)',norm:",
 "val:'RKI Gesundheitsatlas / RIVM',norm:":"val:'RKI Gesundheitsatlas / RIVM',val2:'EEA Air Quality Index (stations)',norm:",
 "val:'Unfallatlas (Destatis) / SWOV',norm:":"val:'Unfallatlas (Destatis) / SWOV',val2:'openrouteservice / HeiGIT (isochrones)',norm:",
 "val:'UWV / Bundesagentur für Arbeit',norm:":"val:'UWV / Bundesagentur für Arbeit',val2:'Eurostat Urban Audit (education)',norm:",
 "val:'Kadaster / ImmobilienScout24',norm:":"val:'Kadaster / ImmobilienScout24',val2:'Eurostat (housing cost overburden)',norm:",
 "val:'Association registries · OSM',norm:":"val:'Association registries · OSM',val2:'European Social Survey (ESS)',norm:",
 "val:'City tree registries · HLNUG',norm:":"val:'City tree registries · HLNUG',val2:'GBIF / NDFF species records',norm:",
 "val:'Fire services · RP Darmstadt',norm:":"val:'Fire services · RP Darmstadt',val2:'JRC Risk Data Hub (EU)',norm:"
};
// --- ENV: val2 einfügen (nach val, vor stand:) ---
const env={
 "val:'DWD/KNMI Klimaatlas',stand:'2024'":"val:'DWD/KNMI Klimaatlas',val2:'NASA Landsat 8/9 Collection 2 (USGS)',stand:'2024'",
 "val:'DUH/LUP Hitze-Check 2026',stand:":"val:'DUH/LUP Hitze-Check 2026',val2:'ESA WorldCover 10 m (2021)',stand:",
 "val:'City tree registries (FFM / Utrecht)',stand:":"val:'City tree registries (FFM / Utrecht)',val2:'ESA WorldCover / OSM landuse',stand:",
 "val:'OpenStreetMap (live)',stand:":"val:'OpenStreetMap (live)',val2:'Copernicus Urban Atlas — Street Tree Layer',stand:",
 "'Utrecht: benadering via afstand tot water (geen hydraulisch model)'],stand:":"'Utrecht: benadering via afstand tot water (geen hydraulisch model)'],val2:'JRC pan-EU flood hazard (HQ100)',stand:",
 "val:'OSM road-class model',stand:":"val:'OSM road-class model',val2:'EEA noise reporting (END round 4)',stand:",
 "'× energie-intensiteit van het bouwtijdperk (RVO/WoON) · FFM: IWU 2023'],stand:":"'× energie-intensiteit van het bouwtijdperk (RVO/WoON) · FFM: IWU 2023'],val2:'EP-Online energy labels (NL) · co2online (DE)',stand:",
 "val:'UWV / Bundesagentur für Arbeit',stand:":"val:'UWV / Bundesagentur für Arbeit',val2:'Eurostat Urban Audit',stand:"
};
Object.entries(dims).forEach(([a,b])=>rep(a,b));
Object.entries(env).forEach(([a,b])=>rep(a,b));

// --- Tabellenköpfe: neue Spalte ---
rep("T3('Validierung','Validation','Validatie'),T3('Normativer Bezug'",
    "T3('Validierung','Validation','Validatie'),T3('Validierung 2','Validation 2','Validatie 2'),T3('Normativer Bezug'");
rep("T3('Validierungsquelle','Validation source','Validatiebron'),T3('Stand'",
    "T3('Validierungsquelle','Validation source','Validatiebron'),T3('2. Validierungsquelle','2nd validation source','2e validatiebron'),T3('Stand'");

// --- Zeilen: neue Zelle ---
rep('<td class="src-val">${pick(d.val)}</td>','<td class="src-val">${pick(d.val)}</td>\n    <td class="src-val">${pick(d.val2)}</td>');
rep('<td class="src-val">${pick(e.val)}</td>','<td class="src-val">${pick(e.val)}</td>\n    <td class="src-val">${pick(e.val2)}</td>');

// --- Texte: doppelt -> dreifach ---
rep("T3('Umweltdaten — doppelt referenziert','Environmental data — doubly referenced','Milieudata — dubbel gerefereerd')",
    "T3('Umweltdaten — dreifach referenziert','Environmental data — triply referenced','Milieudata — drievoudig gerefereerd')");
rep('Jeder Umwelt-Indikator stützt sich auf zwei unabhängige Quellen: eine amtliche Primärquelle und eine Sekundärquelle zur Validierung. So werden Messlücken erkannt und Referenzen abgesichert.',
    'Jeder Umwelt-Indikator stützt sich auf drei unabhängige Quellen: eine amtliche Primärquelle und zwei unabhängige Sekundärquellen zur Validierung. So werden Messlücken erkannt, systematische Fehler einzelner Datensätze sichtbar und Referenzen abgesichert.');
rep('Every environmental indicator rests on two independent sources: an official primary source and a secondary source for validation. This surfaces measurement gaps and secures references.',
    'Every environmental indicator rests on three independent sources: an official primary source and two independent secondary sources for validation. This surfaces measurement gaps, exposes systematic errors of single datasets and secures references.');
rep('Elke milieu-indicator steunt op twee onafhankelijke bronnen: een officiële primaire bron en een secundaire bron ter validatie. Zo worden meetgaten zichtbaar en referenties geborgd.',
    'Elke milieu-indicator steunt op drie onafhankelijke bronnen: een officiële primaire bron en twee onafhankelijke secundaire bronnen ter validatie. Zo worden meetgaten zichtbaar, systematische fouten van afzonderlijke datasets herkenbaar en referenties geborgd.');
rep('die Berechnungsformel, Primär- und Validierungsquelle, den normativen Bezugsrahmen',
    'die Berechnungsformel, die Primärquelle und zwei unabhängige Validierungsquellen, den normativen Bezugsrahmen');
rep('the calculation formula, the primary and validation source, the normative frame of reference',
    'the calculation formula, the primary source and two independent validation sources, the normative frame of reference');
rep('de rekenformule, de primaire en validatiebron, het normatieve referentiekader',
    'de rekenformule, de primaire bron en twee onafhankelijke validatiebronnen, het normatieve referentiekader');

fs.writeFileSync(P,h);
console.log('OK — '+n+' Ersetzungen (erwartet 25)');
