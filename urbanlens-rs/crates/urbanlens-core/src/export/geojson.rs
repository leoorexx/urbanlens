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
