//! WebAssembly bindings for UrbanLens.
//!
//! ## Build
//! ```bash
//! # Install wasm-pack if needed
//! cargo install wasm-pack
//!
//! # Build the WASM package
//! cd urbanlens-rs
//! wasm-pack build crates/urbanlens-wasm --target web --out-dir ../../wasm-pkg
//! ```
//!
//! ## Integration in index.html / map3d.html
//! ```html
//! <script type="module">
//!   import init, { score_district, best_scenario, demo_dataset } from './wasm-pkg/urbanlens_wasm.js';
//!
//!   await init();
//!
//!   // Score any district with raw values from the STADTTEILE data
//!   const result = score_district({
//!     id: "bahnhofsviertel",
//!     name: "Bahnhofsviertel",
//!     lat: 50.1075, lon: 8.6701,
//!     lst_delta: 3.9,
//!     versieg: 88,
//!     ndvi: 0.08,
//!     tree_cover: 4,
//!     sgb2: 62,
//!     kinderarmut: 70,
//!     elderly_pct: 14,
//!     vulnerable_facilities: 4,
//!   });
//!   console.log(result.heat_risk_score, result.heat_risk_label);
//!
//!   // Best-scenario for one district
//!   const scenario = best_scenario(result);
//!   console.log(scenario.ranked_interventions[0].label);
//!
//!   // Or load the full demo dataset
//!   const all = demo_dataset();
//! </script>
//! ```

use wasm_bindgen::prelude::*;

pub mod green;

use urbanlens_core::demo::{build_frankfurt_demo, make_bahnhofsviertel};
use urbanlens_core::export::geojson::cells_to_geojson;
use urbanlens_core::heat_islands::geospatial::StadtteilRecord;
use urbanlens_core::heat_islands::scoring::HeatRiskWeights;
use urbanlens_core::heat_islands::scenario::compute_best_scenario;

// ─────────────────────────────────────────────────────────────────────────────
// JS-facing types (plain JSON round-trip — avoids wasm-bindgen struct limits)
// ─────────────────────────────────────────────────────────────────────────────

/// Score a single district described by raw indicator values.
///
/// Input is a plain JS object with the same fields as the `STADTTEILE`
/// entries in index.html (plus lat/lon).
/// Output is a JSON string (parse with `JSON.parse` on the JS side).
#[wasm_bindgen]
pub fn score_district(input_json: &str) -> Result<String, JsValue> {
    let v: serde_json::Value = serde_json::from_str(input_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let record = StadtteilRecord {
        id:    v["id"].as_str().unwrap_or("unknown").to_string(),
        name:  v["name"].as_str().unwrap_or("Unbekannt").to_string(),
        lat:   v["lat"].as_f64().unwrap_or(50.11),
        lon:   v["lon"].as_f64().unwrap_or(8.68),
        lst_delta:            v["lst_delta"].as_f64().unwrap_or(2.0) as f32,
        versieg:              v["versieg"].as_f64().unwrap_or(60.0) as f32,
        ndvi:                 v["ndvi"].as_f64().unwrap_or(0.25) as f32,
        tree_cover:           v["tree_cover"].as_f64().unwrap_or(15.0) as f32,
        sgb2:                 v["sgb2"].as_f64().unwrap_or(15.0) as f32,
        kinderarmut:          v["kinderarmut"].as_f64().unwrap_or(18.0) as f32,
        elderly_pct:          v["elderly_pct"].as_f64().unwrap_or(15.0) as f32,
        vulnerable_facilities: v["vulnerable_facilities"].as_u64().unwrap_or(1) as u32,
        geometry: None,
    };

    let weights = HeatRiskWeights::default();
    let cell = record.into_cell(&weights)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Build a JSON payload compatible with the existing JS drawer panel
    let out = serde_json::json!({
        "id":   cell.id,
        "name": cell.name,
        "heat_risk_score":  cell.heat_risk_score,
        "heat_risk_label":  cell.risk_label(),
        "heat_risk_color":  cell.risk_color(),
        "is_hotspot":       cell.is_hotspot(),
        "is_coolspot":      cell.is_coolspot(),
        "lst_delta":        cell.surface_temperature.delta_celsius,
        "suhi_class":       cell.surface_temperature.suhi_class(),
        "ndvi":             cell.vegetation.ndvi,
        "ndvi_class":       cell.vegetation.ndvi_class(),
        "ndbi":             cell.vegetation.ndbi,
        "tree_cover":       cell.vegetation.tree_cover_pct,
        "versieg":          cell.imperviousness.fraction_pct,
        "lcz":              cell.local_climate_zone.label(),
        "lcz_nocturnal":    cell.local_climate_zone.nocturnal_delta_celsius(),
        "vuln_score":       cell.vulnerability.composite,
        "heat_burden":      cell.heat_burden.composite,
        "dist_green_m":     cell.cooling_potential.distance_to_green_m,
        "measures":         cell.recommended_measures.iter()
                                .map(|m| format!("{} {}", m.emoji(), m.label()))
                                .collect::<Vec<_>>(),
        "methodology_note": "LST ≠ Lufttemperatur (VDI 3787 Bl.1). Modellwerte — keine lokalen Messdaten.",
    });

    serde_json::to_string(&out)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Compute the Best-Scenario for a previously scored district.
///
/// Input is the JSON string returned by `score_district`.
/// Output is a JSON string with ranked interventions and cooling estimates.
#[wasm_bindgen]
pub fn best_scenario(scored_json: &str) -> Result<String, JsValue> {
    // Re-hydrate into a full cell via StadtteilRecord (simplest round-trip)
    let v: serde_json::Value = serde_json::from_str(scored_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let record = StadtteilRecord {
        id:   v["id"].as_str().unwrap_or("unknown").to_string(),
        name: v["name"].as_str().unwrap_or("Unbekannt").to_string(),
        lat:  50.11, lon: 8.68,
        lst_delta:            v["lst_delta"].as_f64().unwrap_or(2.0) as f32,
        versieg:              v["versieg"].as_f64().unwrap_or(60.0) as f32,
        ndvi:                 v["ndvi"].as_f64().unwrap_or(0.25) as f32,
        tree_cover:           v["tree_cover"].as_f64().unwrap_or(15.0) as f32,
        sgb2:                 v["vuln_score"].as_f64().unwrap_or(20.0) as f32 * 0.6,
        kinderarmut:          v["vuln_score"].as_f64().unwrap_or(20.0) as f32 * 0.7,
        elderly_pct:          15.0,
        vulnerable_facilities: 1,
        geometry: None,
    };

    let weights = HeatRiskWeights::default();
    let mut cell = record.into_cell(&weights)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Override with the already-computed score to avoid rounding differences
    if let Some(s) = v["heat_risk_score"].as_f64() {
        cell.heat_risk_score = s as f32;
    }

    let sc = compute_best_scenario(&cell)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let interventions: Vec<serde_json::Value> = sc.ranked_interventions.iter()
        .map(|r| serde_json::json!({
            "emoji":             r.intervention.emoji(),
            "label":             r.intervention.label(),
            "priority_score":    r.priority_score,
            "cooling_celsius":   r.estimated_cooling_celsius,
            "applicability":     r.applicability,
            "rationale":         r.rationale,
        }))
        .collect();

    let out = serde_json::json!({
        "district_id":                   sc.district_id,
        "district_name":                 sc.district_name,
        "current_heat_risk_score":       sc.current_heat_risk_score,
        "projected_heat_risk_score":     sc.projected_heat_risk_score,
        "estimated_lst_reduction":       sc.estimated_lst_reduction_celsius,
        "estimated_risk_reduction_pct":  sc.estimated_risk_reduction_pct,
        "ranked_interventions":          interventions,
        "rationale":                     sc.rationale,
        "methodology_note":              sc.methodology_note,
    });

    serde_json::to_string(&out)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return the full synthetic Frankfurt demo dataset as a GeoJSON string.
///
/// Useful for the initial map render without a backend call.
#[wasm_bindgen]
pub fn demo_dataset() -> Result<String, JsValue> {
    let cells = build_frankfurt_demo();
    cells_to_geojson(&cells)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return a single cell (Bahnhofsviertel) as JSON — useful for UI testing.
#[wasm_bindgen]
pub fn demo_single() -> Result<String, JsValue> {
    let cell = make_bahnhofsviertel();
    let cells = vec![cell];
    cells_to_geojson(&cells)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

// ─────────────────────────────────────────────────────────────────────────────
// Version / info
// ─────────────────────────────────────────────────────────────────────────────

/// Return the methodology version string.
#[wasm_bindgen]
pub fn methodology_info() -> String {
    "UrbanLens Heat Island Engine v0.1 · \
    Scoring: VDI 3787 Bl.1 · LCZ: Stewart & Oke 2012 · \
    Daten: Copernicus HRL, Landsat 8/9 TIR, Sentinel-2 MSI · \
    ⚠ Modellwerte — keine lokalen Messdaten"
    .to_string()
}
