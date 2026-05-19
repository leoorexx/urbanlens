//! Heat Risk Score computation.
//!
//! ## Design principles
//! 1. **Transparency** — every weight is explicit and configurable.
//! 2. **Correct LST semantics** — satellite LST ≠ air temperature; the score
//!    is labelled accordingly (VDI 3787 Bl. 1).
//! 3. **Normalization** — all sub-scores are mapped to [0, 1] before weighting
//!    so that physical units do not affect the balance.
//! 4. **Testability** — pure functions, no global state.

use thiserror::Error;
use crate::heat_islands::data_model::{HeatIslandCell, LocalClimateZone};

// ─────────────────────────────────────────────────────────────────────────────
// Error type
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Error)]
pub enum ScoringError {
    #[error("Invalid weights: must sum to 1.0 (±0.01), got {0:.4}")]
    InvalidWeights(f32),
    #[error("Input out of physical range: {0}")]
    OutOfRange(String),
}

pub type ScoringResult<T> = Result<T, ScoringError>;

// ─────────────────────────────────────────────────────────────────────────────
// Weight configuration
// ─────────────────────────────────────────────────────────────────────────────

/// Configurable weights for each component of the Heat Risk Score.
///
/// The defaults are derived from the factor analysis in:
/// - UBA Methodenkonvention 4.0 (2026)
/// - BBSR Klimaanpassungsmonitor 2023
/// - WHO Heat Health Action Plan (2021)
#[derive(Debug, Clone)]
pub struct HeatRiskWeights {
    /// LST delta vs. suburban reference (SUHI intensity).
    pub surface_temperature: f32,
    /// Imperviousness / sealing fraction.
    pub imperviousness: f32,
    /// NDVI vegetation index (inverted — low NDVI → higher risk).
    pub vegetation: f32,
    /// Tree-cover density (inverted).
    pub tree_cover: f32,
    /// Building-morphology heat trapping (FAR × (1 − SVF)).
    pub building_morphology: f32,
    /// Street-level shade deficit (inverted shaded_fraction).
    pub shade_deficit: f32,
    /// Distance to public green space.
    pub distance_to_green: f32,
    /// Social vulnerability amplifier.
    pub social_vulnerability: f32,
}

impl Default for HeatRiskWeights {
    fn default() -> Self {
        Self {
            surface_temperature:  0.30,
            imperviousness:       0.20,
            vegetation:           0.15,
            tree_cover:           0.10,
            building_morphology:  0.08,
            shade_deficit:        0.07,
            distance_to_green:    0.05,
            social_vulnerability: 0.05,
        }
    }
}

impl HeatRiskWeights {
    /// Validate that weights sum to 1.0 (±0.01 tolerance).
    pub fn validate(&self) -> ScoringResult<()> {
        let sum = self.surface_temperature
            + self.imperviousness
            + self.vegetation
            + self.tree_cover
            + self.building_morphology
            + self.shade_deficit
            + self.distance_to_green
            + self.social_vulnerability;
        if (sum - 1.0).abs() > 0.01 {
            Err(ScoringError::InvalidWeights(sum))
        } else {
            Ok(())
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: linear normalisation to [0, 1]
// ─────────────────────────────────────────────────────────────────────────────

/// Map `value` from [`min`, `max`] to [0, 1], clamped.
#[inline]
fn norm(value: f32, min: f32, max: f32) -> f32 {
    if max <= min {
        return 0.5;
    }
    ((value - min) / (max - min)).clamp(0.0, 1.0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual sub-score functions
// ─────────────────────────────────────────────────────────────────────────────

/// LST-delta sub-score.
/// Reference range: −2 °C (cold spot) to +6 °C (extreme SUHI).
/// Data: Landsat 8/9 TIR (USGS) processed with SUHI-CURE methodology.
fn score_lst(delta_celsius: f32) -> f32 {
    norm(delta_celsius, -2.0, 6.0)
}

/// Imperviousness sub-score.
/// 0 % = fully vegetated, 100 % = fully sealed.
/// Source: Copernicus HRL Imperviousness 2021.
fn score_imperviousness(fraction_pct: f32) -> ScoringResult<f32> {
    if !(0.0..=100.0).contains(&fraction_pct) {
        return Err(ScoringError::OutOfRange(
            format!("imperviousness {fraction_pct} outside 0–100 %"),
        ));
    }
    Ok(norm(fraction_pct, 0.0, 100.0))
}

/// Vegetation sub-score (inverted: low NDVI → high risk).
/// Source: Sentinel-2 MSI 10 m (ESA Copernicus).
fn score_vegetation(ndvi: f32) -> f32 {
    // NDVI range for urban contexts: −0.1 (bare sealed) to 0.7 (dense canopy)
    1.0 - norm(ndvi, -0.1, 0.7)
}

/// Tree-cover sub-score (inverted).
/// Source: Copernicus Tree Cover Density (TCD) 2018/2021.
fn score_tree_cover(tree_cover_pct: f32) -> f32 {
    1.0 - norm(tree_cover_pct, 0.0, 80.0)
}

/// Building-morphology heat-trapping factor.
/// Combines FAR (heat storage volume) with Sky View Factor (radiation trapping).
/// SVF close to 0 means deeply enclosed street canyon — maximum heat trapping.
fn score_building_morphology(floor_area_ratio: f32, sky_view_factor: f32) -> f32 {
    let far_norm = norm(floor_area_ratio, 0.0, 5.0);
    let svf_trap = 1.0 - sky_view_factor.clamp(0.0, 1.0); // low SVF = more trapping
    (far_norm * svf_trap).clamp(0.0, 1.0)
}

/// Shade-deficit sub-score.
/// Less shade during peak heat → higher score.
fn score_shade_deficit(shaded_fraction: f32) -> f32 {
    1.0 - shaded_fraction.clamp(0.0, 1.0)
}

/// Distance-to-green sub-score.
/// Cooling effect of parks is detectable up to ~300 m (Aram et al. 2019).
/// Beyond 500 m the cooling benefit is negligible.
fn score_distance_to_green(distance_m: f32) -> f32 {
    norm(distance_m, 0.0, 500.0)
}

/// Social vulnerability sub-score.
fn score_vulnerability(composite: f32) -> f32 {
    norm(composite, 0.0, 100.0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite Heat Risk Score
// ─────────────────────────────────────────────────────────────────────────────

/// Compute the composite Heat Risk Score (0–100) for a cell.
///
/// # Methodology note
/// This is an **indicator-based proxy**, not a calibrated physical model.
/// It combines satellite-derived LST with structural and social factors to
/// identify *relative* risk across districts — comparable to the BBSR Urban
/// Climate Map approach.
///
/// **Do not** interpret the absolute score as a temperature or health outcome.
pub fn compute_heat_risk_score(
    cell: &HeatIslandCell,
    weights: &HeatRiskWeights,
) -> ScoringResult<f32> {
    weights.validate()?;

    let s_lst   = score_lst(cell.surface_temperature.delta_celsius);
    let s_imp   = score_imperviousness(cell.imperviousness.fraction_pct)?;
    let s_veg   = score_vegetation(cell.vegetation.ndvi);
    let s_tree  = score_tree_cover(cell.vegetation.tree_cover_pct);
    let s_bld   = score_building_morphology(
        cell.building_density.floor_area_ratio,
        cell.building_density.sky_view_factor,
    );
    let s_shade = score_shade_deficit(cell.shadow_potential.shaded_fraction);
    let s_green = score_distance_to_green(cell.cooling_potential.distance_to_green_m);
    let s_vuln  = score_vulnerability(cell.vulnerability.composite);

    let score = 100.0 * (
        weights.surface_temperature  * s_lst
        + weights.imperviousness     * s_imp
        + weights.vegetation         * s_veg
        + weights.tree_cover         * s_tree
        + weights.building_morphology* s_bld
        + weights.shade_deficit      * s_shade
        + weights.distance_to_green  * s_green
        + weights.social_vulnerability * s_vuln
    );

    Ok(score.clamp(0.0, 100.0))
}

/// Compute vulnerability composite from raw social statistics.
///
/// Weights based on WHO Climate & Health vulnerability framework (2021).
pub fn compute_vulnerability_composite(
    sgb2_rate_pct: f32,
    child_poverty_pct: f32,
    elderly_pct: f32,
    vulnerable_facilities: u32,
) -> f32 {
    let v = 0.40 * norm(sgb2_rate_pct,          0.0, 60.0)
          + 0.30 * norm(child_poverty_pct,       0.0, 70.0)
          + 0.20 * norm(elderly_pct,             0.0, 30.0)
          + 0.10 * norm(vulnerable_facilities as f32, 0.0, 10.0);
    (v * 100.0).clamp(0.0, 100.0)
}

/// Classify a cell's Local Climate Zone from its structural parameters.
/// Based on Stewart & Oke (2012) classification scheme.
pub fn classify_lcz(cell: &HeatIslandCell) -> LocalClimateZone {
    let imp = cell.imperviousness.fraction_pct;
    let h   = cell.building_density.mean_height_m;
    let cov = cell.building_density.coverage;

    match (imp as u32, h as u32, (cov * 100.0) as u32) {
        (80.., 25.., 40..) => LocalClimateZone::CompactHighRise,
        (70.., 10.., 40..) => LocalClimateZone::CompactMidRise,
        (65.., _, 40..)    => LocalClimateZone::CompactLowRise,
        (50.., 25.., _)    => LocalClimateZone::OpenHighRise,
        (45.., 10.., _)    => LocalClimateZone::OpenMidRise,
        (40.., _, _)       => LocalClimateZone::OpenLowRise,
        (80.., _, _)       => LocalClimateZone::BarePaved,
        (15.., _, _)       => LocalClimateZone::SparselyBuilt,
        _                  => LocalClimateZone::LowPlants,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers (used by WASM bindings and CLI)
// ─────────────────────────────────────────────────────────────────────────────

pub fn heat_risk_label(score: f32) -> &'static str {
    match score as u32 {
        0..=25  => "Gering",
        26..=45 => "Mäßig",
        46..=65 => "Erhöht",
        66..=80 => "Hoch",
        _       => "Kritisch",
    }
}

pub fn heat_risk_color(score: f32) -> &'static str {
    match score as u32 {
        0..=25  => "#22c55e",
        26..=45 => "#84cc16",
        46..=65 => "#eab308",
        66..=80 => "#f97316",
        _       => "#ef4444",
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::demo;

    #[test]
    fn score_is_in_range() {
        let cell = demo::make_bahnhofsviertel();
        let score = compute_heat_risk_score(&cell, &HeatRiskWeights::default()).unwrap();
        assert!((0.0..=100.0).contains(&score), "Score out of range: {score}");
    }

    #[test]
    fn hotspot_scores_above_threshold() {
        let cell = demo::make_bahnhofsviertel();
        let score = compute_heat_risk_score(&cell, &HeatRiskWeights::default()).unwrap();
        // Bahnhofsviertel: sealing 88 %, LST-delta 3.9 °C → must be high risk
        assert!(
            score > 60.0,
            "Bahnhofsviertel should score > 60, got {score:.1}"
        );
    }

    #[test]
    fn green_suburb_scores_low() {
        let mut cell = demo::make_bahnhofsviertel();
        // Override to simulate Berkersheim (rural edge district)
        cell.surface_temperature.delta_celsius = 0.2;
        cell.imperviousness.fraction_pct       = 32.0;
        cell.vegetation.ndvi                   = 0.62;
        cell.vegetation.tree_cover_pct         = 55.0;
        cell.cooling_potential.distance_to_green_m = 40.0;
        cell.vulnerability.composite           = 14.0;

        let score = compute_heat_risk_score(&cell, &HeatRiskWeights::default()).unwrap();
        assert!(score < 40.0, "Green suburb should score < 40, got {score:.1}");
    }

    #[test]
    fn invalid_weights_rejected() {
        let bad = HeatRiskWeights {
            surface_temperature: 0.9,   // far too high — total > 1
            ..HeatRiskWeights::default()
        };
        assert!(bad.validate().is_err());
    }

    #[test]
    fn invalid_imperviousness_rejected() {
        let cell = demo::make_bahnhofsviertel();
        // Temporary local override — test via sub-function directly
        let result = score_imperviousness(120.0); // > 100 % invalid
        assert!(result.is_err());
    }

    #[test]
    fn vulnerability_composite_bounds() {
        let high = compute_vulnerability_composite(62.0, 70.0, 25.0, 8);
        let low  = compute_vulnerability_composite(5.0,   6.0, 12.0, 0);
        assert!(high > 70.0, "High vulnerability should be > 70, got {high:.1}");
        assert!(low  < 25.0, "Low vulnerability should be < 25, got {low:.1}");
        assert!((0.0..=100.0).contains(&high));
        assert!((0.0..=100.0).contains(&low));
    }

    #[test]
    fn lcz_compact_for_dense_inner_city() {
        let cell = demo::make_bahnhofsviertel(); // imp=88, height=18, cov=0.72
        let lcz = classify_lcz(&cell);
        assert!(
            matches!(
                lcz,
                LocalClimateZone::CompactHighRise
                    | LocalClimateZone::CompactMidRise
                    | LocalClimateZone::CompactLowRise
            ),
            "Dense inner city should be LCZ 1-3, got {lcz:?}"
        );
    }

    #[test]
    fn full_frankfurt_demo_all_in_range() {
        let dataset = demo::build_frankfurt_demo();
        let weights = HeatRiskWeights::default();
        for cell in &dataset {
            let score = compute_heat_risk_score(cell, &weights).unwrap();
            assert!(
                (0.0..=100.0).contains(&score),
                "{}: score {score} out of range",
                cell.name
            );
        }
    }
}
