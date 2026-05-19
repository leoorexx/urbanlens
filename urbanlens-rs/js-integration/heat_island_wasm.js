/**
 * heat_island_wasm.js
 *
 * Drop-in integration module for UrbanLens index.html and map3d.html.
 *
 * Usage — add to index.html after wasm-pack build:
 *
 *   <script type="module" src="urbanlens-rs/js-integration/heat_island_wasm.js"></script>
 *
 * Then call window.HeatIsland.* from anywhere in the existing JS.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────

let wasmModule = null;
let wasmReady  = false;

async function initWasm() {
  try {
    const { default: init, score_district, best_scenario, demo_dataset, methodology_info } =
      await import('../../../wasm-pkg/urbanlens_wasm.js');
    await init();
    wasmModule = { score_district, best_scenario, demo_dataset, methodology_info };
    wasmReady  = true;
    console.log('🦀 UrbanLens WASM engine ready —', methodology_info());
    document.dispatchEvent(new CustomEvent('urbanlens-wasm-ready'));
  } catch (err) {
    console.warn('WASM not available (build with wasm-pack first). Falling back to JS scoring.', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback JavaScript scoring (mirrors Rust algorithm exactly)
// Used when WASM is not compiled yet — keeps the UI working during development.
// ─────────────────────────────────────────────────────────────────────────────

/** Linear normalise value into [0, 1] */
function norm(v, min, max) {
  if (max <= min) return 0.5;
  return Math.min(1, Math.max(0, (v - min) / (max - min)));
}

/**
 * Compute Heat Risk Score from STADTTEILE-style parameters.
 *
 * Weights (must sum to 1.0):
 *   LST 30 % · Imperviousness 20 % · NDVI 15 % · Tree cover 10 %
 *   Building morphology 8 % · Shade deficit 7 % · Green distance 5 % · Vulnerability 5 %
 *
 * ⚠ METHODISCHE GRENZEN (VDI 3787 Bl. 1):
 *   LST ≠ Lufttemperatur. Einzelzeitpunkte begrenzt aussagekräftig.
 */
function computeHeatRiskScore(params) {
  const {
    lst_delta = 2.0,
    versieg   = 60.0,
    ndvi      = 0.25,
    tree_cover= 15.0,
    far       = versieg / 100 * 4,
    svf       = Math.max(0.2, 1 - versieg / 120),
    shaded    = Math.min(0.9, tree_cover / 200 + (1 - versieg / 100) * 0.2),
    dist_green= Math.max(0, versieg * 6 - 100),
    vuln_score= 30.0,
  } = params;

  const s_lst   = norm(lst_delta,  -2.0, 6.0);
  const s_imp   = norm(versieg,     0.0, 100.0);
  const s_veg   = 1 - norm(ndvi,  -0.1, 0.7);
  const s_tree  = 1 - norm(tree_cover, 0, 80);
  const s_bld   = norm(far, 0, 5) * (1 - Math.min(1, svf));
  const s_shade = 1 - Math.min(1, shaded);
  const s_green = norm(dist_green, 0, 500);
  const s_vuln  = norm(vuln_score, 0, 100);

  return Math.min(100, Math.max(0, 100 * (
    0.30 * s_lst   +
    0.20 * s_imp   +
    0.15 * s_veg   +
    0.10 * s_tree  +
    0.08 * s_bld   +
    0.07 * s_shade +
    0.05 * s_green +
    0.05 * s_vuln
  )));
}

function heatRiskLabel(score) {
  if (score <= 25) return 'Gering';
  if (score <= 45) return 'Mäßig';
  if (score <= 65) return 'Erhöht';
  if (score <= 80) return 'Hoch';
  return 'Kritisch';
}

function heatRiskColor(score) {
  if (score <= 25) return '#22c55e';
  if (score <= 45) return '#84cc16';
  if (score <= 65) return '#eab308';
  if (score <= 80) return '#f97316';
  return '#ef4444';
}

/** Derive NDBI from sealing percentage (proxy when Sentinel-2 SWIR not available) */
function ndbiFromVersieg(versieg) {
  return Math.min(0.8, Math.max(-0.2, versieg / 100 * 0.65 - 0.15));
}

/** LCZ classification from structural parameters */
function classifyLCZ(versieg, height = null, coverage = null) {
  const h   = height   ?? (versieg > 75 ? 18 : versieg > 55 ? 12 : 7);
  const cov = coverage ?? versieg / 100 * 0.85;
  if (versieg >= 80 && h >= 25 && cov >= 0.4) return 'LCZ 1 · Dichte Hochhausbebauung';
  if (versieg >= 70 && h >= 10 && cov >= 0.4) return 'LCZ 2 · Dichte mittlere Bebauung';
  if (versieg >= 65 && cov >= 0.4)            return 'LCZ 3 · Dichte Niedrigbebauung';
  if (versieg >= 50 && h >= 25)               return 'LCZ 4 · Offene Hochhausbebauung';
  if (versieg >= 45 && h >= 10)               return 'LCZ 5 · Offene mittlere Bebauung';
  if (versieg >= 40)                          return 'LCZ 6 · Offene Niedrigbebauung';
  if (versieg >= 15)                          return 'LCZ 9 · Lockere Bebauung';
  return 'LCZ D · Niedrige Vegetation';
}

/** Vulnerability composite (0–100) */
function computeVulnerability(sgb2, kinderarmut, elderly = 15, facilities = 1) {
  return Math.min(100, 100 * (
    0.40 * norm(sgb2,       0, 60) +
    0.30 * norm(kinderarmut,0, 70) +
    0.20 * norm(elderly,    0, 30) +
    0.10 * norm(facilities, 0, 10)
  ));
}

// ─────────────────────────────────────────────────────────────────────────────
// SUHI class (mirrors Rust SurfaceTemperature::suhi_class)
// ─────────────────────────────────────────────────────────────────────────────
function suhiClass(delta) {
  if (delta < 0)   return 'Kühl (Kaltspot)';
  if (delta < 1.0) return 'Normal';
  if (delta < 2.0) return 'Leicht erhöht';
  if (delta < 3.5) return 'Hitzeinsel';
  return 'Kritische Hitzeinsel';
}

// ─────────────────────────────────────────────────────────────────────────────
// Best-Scenario (JS fallback — mirrors scenario.rs logic)
// ─────────────────────────────────────────────────────────────────────────────

const EFFECTS = {
  StreetTrees:     { lst: 1.2, unc: 0.6, mechanism: 'Evapotranspiration + Verschattung' },
  Unsealing:       { lst: 0.8, unc: 0.4, mechanism: 'Reduzierte Wärmespeicherung' },
  PocketPark:      { lst: 1.5, unc: 0.8, mechanism: 'Kaltluftentstehungspunkt' },
  GreenRoof:       { lst: 0.5, unc: 0.3, mechanism: 'Substrat-Kühlung + Evaporation' },
  FacadeGreening:  { lst: 0.4, unc: 0.25,mechanism: 'Transpirationskühlung' },
  BrightSurfaces:  { lst: 0.7, unc: 0.4, mechanism: 'Höhere Albedo' },
  ShadeStructures: { lst: 0.6, unc: 0.3, mechanism: 'Strahlungsblockierung' },
  WaterFeatures:   { lst: 1.0, unc: 0.5, mechanism: 'Evaporative Kühlung' },
  SpongeCity:      { lst: 0.6, unc: 0.35,mechanism: 'Bodenfeuchtigkeit' },
  ColdAirCorridor: { lst: 1.8, unc: 1.0, mechanism: 'Kaltluftabfluss' },
};

const LABELS = {
  StreetTrees:     ['🌳', 'Straßenbäume pflanzen'],
  Unsealing:       ['🪨', 'Entsiegelung'],
  PocketPark:      ['🌿', 'Pocket Park'],
  GreenRoof:       ['🏠', 'Dachbegrünung'],
  FacadeGreening:  ['🌱', 'Fassadenbegrünung'],
  BrightSurfaces:  ['⬜', 'Helle Oberflächen'],
  ShadeStructures: ['☂', 'Verschattungselemente'],
  WaterFeatures:   ['💧', 'Wasserflächen / Trinkbrunnen'],
  SpongeCity:      ['🧽', 'Schwammstadt-Elemente'],
  ColdAirCorridor: ['💨', 'Kaltluftkorridor aktivieren'],
};

function applicability(key, d) {
  const { versieg, ndvi, tree_cover, dist_green = Math.max(0, versieg * 6 - 100),
          dist_water = Math.min(2000, versieg * 8 + 100),
          cold_corridor = versieg < 40 ? 0.7 : versieg < 60 ? 0.35 : 0.1,
          solar = 350 - tree_cover * 2 - (1 - versieg / 100) * 80,
          shaded = Math.min(0.9, tree_cover / 200 + (1 - versieg / 100) * 0.2),
          far    = versieg / 100 * 4,
          cov    = versieg / 100 * 0.85 } = d;
  switch(key) {
    case 'StreetTrees':     return (norm(versieg, 30, 100) + (1 - norm(tree_cover, 0, 40))) / 2;
    case 'Unsealing':       return norm(versieg, 50, 100);
    case 'PocketPark':      return norm(dist_green, 100, 600) * 0.6 + norm(versieg * 50, 500, 5000) * 0.4;
    case 'GreenRoof':       return norm(cov, 0.3, 1.0);
    case 'FacadeGreening':  return norm(far, 1.0, 5.0);
    case 'BrightSurfaces':  return (norm(solar, 150, 350) + norm(versieg, 50, 100)) / 2;
    case 'ShadeStructures': return (1 - shaded) * 0.6 + norm(solar, 200, 350) * 0.4;
    case 'WaterFeatures':   return (norm(d.lst_delta, 1.5, 5) + norm(dist_water, 200, 1000)) / 2;
    case 'SpongeCity':      return norm(versieg, 40, 100);
    case 'ColdAirCorridor': return Math.min(1, cold_corridor);
    default:                return 0.5;
  }
}

/**
 * Compute Best-Scenario interventions for a district.
 * Mirrors compute_best_scenario() in scenario.rs.
 *
 * @param {Object} d - District data (versieg, lst_delta, ndvi, tree_cover, vuln_score, heat_risk_score)
 * @returns {Object} - ranked_interventions, projected_heat_risk_score, etc.
 */
function computeBestScenarioJS(d) {
  const heatIntensity = norm(d.heat_risk_score || 50, 30, 100);
  const vuln          = norm(d.vuln_score || 30, 20, 100);

  const ranked = Object.keys(EFFECTS).map(key => {
    const appl = Math.min(1, Math.max(0, applicability(key, d)));
    const ps   = Math.min(100, (appl * 0.45 + heatIntensity * 0.35 + vuln * 0.20) * 100);
    const eff  = EFFECTS[key];
    const [emoji, label] = LABELS[key];
    return {
      key, emoji, label,
      priority_score:        ps,
      estimated_cooling_celsius: eff.lst * appl,
      applicability:         appl,
      uncertainty:           eff.unc,
      rationale: `${emoji} ${label}: ${eff.mechanism}. Anwendbarkeit: ${(appl*100).toFixed(0)}%. ~${(eff.lst*appl).toFixed(1)}°C LST-Reduktion (±${eff.unc}°C).`,
    };
  }).sort((a, b) => b.priority_score - a.priority_score);

  // Top-3 combined cooling with diminishing returns
  const topCooling = ranked.slice(0, 3).reduce((sum, r, i) =>
    sum + r.estimated_cooling_celsius * (1 - 0.25 * i), 0
  );
  const capped = Math.min(topCooling, (d.lst_delta || 2) * 0.70);

  // Simulate modified score
  const modified = {
    ...d,
    lst_delta:  Math.max(-1, (d.lst_delta || 2) - capped * 0.8),
    versieg:    Math.max(0,  (d.versieg || 60) - ranked[0].applicability * 10),
    ndvi:       Math.min(0.9, (d.ndvi || 0.25) + ranked[0].applicability * 0.12),
    tree_cover: Math.min(100, (d.tree_cover || 15) + ranked[0].applicability * 10),
  };
  const projectedScore = computeHeatRiskScore(modified);
  const reductionPct   = Math.min(70, ((d.heat_risk_score - projectedScore) / Math.max(1, d.heat_risk_score)) * 100);

  return {
    ranked_interventions:           ranked,
    current_heat_risk_score:        d.heat_risk_score,
    projected_heat_risk_score:      projectedScore,
    estimated_lst_reduction:        capped,
    estimated_risk_reduction_pct:   Math.max(0, reductionPct),
    methodology_note: 'Alle Kühlungsabschätzungen sind Modellwerte (UBA 2021, BBSR 2023, WHO HHAP). Keine lokalen Messdaten. LST ≠ Lufttemperatur (VDI 3787 Bl. 1).',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

window.HeatIsland = {
  /**
   * Score a district from STADTTEILE-style parameters.
   * Auto-routes to WASM if available, falls back to JS.
   *
   * @param {Object} params - { id, name, lat, lon, lst_delta, versieg, ndvi, tree_cover, sgb2, kinderarmut, ... }
   * @returns {Object} - scoring result with heat_risk_score, lcz, suhi_class, etc.
   */
  async score(params) {
    if (wasmReady) {
      const json = wasmModule.score_district(JSON.stringify(params));
      return JSON.parse(json);
    }
    // JS fallback
    const vuln = computeVulnerability(params.sgb2 || 15, params.kinderarmut || 18,
                                      params.elderly_pct || 15, params.vulnerable_facilities || 1);
    const score = computeHeatRiskScore({ ...params, vuln_score: vuln });
    return {
      ...params,
      heat_risk_score: score,
      heat_risk_label: heatRiskLabel(score),
      heat_risk_color: heatRiskColor(score),
      is_hotspot:      score >= 65,
      is_coolspot:     score < 30,
      suhi_class:      suhiClass(params.lst_delta || 0),
      ndbi:            ndbiFromVersieg(params.versieg || 60),
      lcz:             classifyLCZ(params.versieg || 60),
      vuln_score:      vuln,
      heat_burden:     score,
      methodology_note:'LST ≠ Lufttemperatur (VDI 3787 Bl. 1). Modellwerte — keine lokalen Messdaten.',
    };
  },

  /**
   * Compute Best-Scenario interventions for a scored district.
   * Auto-routes to WASM if available.
   *
   * @param {Object} scored - Output of HeatIsland.score()
   * @returns {Object} - ranked_interventions, projected_heat_risk_score, etc.
   */
  async bestScenario(scored) {
    if (wasmReady) {
      const json = wasmModule.best_scenario(JSON.stringify(scored));
      return JSON.parse(json);
    }
    return computeBestScenarioJS(scored);
  },

  /** Return demo GeoJSON FeatureCollection (9 Frankfurt districts). */
  async demoDataset() {
    if (wasmReady) {
      return JSON.parse(wasmModule.demo_dataset());
    }
    // Return minimal inline demo when WASM not available
    return { type: 'FeatureCollection', features: [] };
  },

  /** True if WASM engine is loaded. */
  get ready()  { return wasmReady; },
  get version(){ return wasmReady ? wasmModule.methodology_info() : 'JS fallback (WASM not built)'; },

  // Expose helpers for unit testing and direct use
  _js: { computeHeatRiskScore, computeBestScenarioJS, computeVulnerability,
         classifyLCZ, suhiClass, heatRiskLabel, heatRiskColor },
};

// Auto-init on load
initWasm();
