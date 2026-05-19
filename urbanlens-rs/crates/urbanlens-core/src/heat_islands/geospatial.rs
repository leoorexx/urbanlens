//! Geospatial utilities: GeoJSON I/O, spatial indexing, proximity queries.
//!
//! These functions bridge the raw GeoJSON files in `data/layers/` (produced by
//! the Python generate_layers.py pipeline) with the Rust domain model.

use anyhow::{Context, Result};
use rstar::{RTree, RTreeObject, AABB};
use serde_json::Value;

use crate::heat_islands::data_model::{
    BuildingDensity, CoolingPotential, HeatIslandCell, HeatBurden,
    Imperviousness, LocalClimateZone, ShadowPotential, SurfaceTemperature,
    VegetationIndex, VulnerabilityScore,
};
use crate::heat_islands::scoring::{
    classify_lcz, compute_heat_risk_score, compute_vulnerability_composite,
    HeatRiskWeights,
};

// ─────────────────────────────────────────────────────────────────────────────
// Point wrapper for R-tree (green-space / water proximity queries)
// ─────────────────────────────────────────────────────────────────────────────

/// A 2D point stored in the spatial index.
#[derive(Clone, Debug)]
pub struct IndexedPoint {
    pub lon: f64,
    pub lat: f64,
    pub label: String,
}

impl RTreeObject for IndexedPoint {
    type Envelope = AABB<[f64; 2]>;
    fn envelope(&self) -> Self::Envelope {
        AABB::from_point([self.lon, self.lat])
    }
}

/// Haversine distance between two WGS-84 points in metres.
pub fn haversine_m(lon1: f64, lat1: f64, lon2: f64, lat2: f64) -> f64 {
    const R: f64 = 6_371_000.0; // Earth mean radius in metres
    let (dlat, dlon) = (
        (lat2 - lat1).to_radians(),
        (lon2 - lon1).to_radians(),
    );
    let a = (dlat / 2.0).sin().powi(2)
        + lat1.to_radians().cos() * lat2.to_radians().cos() * (dlon / 2.0).sin().powi(2);
    R * 2.0 * a.sqrt().atan2((1.0 - a).sqrt())
}

/// Build an R-tree from the centroids of a GeoJSON FeatureCollection.
/// Used for green-space and water proximity queries.
pub fn build_point_index(geojson_text: &str) -> Result<RTree<IndexedPoint>> {
    let fc: Value = serde_json::from_str(geojson_text)
        .context("Failed to parse GeoJSON")?;
    let features = fc["features"]
        .as_array()
        .context("GeoJSON has no features array")?;

    let points: Vec<IndexedPoint> = features
        .iter()
        .filter_map(|feat| {
            let geom = feat["geometry"].as_object()?;
            let coords = geom["coordinates"].as_array()?;
            // Support Point and Polygon (use first ring centroid)
            let (lon, lat) = match geom["type"].as_str()? {
                "Point" => (
                    coords[0].as_f64()?,
                    coords[1].as_f64()?,
                ),
                "Polygon" => {
                    let ring = coords[0].as_array()?;
                    // Centroid of first ring
                    let (sum_lon, sum_lat) = ring.iter().fold((0.0, 0.0), |(sl, slt), pt| {
                        let a = pt.as_array();
                        let lo = a.and_then(|v| v[0].as_f64()).unwrap_or(0.0);
                        let la = a.and_then(|v| v[1].as_f64()).unwrap_or(0.0);
                        (sl + lo, slt + la)
                    });
                    let n = ring.len() as f64;
                    (sum_lon / n, sum_lat / n)
                }
                _ => return None,
            };
            let label = feat["properties"]["name"]
                .as_str()
                .unwrap_or("unnamed")
                .to_string();
            Some(IndexedPoint { lon, lat, label })
        })
        .collect();

    Ok(RTree::bulk_load(points))
}

/// Return the distance to the nearest point in an R-tree (metres).
pub fn nearest_distance_m(index: &RTree<IndexedPoint>, lon: f64, lat: f64) -> f64 {
    match index.nearest_neighbor(&[lon, lat]) {
        Some(pt) => haversine_m(lon, lat, pt.lon, pt.lat),
        None => f64::MAX,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Construct HeatIslandCell from UrbanLens JS STADTTEILE record
// ─────────────────────────────────────────────────────────────────────────────

/// Parameters mirroring the `STADTTEILE` object in index.html.
/// This struct allows the CLI to construct cells directly from the
/// existing JS data without re-processing satellite imagery.
#[derive(Debug, Clone)]
pub struct StadtteilRecord {
    pub id: String,
    pub name: String,
    pub lat: f64,
    pub lon: f64,
    /// LST delta vs. suburban reference (°C) — existing field in index.html
    pub lst_delta: f32,
    /// Versiegelungsgrad (%) — existing field
    pub versieg: f32,
    /// NDVI — may be derived from versieg if not explicitly stored
    pub ndvi: f32,
    /// Tree cover (%)
    pub tree_cover: f32,
    /// SGB-II rate (%)
    pub sgb2: f32,
    /// Child poverty rate (%)
    pub kinderarmut: f32,
    /// Elderly population (%) — optional, defaults to 15 %
    pub elderly_pct: f32,
    /// Vulnerable facilities count
    pub vulnerable_facilities: u32,
    /// Optional geometry (GeoJSON Value); if None, a Point is synthesised.
    pub geometry: Option<Value>,
}

impl StadtteilRecord {
    /// Convert to a fully populated [`HeatIslandCell`].
    pub fn into_cell(self, weights: &HeatRiskWeights) -> Result<HeatIslandCell> {
        let geometry = self.geometry.unwrap_or_else(|| {
            serde_json::json!({
                "type": "Point",
                "coordinates": [self.lon, self.lat]
            })
        });

        // Derive NDBI from imperviousness (proxy — Sentinel-2 would be preferred)
        let ndbi = (self.versieg / 100.0 * 0.65 - 0.15).clamp(-0.2, 0.8);

        // Derive building morphology from sealing (simplified)
        let cov = (self.versieg / 100.0 * 0.85).clamp(0.1, 0.9);
        let h   = if self.versieg > 75.0 { 18.0 } else if self.versieg > 55.0 { 12.0 } else { 7.0 };
        let far = (self.versieg / 100.0 * 4.0).max(0.5);
        let svf = (1.0 - self.versieg / 120.0).clamp(0.2, 1.0);

        let canopy = self.tree_cover / 100.0;
        let solar  = (350.0 - self.tree_cover * 2.0 - (1.0 - self.versieg / 100.0) * 80.0)
            .clamp(100.0, 350.0);
        let shade  = (canopy * 0.6 + (1.0 - self.versieg / 100.0) * 0.2).clamp(0.0, 0.9);

        let vuln_composite = compute_vulnerability_composite(
            self.sgb2,
            self.kinderarmut,
            self.elderly_pct,
            self.vulnerable_facilities,
        );

        let vulnerability = VulnerabilityScore {
            sgb2_rate_pct: self.sgb2,
            child_poverty_pct: self.kinderarmut,
            elderly_pct: self.elderly_pct,
            vulnerable_facilities: self.vulnerable_facilities,
            composite: vuln_composite,
        };

        let physical = {
            let lst_norm = ((self.lst_delta + 2.0) / 8.0).clamp(0.0, 1.0) * 100.0;
            let imp_norm = self.versieg;
            (lst_norm * 0.6 + imp_norm * 0.4).clamp(0.0, 100.0)
        };

        let heat_burden = HeatBurden {
            physical,
            human_thermal: None, // requires micro-meteorological data
            social_risk: (physical * vuln_composite / 100.0).clamp(0.0, 100.0),
            composite: physical,
        };

        let mut cell = HeatIslandCell {
            id: self.id,
            name: self.name,
            geometry,
            surface_temperature: SurfaceTemperature {
                lst_kelvin: 308.15 + self.lst_delta,
                delta_celsius: self.lst_delta,
                source: "UrbanLens STADTTEILE-Datensatz (synthetisch, Basis: HLNUG / Copernicus)"
                    .to_string(),
                date: "2024-08-15".to_string(),
            },
            vegetation: VegetationIndex {
                ndvi: self.ndvi,
                ndbi,
                tree_cover_pct: self.tree_cover,
            },
            imperviousness: Imperviousness {
                fraction_pct: self.versieg,
                source: "Copernicus HRL Imperviousness 2021 (synthetisch)".to_string(),
            },
            building_density: BuildingDensity {
                coverage: cov,
                mean_height_m: h,
                floor_area_ratio: far,
                sky_view_factor: svf,
            },
            shadow_potential: ShadowPotential {
                shaded_fraction: shade,
                solar_radiation_wm2: solar,
                canopy_fraction: canopy,
            },
            cooling_potential: CoolingPotential {
                distance_to_green_m: (self.versieg * 6.0 - 100.0).max(0.0),
                distance_to_water_m: (self.versieg * 8.0 + 100.0).min(2000.0),
                cold_air_corridor_score: if self.versieg < 40.0 {
                    0.7
                } else if self.versieg < 60.0 {
                    0.35
                } else {
                    0.1
                },
                sealable_area_m2: (self.versieg / 100.0 * 5000.0).max(0.0),
            },
            local_climate_zone: LocalClimateZone::OpenMidRise, // placeholder
            vulnerability,
            heat_burden,
            heat_risk_score: 0.0, // computed below
            recommended_measures: vec![],
        };

        // Classify LCZ and compute score
        cell.local_climate_zone = classify_lcz(&cell);
        cell.heat_risk_score = compute_heat_risk_score(&cell, weights)
            .context("Score computation failed")?;

        Ok(cell)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_record(id: &str, lst: f32, versieg: f32) -> StadtteilRecord {
        StadtteilRecord {
            id: id.to_string(),
            name: id.to_string(),
            lat: 50.11,
            lon: 8.68,
            lst_delta: lst,
            versieg,
            ndvi: 1.0 - versieg / 120.0,
            tree_cover: (100.0 - versieg) * 0.4,
            sgb2: 20.0,
            kinderarmut: 25.0,
            elderly_pct: 15.0,
            vulnerable_facilities: 2,
            geometry: None,
        }
    }

    #[test]
    fn record_to_cell_succeeds() {
        let rec  = sample_record("test", 3.5, 80.0);
        let cell = rec.into_cell(&HeatRiskWeights::default()).unwrap();
        assert!(cell.heat_risk_score > 0.0);
    }

    #[test]
    fn haversine_known_distance() {
        // Frankfurt Hbf to Frankfurt Römer: ~1.5 km
        let d = haversine_m(8.6634, 50.1071, 8.6822, 50.1109);
        assert!((d - 1500.0).abs() < 300.0, "Expected ~1500 m, got {d:.0} m");
    }
}
