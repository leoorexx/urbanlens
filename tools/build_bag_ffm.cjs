#!/usr/bin/env node
/*  build_bag_ffm.cjs
    Baut public/data/layers/bag_ffm.json — Frankfurt-Pendant zu bag_utr.json.
    ALLE FFM-Gebäude aus OSM (getilte Overpass-Abfrage) mit ECHTEN Höhen
    (height-Tag → building:levels×3.3 → Typ-Default), damit die Skyline
    (Commerzbank Tower 259 m, Messeturm 257 m …) real dargestellt wird.
    CO₂/Hitze/Hochwasser/Epoche werden vom nächsten bereits analysierten
    Gebäude geerbt (co2_buildings_ffm / heat_exposure_ffm / flood_exposure_ffm).
    Ausgabe: kompaktes Array {g:[ring], co2, lst, flood, era, u, h}
*/
const fs = require('fs');
const L = __dirname + '/../public/data/layers/';
const SRC = __dirname + '/_src/';
if (!fs.existsSync(SRC)) fs.mkdirSync(SRC, { recursive: true });

// FFM Kern-BBox (identisch zum bestehenden co2_buildings_ffm-Umfang)
const BB = { s: 50.048, w: 8.548, n: 50.222, e: 8.752 };
const NX = 6, NY = 6;                    // 6×6 Kacheln
const EP = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter'
];
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Führt eine Overpass-Query aus. Gibt Elemente zurück, oder null bei echtem Fehler
// (rate-limit/HTTP), damit fehlgeschlagene Kacheln von echten Leerkacheln
// unterschieden und gezielt wiederholt werden können.
async function overpass(q, attempt = 0) {
  const ep = EP[attempt % EP.length];
  try {
    const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'nicehere-urbanlens/1.0 (contact: leonard-rexhepi@web.de)',
        'Accept': 'application/json' } });
    if (r.status === 429 || r.status === 504) throw new Error('busy ' + r.status);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    return j.elements || [];
  } catch (err) {
    if (attempt < 5) { await sleep(6000 + attempt * 5000); return overpass(q, attempt + 1); }
    console.warn('    Query fehlgeschlagen:', err.message); return null;
  }
}
const tile = (s, w, n, e) => overpass(`[out:json][timeout:180];(way["building"](${s},${w},${n},${e}););out geom;`);

// ---- Höhe aus OSM-Tags ----
const TYPE_H = { residential: 9, apartments: 12, house: 8, detached: 8, terrace: 9,
  semidetached_house: 8, bungalow: 5, dormitory: 14, office: 16, commercial: 9,
  retail: 7, supermarket: 7, industrial: 8, warehouse: 9, hospital: 15, school: 10,
  university: 14, church: 16, hotel: 18, public: 12, garage: 3, garages: 3, shed: 3,
  roof: 3, carport: 3, greenhouse: 4, hut: 3, allotment_house: 3, service: 4 };
function parseH(t) {
  if (t.height) { let v = parseFloat(String(t.height).replace(',', '.')); if (!isNaN(v)) { if (/ft|'/.test(t.height)) v *= 0.3048; return v; } }
  if (t['building:levels']) { let l = parseFloat(String(t['building:levels']).replace(',', '.')); if (!isNaN(l)) return Math.max(3, l * 3.3 + 1); }
  return null;
}
// ---- Nutzung → Kürzel (wie M3_USE in index.html) ----
function mapUse(b) {
  if (['residential','apartments','house','detached','terrace','semidetached_house','bungalow','dormitory','farm','static_caravan'].includes(b)) return 'res';
  if (b === 'office') return 'off';
  if (['commercial','retail','supermarket','shop','kiosk','mall','marketplace'].includes(b)) return 'ret';
  if (['industrial','warehouse','factory','manufacture'].includes(b)) return 'ind';
  if (['hospital','clinic'].includes(b)) return 'hea';
  if (['school','university','college','kindergarten'].includes(b)) return 'edu';
  if (['church','cathedral','chapel','mosque','synagogue','temple','civic','public','government','townhall'].includes(b)) return 'asm';
  if (['hotel','hostel','motel'].includes(b)) return 'hot';
  if (['garage','garages','shed','roof','carport','hut','allotment_house','greenhouse','service','bunker','cabin'].includes(b)) return '';
  return 'oth';
}
const centroid = ring => { let x = 0, y = 0; for (const p of ring) { x += p[0]; y += p[1]; } return [x / ring.length, y / ring.length]; };

// ---- Grid-Index für nächstes analysiertes Gebäude ----
function gridIndex(feats, pick) {
  const G = new Map(); const CELL = 0.003;
  for (const f of feats) {
    const c = centroid(f.geometry.coordinates[0]);
    const val = pick(f.properties); if (val == null) continue;
    const k = Math.round(c[0] / CELL) + '_' + Math.round(c[1] / CELL);
    (G.get(k) || G.set(k, []).get(k)).push([c[0], c[1], val]);
  }
  return { G, CELL };
}
function nearest(idx, lng, lat, R) {
  const { G, CELL } = idx; let best = null, bd = R * R;
  const cx = Math.round(lng / CELL), cy = Math.round(lat / CELL);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const arr = G.get((cx + dx) + '_' + (cy + dy)); if (!arr) continue;
    for (const p of arr) {
      const ddx = (p[0] - lng) * 0.64, ddy = (p[1] - lat);      // grobe Meter-Gewichtung
      const d = ddx * ddx + ddy * ddy;
      if (d < bd) { bd = d; best = p[2]; }
    }
  }
  return best;
}

(async () => {
  console.log('▶ Lade analysierte FFM-Gebäude (CO₂/Hitze/Hochwasser) …');
  const co2f = JSON.parse(fs.readFileSync(L + 'co2_buildings_ffm.geojson', 'utf8')).features;
  const floodf = JSON.parse(fs.readFileSync(L + 'flood_exposure_ffm.geojson', 'utf8')).features;
  // Typ-Median CO₂ als Fallback
  const byType = {}; for (const f of co2f) { const b = f.properties.building, v = f.properties.co2_kg_m2; if (v == null) continue; (byType[b] = byType[b] || []).push(v); }
  const med = a => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const typeCO2 = {}; for (const k in byType) typeCO2[k] = med(byType[k]);
  const allCO2 = med(co2f.map(f => f.properties.co2_kg_m2).filter(v => v != null));
  const idxCO2 = gridIndex(co2f, p => p.co2_kg_m2);
  const idxLST = gridIndex(co2f, p => p.lst_delta);
  const idxERA = gridIndex(co2f, p => (p.age_class && p.age_class !== 'unknown') ? p.age_class : null);
  const idxFLD = gridIndex(floodf, p => p.flood_risk);
  const R = 0.0035;                                            // ~350 m Suchradius

  const seen = new Set(); const out = [];
  function ingest(els) {
    let added = 0;
    for (const el of (els || [])) {
      if (el.type !== 'way' || seen.has(el.id) || !el.geometry) continue;
      seen.add(el.id);
      const ring = el.geometry.filter(p => p.lon != null).map(p => [Math.round(p.lon * 1e5) / 1e5, Math.round(p.lat * 1e5) / 1e5]);
      if (ring.length < 4) continue;
      if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring.pop();
      if (ring.length < 3) continue;
      const t = el.tags || {}; const b = t.building || 'yes';
      const u = mapUse(b);
      const c = centroid(ring);
      const h = Math.round((parseH(t) || TYPE_H[b] || 9) * 10) / 10;
      const acc = (u === '');                                  // Nebengebäude → grau
      const co2 = acc ? null : Math.round(nearest(idxCO2, c[0], c[1], R) || typeCO2[b] || allCO2);
      const lstv = nearest(idxLST, c[0], c[1], R);
      const lst = (acc || lstv == null) ? null : Math.round(lstv * 10) / 10;
      const flood = nearest(idxFLD, c[0], c[1], R * 1.4) || null;
      const era = nearest(idxERA, c[0], c[1], R) || '';
      out.push({ g: ring, co2, lst, flood, era, u, h });
      added++;
    }
    return added;
  }

  // Kachel-Cache auf Platte → resümierbar: erneuter Lauf lädt nur noch fehlende Kacheln
  const CACHE = SRC + 'ffm_tiles/';
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
  const dLat = (BB.n - BB.s) / NY, dLon = (BB.e - BB.w) / NX;
  const box = (iy, ix) => [BB.s + iy * dLat, BB.w + ix * dLon, BB.s + iy * dLat + dLat, BB.w + ix * dLon + dLon];
  async function getTile(iy, ix) {
    const fp = CACHE + `t_${iy}_${ix}.json`;
    if (fs.existsSync(fp)) { try { return { els: JSON.parse(fs.readFileSync(fp, 'utf8')), cached: true }; } catch (e) {} }
    const [s, w, n, e] = box(iy, ix);
    const els = await tile(s, w, n, e);
    if (els !== null) fs.writeFileSync(fp, JSON.stringify(els));
    return { els, cached: false };
  }

  console.log('▶ Fetch aller FFM-Gebäude aus OSM (' + (NX * NY) + ' Kacheln, gecacht) …');
  let missing = [];
  for (let iy = 0; iy < NY; iy++) for (let ix = 0; ix < NX; ix++) missing.push([iy, ix]);
  for (let pass = 1; pass <= 10 && missing.length; pass++) {
    console.log(`  Pass ${pass}: ${missing.length} Kacheln offen`);
    const still = [];
    for (const [iy, ix] of missing) {
      const { els, cached } = await getTile(iy, ix);
      if (els === null) { still.push([iy, ix]); process.stdout.write(`    K${iy * NX + ix + 1}:FEHLER `); await sleep(9000); }
      else { process.stdout.write(`    K${iy * NX + ix + 1}:${els.length}${cached ? 'c' : ''} `); if (!cached) await sleep(4500); }
    }
    process.stdout.write('\n');
    missing = still;
    if (missing.length && pass < 10) { console.log(`  → ${missing.length} offen, Pause 25s …`); await sleep(25000); }
  }
  if (missing.length) console.warn('⚠ weiterhin fehlend:', missing.length, '— Tool erneut laufen lassen füllt sie nach.');

  // Skyline-Garantie: alle height-getaggten + hohen Gebäude der ganzen BBox (gecacht)
  const skyFp = CACHE + 'skyline.json';
  let sky = null;
  if (fs.existsSync(skyFp)) { try { sky = JSON.parse(fs.readFileSync(skyFp, 'utf8')); } catch (e) {} }
  if (sky === null) {
    console.log('▶ Skyline-Sicherung (height/levels-getaggte Gebäude) …');
    sky = await overpass(`[out:json][timeout:180];(way["building"]["height"](${BB.s},${BB.w},${BB.n},${BB.e});way["building"]["building:levels"](${BB.s},${BB.w},${BB.n},${BB.e}););out geom;`);
    if (sky !== null) fs.writeFileSync(skyFp, JSON.stringify(sky));
  }

  // Aufbau aus Cache (alles was da ist)
  console.log('▶ Baue bag_ffm.json aus Cache …');
  for (let iy = 0; iy < NY; iy++) for (let ix = 0; ix < NX; ix++) {
    const fp = CACHE + `t_${iy}_${ix}.json`;
    if (fs.existsSync(fp)) { try { ingest(JSON.parse(fs.readFileSync(fp, 'utf8'))); } catch (e) {} }
  }
  if (sky) console.log(`  Skyline +${ingest(sky)}`);

  fs.writeFileSync(L + 'bag_ffm.json', JSON.stringify(out));
  const sz = (fs.statSync(L + 'bag_ffm.json').size / 1e6).toFixed(1);
  const tall = out.filter(b => b.h >= 100).length;
  const maxH = Math.max(...out.map(b => b.h));
  console.log(`✔ bag_ffm.json  ${out.length} Gebäude  ${sz} MB`);
  console.log(`  Höchstes: ${maxH} m · ≥100 m: ${tall} · mit CO₂: ${out.filter(b => b.co2 != null).length} · mit Hitze: ${out.filter(b => b.lst != null).length}`);
})();
