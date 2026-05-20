//! Serialize `HeatIslandCell` collections to GeoJSON.
//!
//! Output format is a standard GeoJSON `FeatureCollection` compatible with
//! Leaflet, MapLibre GL, QGIS and the existing UrbanLens data pipeline.

use anyhow::Result;
use serde_json::{json, Value};

use crate::heat_islands::data_model::HeatIslandCell;
use crate::heat_islands::scoring::heat_risk_color;

/// Convert a slice of cells to a GeoJSON FeatureCollection string.
///
/// Each feature carries the full score payload as properties so that the
/// existing JavaScript code (index.html / map3d.html) can consume it directly.
pub fn cells_to_geojson(cells: &[HeatIslandCell]) -> Result<String> {
    let features: Vec<Value> = cells.iter().map(cell_to_feature).collect();
    let fc = json!({
        "type": "FeatureCollection",
        "features": features,
    });
    Ok(serde_json::to_string_pretty(&fc)?)
}

fn cell_to_feature(cell: &HeatIslandCell) -> Value {
    json!({
        "type": "Feature",
        "geometry": cell.geometry,
        "properties": {
            // ── Identity ─────────────────────────────────────────────────
            "id":   cell.id,
            "name": cell.name,

            // ── Heat Risk Score ──────────────────────────────────────────
            "heat_risk_score": cell.heat_risk_score,
            "heat_risk_label": cell.risk_label(),
            "heat_risk_color": heat_risk_color(cell.heat_risk_score),
            "is_hotspot":  cell.is_hotspot(),
            "is_coolspot": cell.is_coolspot(),

            // ── Surface Temperature ─────────────────────────────────────
            "lst_delta":  cell.surface_temperature.delta_celsius,
            "lst_celsius": cell.surface_temperature.celsius(),
            "suhi_class": cell.surface_temperature.suhi_class(),

            // ── Vegetation ──────────────────────────────────────────────
            "ndvi":       cell.vegetation.ndvi,
            "ndbi":       cell.vegetation.ndbi,
            "tree_cover": cell.vegetation.tree_cover_pct,
            "ndvi_class": cell.vegetation.ndvi_class(),

            // ── Imperviousness ──────────────────────────────────────────
            "versieg": cell.imperviousness.fraction_pct,

            // ── Local Climate Zone ──────────────────────────────────────
            "lcz": cell.local_climate_zone.label(),
            "lcz_nocturnal_delta": cell.local_climate_zone.nocturnal_delta_celsius(),

            // ── Social Vulnerability ────────────────────────────────────
            "sgb2":          cell.vulnerability.sgb2_rate_pct,
            "kinderarmut":   cell.vulnerability.child_poverty_pct,
            "vuln_score":    cell.vulnerability.composite,

            // ── Heat Burden ─────────────────────────────────────────────
            "heat_burden_physical": cell.heat_burden.physical,
            "heat_burden_social":   cell.heat_burden.social_risk,
            "heat_burden":          cell.heat_burden.composite,

            // ── Cooling proximity ───────────────────────────────────────
            "dist_green_m": cell.cooling_potential.distance_to_green_m,
            "dist_water_m": cell.cooling_potential.distance_to_water_m,

            // ── Recommended measures ────────────────────────────────────
            "measures": cell.recommended_measures.iter()
                .map(|m| format!("{} {}", m.emoji(), m.label()))
                .collect::<Vec<_>>(),

            // ── Data provenance ─────────────────────────────────────────
            "data_source": cell.surface_temperature.source,
            "data_date":   cell.surface_temperature.date,
        }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Green Space exports
// ─────────────────────────────────────────────────────────────────────────────

use crate::green_spaces::data_model::{GreenSpaceObject, PotentialArea, TreeObject};

/// Convert green spaces to a GeoJSON FeatureCollection.
pub fn green_spaces_to_geojson(spaces: &[GreenSpaceObject]) -> Result<String> {
    let features: Vec<serde_json::Value> = spaces
        .iter()
        .map(|s| {
            serde_json::json!({
                "type": "Feature",
                "geometry": s.geometry.clone().unwrap_or(serde_json::json!({
                    "type": "Point",
                    "coordinates": [s.lon, s.lat]
                })),
                "properties": {
                    "id": s.id,
                    "name": s.name,
                    "type": s.space_type.label(),
                    "emoji": s.space_type.emoji(),
                    "area_m2": s.area_m2,
                    "ndvi": s.ndvi,
                    "tree_cover_pct": s.tree_cover_pct,
                    "imperviousness_pct": s.imperviousness_pct,
                    "upgrade_priority_score": s.upgrade_priority_score,
                    "quality_label": s.quality_label(),
                    "quality_color": s.quality_color(),
                    "green_coverage_score": s.green_coverage_score,
                    "tree_cover_score": s.tree_cover_score,
                    "accessibility_score": s.accessibility_score,
                    "cooling_potential_score": s.cooling_potential_score,
                    "biodiversity_potential_score": s.biodiversity_potential_score,
                    "connectivity_score": s.connectivity_score,
                    "is_priority": s.is_priority(),
                    "interventions": s.recommended_interventions.iter()
                        .map(|i| format!("{} {}", i.emoji(), i.label()))
                        .collect::<Vec<_>>(),
                    "methodology_note": s.methodology_note,
                }
            })
        })
        .collect();
    serde_json::to_string_pretty(&serde_json::json!({
        "type": "FeatureCollection",
        "features": features,
    }))
    .map_err(Into::into)
}

/// Convert potential areas to a GeoJSON FeatureCollection.
pub fn potential_areas_to_geojson(areas: &[PotentialArea]) -> Result<String> {
    let features: Vec<serde_json::Value> = areas
        .iter()
        .map(|a| {
            serde_json::json!({
                "type": "Feature",
                "geometry": a.geometry.clone().unwrap_or(serde_json::json!(null)),
                "properties": {
                    "id": a.id,
                    "name": a.name,
                    "area_m2": a.area_m2,
                    "current_type": a.current_type,
                    "intervention": format!("{} {}", a.intervention.emoji(), a.intervention.label()),
                    "feasibility": a.feasibility.label(),
                    "estimated_cooling_celsius": a.estimated_cooling_celsius,
                    "estimated_co2_sequestration_kg_yr": a.estimated_co2_sequestration_kg_yr,
                    "priority_score": a.priority_score,
                    "rationale": a.rationale,
                }
            })
        })
        .collect();
    serde_json::to_string_pretty(&serde_json::json!({
        "type": "FeatureCollection",
        "features": features,
    }))
    .map_err(Into::into)
}

/// Convert trees to a GeoJSON FeatureCollection.
pub fn trees_to_geojson(trees: &[TreeObject]) -> Result<String> {
    let features: Vec<serde_json::Value> = trees
        .iter()
        .map(|t| {
            serde_json::json!({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [t.lon, t.lat]},
                "properties": {
                    "id": t.id,
                    "species": t.species,
                    "height_m": t.height_m,
                    "crown_diameter_m": t.crown_diameter_m,
                    "age_class": t.age_class.label(),
                    "condition": t.condition.label(),
                    "shade_area_m2": t.shade_area_m2,
                    "co2_stored_kg": t.co2_stored_kg,
                    "cooling_score": t.cooling_score,
                }
            })
        })
        .collect();
    serde_json::to_string_pretty(&serde_json::json!({
        "type": "FeatureCollection",
        "features": features,
    }))
    .map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::demo;

    #[test]
    fn geojson_is_valid() {
        let cells = demo::build_frankfurt_demo();
        let json  = cells_to_geojson(&cells).unwrap();
        let parsed: Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["type"], "FeatureCollection");
        assert_eq!(parsed["features"].as_array().unwrap().len(), cells.len());
    }

    #[test]
    fn feature_has_required_properties() {
        let cells = vec![demo::make_bahnhofsviertel()];
        let json  = cells_to_geojson(&cells).unwrap();
        let parsed: Value = serde_json::from_str(&json).unwrap();
        let props = &parsed["features"][0]["properties"];
        assert!(props["heat_risk_score"].is_number());
        assert!(props["lst_delta"].is_number());
        assert!(props["versieg"].is_number());
        assert!(props["lcz"].is_string());
    }
}
