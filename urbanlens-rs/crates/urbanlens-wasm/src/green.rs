//! WebAssembly bindings for the Green Space Registry Lens.
//!
//! ## JS Usage
//! ```js
//! import init, { score_green_space, green_scenario, green_demo_dataset,
//!                green_potential_areas, green_corridors, green_methodology_info }
//!   from './wasm-pkg/urbanlens_wasm.js';
//! await init();
//!
//! // Score a single green space
//! const result = JSON.parse(score_green_space(JSON.stringify({
//!   id: "bahnhofsviertel_pocket", name: "Pocket Park Bahnhofsviertel",
//!   space_type: "PocketPark", area_m2: 420, lat: 50.1075, lon: 8.6701,
//!   ndvi: 0.12, tree_cover_pct: 4, imperviousness_pct: 88,
//!   distance_to_nearest_green_m: 480, distance_to_water_m: 1200,
//!   population_within_300m: 9800, vulnerable_facilities_within_500m: 4,
//!   connectivity_index: 0.08
//! })));
//! console.log(result.upgrade_priority_score, result.quality_label);
//!
//! // Get full demo dataset as GeoJSON
//! const fc = JSON.parse(green_demo_dataset());
//! ```

use wasm_bindgen::prelude::*;

use urbanlens_core::green_spaces::{
    data_model::GreenSpaceRecord,
    demo::{build_frankfurt_green_demo, build_frankfurt_potential_areas, build_frankfurt_tree_demo},
    scenario::compute_green_scenario,
    geospatial::find_green_corridors,
};
use urbanlens_core::export::geojson::{
    green_spaces_to_geojson, potential_areas_to_geojson, trees_to_geojson,
};

/// Score a single green space from raw indicator values.
///
/// Input: JSON object with id, name, space_type, area_m2, lat, lon,
///        ndvi, tree_cover_pct, imperviousness_pct,
///        distance_to_nearest_green_m, distance_to_water_m,
///        population_within_300m, vulnerable_facilities_within_500m,
///        connectivity_index
/// Output: JSON string with all computed scores + interventions
#[wasm_bindgen]
pub fn score_green_space(input_json: &str) -> Result<String, JsValue> {
    let v: serde_json::Value = serde_json::from_str(input_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let record = GreenSpaceRecord {
        id:    v["id"].as_str().unwrap_or("unknown").to_string(),
        name:  v["name"].as_str().unwrap_or("Unbekannt").to_string(),
        space_type: v["space_type"].as_str().unwrap_or("Park").to_string(),
        area_m2: v["area_m2"].as_f64().unwrap_or(1000.0) as f32,
        lat: v["lat"].as_f64().unwrap_or(50.11),
        lon: v["lon"].as_f64().unwrap_or(8.68),
        ndvi: v["ndvi"].as_f64().unwrap_or(0.35) as f32,
        tree_cover_pct: v["tree_cover_pct"].as_f64().unwrap_or(20.0) as f32,
        imperviousness_pct: v["imperviousness_pct"].as_f64().unwrap_or(50.0) as f32,
        distance_to_nearest_green_m: v["distance_to_nearest_green_m"].as_f64().unwrap_or(300.0) as f32,
        distance_to_water_m: v["distance_to_water_m"].as_f64().unwrap_or(500.0) as f32,
        population_within_300m: v["population_within_300m"].as_u64().unwrap_or(2000) as u32,
        vulnerable_facilities_within_500m: v["vulnerable_facilities_within_500m"].as_u64().unwrap_or(1) as u32,
        connectivity_index: v["connectivity_index"].as_f64().unwrap_or(0.3) as f32,
        geometry: None,
    };

    let obj = record.into_object()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let out = serde_json::json!({
        "id":   obj.id,
        "name": obj.name,
        "space_type":   obj.space_type.label(),
        "space_emoji":  obj.space_type.emoji(),
        "area_m2":      obj.area_m2,
        "lat": obj.lat, "lon": obj.lon,
        // Raw indicators (passthrough)
        "ndvi":                  obj.ndvi,
        "tree_cover_pct":        obj.tree_cover_pct,
        "imperviousness_pct":    obj.imperviousness_pct,
        "distance_to_nearest_green_m": obj.distance_to_nearest_green_m,
        "connectivity_index":    obj.connectivity_index,
        // Scores
        "upgrade_priority_score":        obj.upgrade_priority_score,
        "quality_label":                 obj.quality_label(),
        "quality_color":                 obj.quality_color(),
        "is_priority":                   obj.is_priority(),
        "is_high_quality":               obj.is_high_quality(),
        "green_coverage_score":          obj.green_coverage_score,
        "tree_cover_score":              obj.tree_cover_score,
        "accessibility_score":           obj.accessibility_score,
        "cooling_potential_score":       obj.cooling_potential_score,
        "biodiversity_potential_score":  obj.biodiversity_potential_score,
        "connectivity_score":            obj.connectivity_score,
        // Interventions
        "interventions": obj.recommended_interventions.iter().map(|i| serde_json::json!({
            "emoji": i.emoji(), "label": i.label(),
            "cost_per_m2": i.typical_cost_eur_per_m2(),
            "funding_pct": i.funding_pct(),
        })).collect::<Vec<_>>(),
        "methodology_note": obj.methodology_note,
    });

    serde_json::to_string(&out)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Compute Green Best Scenario for a previously scored green space.
///
/// Input: JSON string from score_green_space() output.
/// Output: ranked interventions, projected scores, cooling + CO2 estimates.
#[wasm_bindgen]
pub fn green_scenario(scored_json: &str) -> Result<String, JsValue> {
    let v: serde_json::Value = serde_json::from_str(scored_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let record = GreenSpaceRecord {
        id:    v["id"].as_str().unwrap_or("unknown").to_string(),
        name:  v["name"].as_str().unwrap_or("Unbekannt").to_string(),
        space_type: v["space_type"].as_str().unwrap_or("Park").to_string(),
        area_m2: v["area_m2"].as_f64().unwrap_or(1000.0) as f32,
        lat: v["lat"].as_f64().unwrap_or(50.11),
        lon: v["lon"].as_f64().unwrap_or(8.68),
        ndvi:                  v["ndvi"].as_f64().unwrap_or(0.35) as f32,
        tree_cover_pct:        v["tree_cover_pct"].as_f64().unwrap_or(20.0) as f32,
        imperviousness_pct:    v["imperviousness_pct"].as_f64().unwrap_or(50.0) as f32,
        distance_to_nearest_green_m: v["distance_to_nearest_green_m"].as_f64().unwrap_or(300.0) as f32,
        distance_to_water_m:   500.0,
        population_within_300m: 2000,
        vulnerable_facilities_within_500m: 1,
        connectivity_index:    v["connectivity_index"].as_f64().unwrap_or(0.3) as f32,
        geometry: None,
    };

    let mut obj = record.into_object()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Override with the already-computed score to avoid rounding drift
    if let Some(s) = v["upgrade_priority_score"].as_f64() {
        obj.upgrade_priority_score = s as f32;
    }

    let sc = compute_green_scenario(&obj)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let interventions: Vec<serde_json::Value> = sc.ranked_interventions.iter().map(|r| {
        serde_json::json!({
            "emoji":                   r.intervention.emoji(),
            "label":                   r.intervention.label(),
            "priority_score":          r.priority_score,
            "estimated_cooling_celsius": r.estimated_cooling_celsius,
            "estimated_area_m2":       r.estimated_area_m2,
            "estimated_cost_eur":      r.estimated_cost_eur,
            "funding_available_eur":   r.funding_available_eur,
            "applicability":           r.applicability,
            "rationale":               r.rationale,
        })
    }).collect();

    let potential: Vec<serde_json::Value> = sc.potential_areas.iter().map(|a| {
        serde_json::json!({
            "name": a.name, "area_m2": a.area_m2,
            "intervention": format!("{} {}", a.intervention.emoji(), a.intervention.label()),
            "feasibility": a.feasibility.label(),
            "estimated_cooling_celsius": a.estimated_cooling_celsius,
            "priority_score": a.priority_score,
        })
    }).collect();

    let out = serde_json::json!({
        "object_id":                    sc.object_id,
        "object_name":                  sc.object_name,
        "current_priority_score":       sc.current_priority_score,
        "projected_priority_score":     sc.projected_priority_score,
        "estimated_cooling_celsius":    sc.estimated_cooling_celsius,
        "estimated_co2_sequestration_kg_yr": sc.estimated_co2_sequestration_kg_yr,
        "estimated_risk_reduction_pct": sc.estimated_risk_reduction_pct,
        "ranked_interventions":         interventions,
        "potential_areas":              potential,
        "rationale":                    sc.rationale,
        "methodology_note":             sc.methodology_note,
    });

    serde_json::to_string(&out)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return the full synthetic Frankfurt green space demo as GeoJSON FeatureCollection.
#[wasm_bindgen]
pub fn green_demo_dataset() -> Result<String, JsValue> {
    let spaces = build_frankfurt_green_demo();
    green_spaces_to_geojson(&spaces)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return Frankfurt potential areas as GeoJSON.
#[wasm_bindgen]
pub fn green_potential_areas() -> Result<String, JsValue> {
    let areas = build_frankfurt_potential_areas();
    potential_areas_to_geojson(&areas)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return Frankfurt demo trees as GeoJSON.
#[wasm_bindgen]
pub fn green_trees() -> Result<String, JsValue> {
    let trees = build_frankfurt_tree_demo();
    trees_to_geojson(&trees)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return green corridor pairs as JSON array of [id_a, id_b, distance_m].
#[wasm_bindgen]
pub fn green_corridors() -> Result<String, JsValue> {
    let spaces = build_frankfurt_green_demo();
    let corridors = find_green_corridors(&spaces);
    serde_json::to_string(&corridors)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Return methodology version and data source string.
#[wasm_bindgen]
pub fn green_methodology_info() -> String {
    "UrbanLens Green Space Registry Lens v0.1 · \
     Scoring: EEA Urban Green Infrastructure 2021 · WHO EURO 2016 · \
     Bowler et al. 2010 · i-Tree Eco · BBSR 2023 · UBA 2021 · \
     Daten: Copernicus HRL TCD · Sentinel-2 NDVI · OSM · Kommunale Baumkataster · \
     \u{26a0} Modellwerte \u{2014} Demo-Datensatz Frankfurt · keine lokalen Messdaten"
        .to_string()
}
