// Design-Paket 2b: restliche Layer-Panel-Strings (Qualitätslegenden, Quellen-Tabelle, lnames)
const fs=require('fs');
const P='index.html';
let h=fs.readFileSync(P,'utf8');
let n=0;
function rep(a,b){if(h.indexOf(a)<0){console.error('MISS: '+a.slice(0,90));process.exitCode=1;return;}h=h.split(a).join(b);n++;}

// ── lnames ohne data-i18n ──
rep('<span class="lname">Bänke — Qualitätsstufen</span>','<span class="lname"><span data-i18n="lay_benches_q">Bänke — Qualitätsstufen</span></span>');
rep('<span class="lname">Fußwege — Qualitätsstufen</span>','<span class="lname"><span data-i18n="lay_foot_q">Fußwege — Qualitätsstufen</span></span>');
rep('<span class="lname">Lokal vs. Kette</span>','<span class="lname"><span data-i18n="lay_retail2">Lokaler Handel vs. Kette</span></span>');
rep('<span class="lname">Sociability (Café, Spiel, Brunnen)</span>','<span class="lname"><span data-i18n="lay_social2">Treffpunkte (Café, Spiel, Brunnen)</span></span>');
rep('<span class="lname">Sport & Freizeit</span>','<span class="lname"><span data-i18n="lay_sport2">Sport & Freizeit</span></span>');
// Klartext: MIV → Auto-Dominanz
rep('<span data-i18n="lay_parking">Parkplätze (MIV-Dominanz)</span>','<span data-i18n="lay_parking">Parkplätze — Auto-Dominanz</span>');
rep("lay_parking:'Parkplätze (MIV-Dominanz)'","lay_parking:'Parkplätze — Auto-Dominanz'");
rep("lay_parking:'Parking (car dominance)'","lay_parking:'Parking — car dominance'");
rep("lay_parking:'Parkeerplaatsen (autodominantie)'","lay_parking:'Parkeerplaatsen — autodominantie'");

// ── Qualitäts-Legenden (.llegend) ──
rep(' Radwege:</b>',' <span data-i18n="leg_bike">Radwege:</span></b>');
rep('</span> Hauptstraße ohne Radweg</div>','</span> <span data-i18n="leg_bike_none">Hauptstraße ohne Radweg</span></div>');
rep('</span> Getrennter Radweg</div>','</span> <span data-i18n="leg_bike_sep">Getrennter Radweg</span></div>');
rep('</span> Schutzstreifen</div>','</span> <span data-i18n="leg_bike_lane">Schutzstreifen</span></div>');
rep(' Bänke:</b>',' <span data-i18n="leg_bench">Bänke:</span></b>');
rep('width:8px"></div>Überdacht + barrierefrei</div>','width:8px"></div><span data-i18n="leg_bench1">Überdacht + barrierefrei</span></div>');
rep('width:7px"></div>Öffentlich + Rückenlehne</div>','width:7px"></div><span data-i18n="leg_bench2">Öffentlich + Rückenlehne</span></div>');
rep('width:6px"></div>Einfach vorhanden</div>','width:6px"></div><span data-i18n="leg_bench3">Einfach vorhanden</span></div>');
rep('width:6px"></div>Nur für Kunden</div>','width:6px"></div><span data-i18n="leg_bench4">Nur für Kunden</span></div>');
rep(' Fußwege:</b>',' <span data-i18n="leg_foot">Fußwege:</span></b>');
rep('height:4px"></div>Sehr gut (barrierefrei, beleuchtet)</div>','height:4px"></div><span data-i18n="leg_foot1">Sehr gut (barrierefrei, beleuchtet)</span></div>');
rep('height:3px"></div>Gut (befestigt)</div>','height:3px"></div><span data-i18n="leg_foot2">Gut (befestigt)</span></div>');
rep('height:3px"></div>Schlecht (unbefestigt/eng)</div>','height:3px"></div><span data-i18n="leg_foot3">Schlecht (unbefestigt/eng)</span></div>');
rep(' Hitzeinsel (LST-Delta):</b>',' <span data-i18n="leg_heat">Hitzeinseln — Oberflächentemperatur:</span></b>');
rep('<span>Kühl</span><span>+2°C</span><span>+3°C</span><span>+4°C</span><span>Extrem</span>',
    '<span data-i18n="leg_cool">Kühl</span><span>+2°C</span><span>+3°C</span><span>+4°C</span><span data-i18n="leg_extreme">Extrem</span>');

// ── Quellen-Tabelle: linke Spalten + deutsche Quellwerte ──
rep('font-weight:700">Hitze / LST</td>','font-weight:700"><span data-i18n="src_r1">Hitze / LST</span></td>');
rep('font-weight:700">Versiegelung</td>','font-weight:700"><span data-i18n="src_r2">Versiegelung</span></td>');
rep('font-weight:700">Bäume</td>','font-weight:700"><span data-i18n="src_r3">Bäume</span></td>');
rep('font-weight:700">Hochwasser</td>','font-weight:700"><span data-i18n="src_r4">Hochwasser</span></td>');
rep('font-weight:700">Lärm</td>','font-weight:700"><span data-i18n="src_r5">Lärm</span></td>');
rep('font-weight:700">Gebäude/CO₂</td>','font-weight:700"><span data-i18n="src_r6">Gebäude/CO₂</span></td>');
rep('font-weight:700">Sozialdaten</td>','font-weight:700"><span data-i18n="src_r7">Sozialdaten</span></td>');
rep('<td style="text-align:right">Stadtkataster FFM/Gem. Utrecht · OSM live</td>','<td style="text-align:right"><span data-i18n="src_v3">Stadtkataster FFM / Gem. Utrecht · OSM live</span></td>');
rep('<td style="text-align:right">EU-Umgebungslärm-RL · OSM Straßenklassen</td>','<td style="text-align:right"><span data-i18n="src_v5">EU-Umgebungslärm-RL · OSM Straßenklassen</span></td>');
rep('<td style="text-align:right">Utrecht: PDOK BAG (echtes Baujahr) · FFM: IWU-Typologie</td>','<td style="text-align:right"><span data-i18n="src_v6">Utrecht: PDOK BAG (echtes Baujahr) · FFM: IWU-Typologie</span></td>');

// ── STR-Keys (DE/EN/NL) — Anker: sec_soc2 je Sprache ──
rep("sec_soc2:'Aufenthalt & soziales Leben',",
"sec_soc2:'Aufenthalt & soziales Leben',lay_benches_q:'Bänke — Qualitätsstufen',lay_foot_q:'Fußwege — Qualitätsstufen',lay_retail2:'Lokaler Handel vs. Kette',lay_social2:'Treffpunkte (Café, Spiel, Brunnen)',lay_sport2:'Sport & Freizeit',leg_bike:'Radwege:',leg_bike_none:'Hauptstraße ohne Radweg',leg_bike_sep:'Getrennter Radweg',leg_bike_lane:'Schutzstreifen',leg_bench:'Bänke:',leg_bench1:'Überdacht + barrierefrei',leg_bench2:'Öffentlich + Rückenlehne',leg_bench3:'Einfach vorhanden',leg_bench4:'Nur für Kunden',leg_foot:'Fußwege:',leg_foot1:'Sehr gut (barrierefrei, beleuchtet)',leg_foot2:'Gut (befestigt)',leg_foot3:'Schlecht (unbefestigt/eng)',leg_heat:'Hitzeinseln — Oberflächentemperatur:',leg_cool:'Kühl',leg_extreme:'Extrem',src_r1:'Hitze / LST',src_r2:'Versiegelung',src_r3:'Bäume',src_r4:'Hochwasser',src_r5:'Lärm',src_r6:'Gebäude/CO₂',src_r7:'Sozialdaten',src_v3:'Stadtkataster FFM / Gem. Utrecht · OSM live',src_v5:'EU-Umgebungslärm-RL · OSM Straßenklassen',src_v6:'Utrecht: PDOK BAG (echtes Baujahr) · FFM: IWU-Typologie',");
rep("sec_soc2:'Public space & social life',",
"sec_soc2:'Public space & social life',lay_benches_q:'Benches — quality levels',lay_foot_q:'Footpaths — quality levels',lay_retail2:'Local retail vs. chains',lay_social2:'Meeting places (café, play, fountain)',lay_sport2:'Sports & leisure',leg_bike:'Cycle paths:',leg_bike_none:'Main road without cycle path',leg_bike_sep:'Separated cycle path',leg_bike_lane:'Advisory lane',leg_bench:'Benches:',leg_bench1:'Covered + accessible',leg_bench2:'Public + backrest',leg_bench3:'Basic',leg_bench4:'Customers only',leg_foot:'Footpaths:',leg_foot1:'Very good (accessible, lit)',leg_foot2:'Good (paved)',leg_foot3:'Poor (unpaved/narrow)',leg_heat:'Heat islands — surface temperature:',leg_cool:'Cool',leg_extreme:'Extreme',src_r1:'Heat / LST',src_r2:'Sealing',src_r3:'Trees',src_r4:'Flood',src_r5:'Noise',src_r6:'Buildings/CO₂',src_r7:'Social data',src_v3:'City registries FFM / Utrecht · OSM live',src_v5:'EU Environmental Noise Dir. · OSM road classes',src_v6:'Utrecht: PDOK BAG (real construction year) · FFM: IWU typology',");
rep("sec_soc2:'Verblijf & sociaal leven',",
"sec_soc2:'Verblijf & sociaal leven',lay_benches_q:'Bankjes — kwaliteitsniveaus',lay_foot_q:'Voetpaden — kwaliteitsniveaus',lay_retail2:'Lokale winkels vs. ketens',lay_social2:'Ontmoetingsplekken (café, spel, fontein)',lay_sport2:'Sport & vrije tijd',leg_bike:'Fietspaden:',leg_bike_none:'Hoofdweg zonder fietspad',leg_bike_sep:'Vrijliggend fietspad',leg_bike_lane:'Fietsstrook',leg_bench:'Bankjes:',leg_bench1:'Overdekt + toegankelijk',leg_bench2:'Openbaar + rugleuning',leg_bench3:'Eenvoudig aanwezig',leg_bench4:'Alleen voor klanten',leg_foot:'Voetpaden:',leg_foot1:'Zeer goed (toegankelijk, verlicht)',leg_foot2:'Goed (verhard)',leg_foot3:'Slecht (onverhard/smal)',leg_heat:'Hitte-eilanden — oppervlaktetemperatuur:',leg_cool:'Koel',leg_extreme:'Extreem',src_r1:'Hitte / LST',src_r2:'Verharding',src_r3:'Bomen',src_r4:'Overstroming',src_r5:'Geluid',src_r6:'Gebouwen/CO₂',src_r7:'Sociale data',src_v3:'Stadsregisters FFM / Utrecht · OSM live',src_v5:'EU-omgevingslawaai-RL · OSM wegklassen',src_v6:'Utrecht: PDOK BAG (echt bouwjaar) · FFM: IWU-typologie',");

fs.writeFileSync(P,h);
console.log('OK — '+n+' Ersetzungen');
