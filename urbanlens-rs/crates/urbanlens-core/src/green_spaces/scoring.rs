//! Green Space scoring functions.
//!
//! All functions return a *deficit* / *priority* score [0, 100]:
//! higher = more urgent need for improvement, matching the semantics of
//! `heat_risk_score` in the heat-islands module.
//!
//! ## Sources
//! - WHO EURO (2016): Urban green spaces and health
//! - EEA (2021): Urban green infrastructure planning
//! - Bowler et al. (2010): Urban greening to cool towns and cities
//! - IUCN Urban Biodiversity Guidelines (2020)
//! - European Green Infrastructure Strategy (2013/2023)
//! - Copernicus TCD / HRL

use super::data_model::*;
use thiserror::Error;

// ─────────────────────────────────────────────────────────────────────────────
// Error type
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Error)]
pub enum GreenScoringError {
    #[error("Invalid NDVI {0}: must be -1.0 to 1.0")]
    InvalidNdvi(f32),
    #[error("Invalid area {0}: must be > 0")]
    InvalidArea(f32),
    #[error("Scoring failed: {0}")]
    Failed(String),
}

pub type ScoringResult<T> = Result<T, GreenScoringError>;

// ─────────────────────────────────────────────────────────────────────────────
// Weight configuration
// ─────────────────────────────────────────────────────────────────────────────

/// Configurable weights for the composite upgrade priority score.
pub struct GreenWeights {
    pub green_coverage: f32,
    pub tree_cover: f32,
    pub accessibility: f32,
    pub cooling_potential: f32,
    pub biodiversity: f32,
    pub connectivity: f32,
}

impl Default for GreenWeights {
    fn default() -> Self {
        Self {
            green_coverage:    0.20,
            tree_cover:        0.20,
            accessibility:     0.20,
            cooling_potential: 0.15,
            biodiversity:      0.15,
            connectivity:      0.10,
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-score functions
// ─────────────────────────────────────────────────────────────────────────────

/// Green coverage deficit score (0–100, higher = deficit).
///
/// WHO target: 9 m² accessible green space per person (WHO EURO 2016).
/// EEA access standard: every resident within 300 m of public green.
pub fn score_green_coverage(area_m2: f32, population_within_300m: u32) -> ScoringResult<f32> {
    if area_m2 <= 0.0 {
        return Err(GreenScoringError::InvalidArea(area_m2));
    }
    let pop = population_within_300m.max(1) as f32;
    let m2_per_person = area_m2 / pop;
    let who_target = 9.0_f32;
    // Scale ratio to [0, 1] with 1.5× target as ceiling (150 % = fully adequate)
    let ratio = (m2_per_person / who_target).min(1.5);
    let raw = (ratio * 100.0 / 1.5).min(100.0);
    // Invert: high adequacy → low priority; high deficit → high priority
    Ok((100.0 - raw).clamp(0.0, 100.0))
}

/// Tree cover quality deficit score (0–100).
///
/// EEA urban forest target: ≥ 30 % TCD.
/// Combined with Sentinel-2 NDVI for vegetation health.
pub fn score_tree_cover(tree_cover_pct: f32, ndvi: f32) -> ScoringResult<f32> {
    if ndvi < -1.0 || ndvi > 1.0 {
        return Err(GreenScoringError::InvalidNdvi(ndvi));
    }
    // TCD component: 30 % = EEA urban forest target (60 % weight)
    let tcd_norm = (tree_cover_pct / 30.0).min(1.0) * 60.0;
    // NDVI component: 0.1 = sparse; 0.6 = dense healthy canopy (40 % weight)
    let ndvi_norm = ((ndvi.max(0.0) - 0.1) / 0.5).clamp(0.0, 1.0) * 40.0;
    let quality_score = (tcd_norm + ndvi_norm).clamp(0.0, 100.0);
    // Invert for priority
    Ok((100.0 - quality_score).clamp(0.0, 100.0))
}

/// Accessibility deficit score (0–100).
///
/// WHO EURO (2016): every resident within 300 m of accessible green space.
/// Bonus for proximity to vulnerable facilities (schools, care homes, hospitals).
pub fn score_accessibility(
    distance_to_nearest_green_m: f32,
    vulnerable_facilities: u32,
) -> ScoringResult<f32> {
    // Distance penalty: ≤ 100 m = ideal, 300 m = WHO limit, > 300 m = deficit
    let dist_score = if distance_to_nearest_green_m <= 100.0 {
        0.0
    } else if distance_to_nearest_green_m <= 300.0 {
        ((distance_to_nearest_green_m - 100.0) / 200.0) * 60.0
    } else {
        60.0 + ((distance_to_nearest_green_m - 300.0).min(700.0) / 700.0) * 40.0
    };
    // Vulnerable facilities increase urgency (max +20 pts)
    let vuln_bonus = (vulnerable_facilities as f32 * 5.0).min(20.0);
    Ok((dist_score + vuln_bonus).clamp(0.0, 100.0))
}

/// Cooling potential deficit score (0–100).
///
/// Sources: Bowler et al. 2010 (parks ~1 °C), Zardo et al. 2017 (green roofs),
/// Copernicus HRL Imperviousness.
pub fn score_cooling_potential(
    area_m2: f32,
    tree_cover_pct: f32,
    imperviousness_pct: f32,
    distance_to_water_m: f32,
    space_type: &GreenSpaceType,
) -> ScoringResult<f32> {
    if area_m2 <= 0.0 {
        return Err(GreenScoringError::InvalidArea(area_m2));
    }
    // Imperviousness drives urban heat (0–100 directly maps to penalty)
    let imperv_penalty = imperviousness_pct;
    // Tree cover reduces heat (each % of TCD gives 0.6 pts reduction)
    let tree_benefit = tree_cover_pct * 0.6;
    // Larger areas cool more (logarithmic, ~11.5 ≈ ln(100 000 m²))
    let area_benefit = (area_m2.ln() / 11.5).clamp(0.0, 1.0) * 20.0;
    // Proximity to water provides evaporative cooling
    let water_benefit = if distance_to_water_m < 200.0 {
        10.0
    } else if distance_to_water_m < 500.0 {
        5.0
    } else {
        0.0
    };
    // Space-type cooling capacity adjusts the raw deficit
    let type_factor = space_type.typical_cooling_celsius() / 2.5; // normalise to [0,1]
    let raw_deficit = imperv_penalty - tree_benefit - area_benefit - water_benefit;
    // High-cooling types reduce measured deficit
    let adjusted = (raw_deficit * (1.0 - type_factor * 0.3)).clamp(0.0, 100.0);
    Ok(adjusted)
}

/// Biodiversity potential deficit score (0–100).
///
/// After IUCN Urban Biodiversity Guidelines.
pub fn score_biodiversity_potential(
    ndvi: f32,
    area_m2: f32,
    space_type: &GreenSpaceType,
    connectivity_index: f32,
) -> ScoringResult<f32> {
    if ndvi < -1.0 || ndvi > 1.0 {
        return Err(GreenScoringError::InvalidNdvi(ndvi));
    }
    if area_m2 <= 0.0 {
        return Err(GreenScoringError::InvalidArea(area_m2));
    }
    // NDVI → vegetation quality (max 40 pts)
    let ndvi_score = (ndvi.max(0.0) * 40.0).clamp(0.0, 40.0);
    // Area → habitat size (1 ha = max 30 pts, >1 ha gives no additional benefit here)
    let area_score = ((area_m2 / 10_000.0).min(1.0)) * 30.0;
    // Space type → structural habitat quality (max 20 pts)
    let type_score = space_type.biodiversity_base() * 20.0;
    // Connectivity → gene flow & species dispersal (max 10 pts)
    let conn_score = connectivity_index * 10.0;
    let quality = ndvi_score + area_score + type_score + conn_score;
    // Invert: low quality = high priority
    Ok((100.0 - quality).clamp(0.0, 100.0))
}

/// Connectivity deficit score (0–100).
///
/// European Green Infrastructure Strategy: linked, multifunctional green networks.
pub fn score_connectivity(
    connectivity_index: f32,
    distance_to_nearest_green_m: f32,
) -> ScoringResult<f32> {
    // connectivity_index 0–1 (fraction of green area within 500 m of total dataset)
    let conn_score = (1.0 - connectivity_index.clamp(0.0, 1.0)) * 70.0;
    // Distance penalty: if nearest green > 200 m, structural gap exists
    let dist_penalty = if distance_to_nearest_green_m > 200.0 {
        ((distance_to_nearest_green_m - 200.0).min(800.0) / 800.0) * 30.0
    } else {
        0.0
    };
    Ok((conn_score + dist_penalty).clamp(0.0, 100.0))
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite score
// ─────────────────────────────────────────────────────────────────────────────

/// Compute the composite upgrade priority score (0–100) from weighted sub-scores.
pub fn compute_upgrade_priority(
    green_coverage_score: f32,
    tree_cover_score: f32,
    accessibility_score: f32,
    cooling_potential_score: f32,
    biodiversity_score: f32,
    connectivity_score: f32,
    weights: &GreenWeights,
) -> ScoringResult<f32> {
    let total_weight = weights.green_coverage
        + weights.tree_cover
        + weights.accessibility
        + weights.cooling_potential
        + weights.biodiversity
        + weights.connectivity;
    if total_weight <= 0.0 {
        return Err(GreenScoringError::Failed("Zero weights".into()));
    }
    let raw = (green_coverage_score * weights.green_coverage
        + tree_cover_score * weights.tree_cover
        + accessibility_score * weights.accessibility
        + cooling_potential_score * weights.cooling_potential
        + biodiversity_score * weights.biodiversity
        + connectivity_score * weights.connectivity)
        / total_weight;
    Ok(raw.clamp(0.0, 100.0))
}

// ─────────────────────────────────────────────────────────────────────────────
// Intervention recommender
// ─────────────────────────────────────────────────────────────────────────────

/// Recommend interventions based on the object's indicators.
pub fn recommend_interventions(obj: &GreenSpaceObject) -> Vec<GreenIntervention> {
    let mut interventions = Vec::new();
    if obj.imperviousness_pct > 60.0 {
        interventions.push(GreenIntervention::Desealing);
    }
    if obj.tree_cover_pct < 15.0 {
        interventions.push(GreenIntervention::TreePlanting);
    }
    if obj.area_m2 < 500.0 && obj.upgrade_priority_score > 60.0 {
        interventions.push(GreenIntervention::PocketPark);
    }
    if obj.space_type == GreenSpaceType::PotentialArea || obj.imperviousness_pct > 70.0 {
        interventions.push(GreenIntervention::GreenRoof);
    }
    if obj.connectivity_index < 0.3 {
        interventions.push(GreenIntervention::GreenCorridor);
    }
    if obj.ndvi < 0.2 {
        interventions.push(GreenIntervention::WildflowerMeadow);
    }
    if obj.distance_to_water_m > 500.0 && obj.area_m2 > 200.0 {
        interventions.push(GreenIntervention::WaterFeature);
    }
    if interventions.is_empty() {
        interventions.push(GreenIntervention::WildflowerMeadow);
    }
    interventions
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────────

pub fn quality_label(priority_score: f32) -> &'static str {
    match priority_score as u32 {
        0..=29  => "Hohe Qualität",
        30..=49 => "Gute Qualität",
        50..=64 => "Ausbaufähig",
        65..=79 => "Aufwertungsbedarf",
        _       => "Kritischer Mangel",
    }
}

pub fn quality_color(priority_score: f32) -> &'static str {
    match priority_score as u32 {
        0..=29  => "#16a34a",
        30..=49 => "#65a30d",
        50..=64 => "#ca8a04",
        65..=79 => "#ea580c",
        _       => "#dc2626",
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::green_spaces::data_model::GreenSpaceType;

    #[test]
    fn test_green_coverage_who_target() {
        // 9 m²/person = exactly WHO target → deficit score should be in valid range
        let score = score_green_coverage(9000.0, 1000).unwrap();
        assert!(score >= 0.0 && score <= 100.0, "score out of range: {score}");
    }

    #[test]
    fn test_green_coverage_severe_deficit() {
        // 0.1 m²/person → should give high priority score
        let score = score_green_coverage(1000.0, 10000).unwrap();
        assert!(score > 60.0, "severe deficit should give high priority: {score}");
    }

    #[test]
    fn test_tree_cover_score_excellent() {
        // 80 % TCD + NDVI 0.75 → high quality → low priority score
        let score = score_tree_cover(80.0, 0.75).unwrap();
        assert!(score < 20.0, "excellent tree cover should give low priority: {score}");
    }

    #[test]
    fn test_tree_cover_score_poor() {
        // 3 % TCD + NDVI 0.08 → very poor → high priority score
        let score = score_tree_cover(3.0, 0.08).unwrap();
        assert!(score > 70.0, "poor tree cover should give high priority: {score}");
    }

    #[test]
    fn test_accessibility_within_300m() {
        // 150 m distance, no vulnerable facilities → acceptable
        let score = score_accessibility(150.0, 0).unwrap();
        assert!(score < 50.0, "within 300m should be acceptable: {score}");
    }

    #[test]
    fn test_accessibility_far() {
        // 800 m distance, 4 vulnerable facilities → high priority
        let score = score_accessibility(800.0, 4).unwrap();
        assert!(score > 70.0, "far + vulnerable = high priority: {score}");
    }

    #[test]
    fn test_cooling_potential_high_imperv() {
        // 90 % sealed PotentialArea with minimal tree cover → high deficit
        let score = score_cooling_potential(
            500.0,
            5.0,
            90.0,
            1500.0,
            &GreenSpaceType::PotentialArea,
        )
        .unwrap();
        assert!(score > 60.0, "high imperviousness = high cooling deficit: {score}");
    }

    #[test]
    fn test_cooling_potential_urban_forest() {
        // 90 % tree cover, 3 % imperviousness, large area → low deficit
        let score = score_cooling_potential(
            2_000_000.0,
            90.0,
            3.0,
            500.0,
            &GreenSpaceType::UrbanForest,
        )
        .unwrap();
        assert!(score < 20.0, "urban forest should have low cooling deficit: {score}");
    }

    #[test]
    fn test_compute_upgrade_priority_range() {
        let w = GreenWeights::default();
        let score = compute_upgrade_priority(80.0, 70.0, 60.0, 50.0, 40.0, 30.0, &w).unwrap();
        assert!(score >= 0.0 && score <= 100.0, "score out of range: {score}");
    }

    #[test]
    fn test_demo_data_builds() {
        use crate::green_spaces::demo::build_frankfurt_green_demo;
        let spaces = build_frankfurt_green_demo();
        assert!(spaces.len() >= 10, "expected at least 10 demo spaces");
        for s in &spaces {
            assert!(
                s.upgrade_priority_score >= 0.0 && s.upgrade_priority_score <= 100.0,
                "score out of range for {}: {}",
                s.name,
                s.upgrade_priority_score
            );
        }
    }

    #[test]
    fn test_scenario_has_interventions() {
        use crate::green_spaces::demo::build_frankfurt_green_demo;
        use crate::green_spaces::scenario::compute_green_scenario;
        let spaces = build_frankfurt_green_demo();
        let sc = compute_green_scenario(&spaces[0]).unwrap();
        assert!(!sc.ranked_interventions.is_empty());
        assert!(sc.projected_priority_score <= sc.current_priority_score + 0.1);
    }

    #[test]
    fn test_geojson_export_valid() {
        use crate::green_spaces::demo::build_frankfurt_green_demo;
        use crate::export::geojson::green_spaces_to_geojson;
        let spaces = build_frankfurt_green_demo();
        let json = green_spaces_to_geojson(&spaces).unwrap();
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["type"], "FeatureCollection");
        assert!(v["features"].as_array().unwrap().len() >= 10);
    }

    #[test]
    fn test_invalid_ndvi_rejected() {
        let result = score_tree_cover(20.0, 1.5);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_area_rejected() {
        let result = score_green_coverage(0.0, 100);
        assert!(result.is_err());
    }
}
