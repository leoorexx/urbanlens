//! Best-Scenario analysis: rank cooling interventions per district.
//!
//! ## Algorithm
//! For each [`InterventionType`] we compute:
//! 1. **Applicability** — how suitable is this measure given the cell's structure?
//! 2. **Priority score** — combines applicability, heat intensity, and vulnerability.
//! 3. **Estimated cooling** — applicability-weighted literature value (model assumption).
//!
//! We then simulate a modified cell with top-3 interventions applied (with
//! diminishing returns) and re-run the Heat Risk Score to estimate the
//! post-intervention situation.
//!
//! ## Uncertainty
//! All cooling estimates are **qualitative scenario assumptions** drawn from
//! literature meta-analyses (UBA 2021, BBSR 2023, WHO HHAP).  They are NOT
//! calibrated against local Frankfurt measurements.  Label them accordingly
//! in every UI surface.

use crate::heat_islands::data_model::{
    BestScenarioResult, HeatIslandCell, InterventionType, RankedIntervention,
};
use crate::heat_islands::scoring::{compute_heat_risk_score, HeatRiskWeights, ScoringResult};

// ─────────────────────────────────────────────────────────────────────────────
// Intervention effect table (literature-based model assumptions)
// ─────────────────────────────────────────────────────────────────────────────

struct Effect {
    /// Median estimated LST reduction (°C) at full coverage.
    /// Sources: UBA 2021 "Klimaanpassung in der Stadtplanung",
    ///          BBSR 2023 "Wirksamkeit Stadtbegrünungsmaßnahmen",
    ///          WHO Heat Health Action Plan 2021.
    lst_delta_celsius: f32,
    /// Uncertainty ±°C (std. dev. from literature range).
    uncertainty_celsius: f32,
    /// Imperviousness reduction (percentage points).
    imp_reduction_pct: f32,
    /// NDVI increase.
    ndvi_increase: f32,
    /// Tree-cover increase (percentage points).
    tree_increase_pct: f32,
    /// Physical cooling mechanism description.
    mechanism: &'static str,
}

fn effect(intervention: &InterventionType) -> Effect {
    match intervention {
        InterventionType::StreetTrees => Effect {
            lst_delta_celsius: 1.2,
            uncertainty_celsius: 0.6,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.15,
            tree_increase_pct: 15.0,
            mechanism: "Evapotranspiration + Verschattung (Canopy-Cooling)",
        },
        InterventionType::Unsealing => Effect {
            lst_delta_celsius: 0.8,
            uncertainty_celsius: 0.4,
            imp_reduction_pct: 15.0,
            ndvi_increase: 0.10,
            tree_increase_pct: 0.0,
            mechanism: "Reduzierte Wärmespeicherung, erhöhte Verdunstung",
        },
        InterventionType::PocketPark => Effect {
            lst_delta_celsius: 1.5,
            uncertainty_celsius: 0.8,
            imp_reduction_pct: 20.0,
            ndvi_increase: 0.20,
            tree_increase_pct: 10.0,
            mechanism: "Lokaler Kaltluftentstehungspunkt, Evapotranspiration (Park-Cool-Island)",
        },
        InterventionType::GreenRoof => Effect {
            lst_delta_celsius: 0.5,
            uncertainty_celsius: 0.3,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.05,
            tree_increase_pct: 0.0,
            mechanism: "Reduzierte Wärmeabgabe durch Gebäude (Substrat-Kühlung + Evaporation)",
        },
        InterventionType::FacadeGreening => Effect {
            lst_delta_celsius: 0.4,
            uncertainty_celsius: 0.25,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.03,
            tree_increase_pct: 0.0,
            mechanism: "Verschattung + Transpirationskühlung an Fassade",
        },
        InterventionType::BrightSurfaces => Effect {
            lst_delta_celsius: 0.7,
            uncertainty_celsius: 0.4,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.0,
            tree_increase_pct: 0.0,
            mechanism: "Erhöhte Albedo reduziert solare Strahlungsabsorption (Cool Pavements)",
        },
        InterventionType::ShadeStructures => Effect {
            lst_delta_celsius: 0.6,
            uncertainty_celsius: 0.3,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.0,
            tree_increase_pct: 0.0,
            mechanism: "Direkte Strahlungsblockierung (Pergola, Sonnensegel, Markisen)",
        },
        InterventionType::WaterFeatures => Effect {
            lst_delta_celsius: 1.0,
            uncertainty_celsius: 0.5,
            imp_reduction_pct: 5.0,
            ndvi_increase: 0.0,
            tree_increase_pct: 0.0,
            mechanism: "Evaporative Kühlung (Brunnen, Fontäne, Nebeldüsen)",
        },
        InterventionType::SpongeCity => Effect {
            lst_delta_celsius: 0.6,
            uncertainty_celsius: 0.35,
            imp_reduction_pct: 10.0,
            ndvi_increase: 0.08,
            tree_increase_pct: 5.0,
            mechanism: "Bodenfeuchtigkeit durch Regenwasserretention → erhöhte Verdunstung",
        },
        InterventionType::ColdAirCorridor => Effect {
            lst_delta_celsius: 1.8,
            uncertainty_celsius: 1.0,
            imp_reduction_pct: 0.0,
            ndvi_increase: 0.0,
            tree_increase_pct: 0.0,
            mechanism: "Nachtabkühlung durch ungehinderten Kaltluftabfluss aus Grünland / Wäldern",
        },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Applicability functions — how suitable is an intervention for a cell?
// ─────────────────────────────────────────────────────────────────────────────

fn norm(v: f32, min: f32, max: f32) -> f32 {
    if max <= min { return 0.5; }
    ((v - min) / (max - min)).clamp(0.0, 1.0)
}

fn applicability(intervention: &InterventionType, cell: &HeatIslandCell) -> f32 {
    match intervention {
        InterventionType::StreetTrees => {
            // Best where sealing is high and tree cover is low
            let seal = norm(cell.imperviousness.fraction_pct, 30.0, 100.0);
            let lack = 1.0 - norm(cell.vegetation.tree_cover_pct, 0.0, 40.0);
            (seal * 0.5 + lack * 0.5).clamp(0.0, 1.0)
        }
        InterventionType::Unsealing => {
            // Only makes sense where sealing is high enough
            norm(cell.imperviousness.fraction_pct, 50.0, 100.0)
        }
        InterventionType::PocketPark => {
            let dist  = norm(cell.cooling_potential.distance_to_green_m, 100.0, 600.0);
            let space = norm(cell.cooling_potential.sealable_area_m2, 500.0, 5000.0);
            (dist * 0.6 + space * 0.4).clamp(0.0, 1.0)
        }
        InterventionType::GreenRoof => {
            // Dense building coverage = more roof area available
            norm(cell.building_density.coverage, 0.3, 1.0)
        }
        InterventionType::FacadeGreening => {
            // High FAR = more facade area
            norm(cell.building_density.floor_area_ratio, 1.0, 5.0)
        }
        InterventionType::BrightSurfaces => {
            let radiation = norm(cell.shadow_potential.solar_radiation_wm2, 150.0, 350.0);
            let sealed    = norm(cell.imperviousness.fraction_pct, 50.0, 100.0);
            (radiation * 0.5 + sealed * 0.5).clamp(0.0, 1.0)
        }
        InterventionType::ShadeStructures => {
            // Most useful where shade is lacking AND radiation is high
            let need      = 1.0 - cell.shadow_potential.shaded_fraction.clamp(0.0, 1.0);
            let radiation = norm(cell.shadow_potential.solar_radiation_wm2, 200.0, 350.0);
            (need * 0.6 + radiation * 0.4).clamp(0.0, 1.0)
        }
        InterventionType::WaterFeatures => {
            let heat  = norm(cell.surface_temperature.delta_celsius, 1.5, 5.0);
            let dist  = norm(cell.cooling_potential.distance_to_water_m, 200.0, 1000.0);
            (heat * 0.5 + dist * 0.5).clamp(0.0, 1.0)
        }
        InterventionType::SpongeCity => {
            // Requires sealed surface; adds most value where water is scarce
            norm(cell.imperviousness.fraction_pct, 40.0, 100.0)
        }
        InterventionType::ColdAirCorridor => {
            // Only applicable where corridor connectivity exists
            cell.cooling_potential.cold_air_corridor_score.clamp(0.0, 1.0)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority score
// ─────────────────────────────────────────────────────────────────────────────

fn priority_score(appl: f32, cell: &HeatIslandCell) -> f32 {
    let heat_intensity = norm(cell.heat_risk_score, 30.0, 100.0);
    let vuln           = norm(cell.vulnerability.composite, 20.0, 100.0);
    // Weights: applicability 45 %, heat intensity 35 %, vulnerability 20 %
    (appl * 0.45 + heat_intensity * 0.35 + vuln * 0.20) * 100.0
}

// ─────────────────────────────────────────────────────────────────────────────
// Rationale builder
// ─────────────────────────────────────────────────────────────────────────────

fn build_rationale(
    intervention: &InterventionType,
    cell: &HeatIslandCell,
    eff: &Effect,
    appl: f32,
) -> String {
    let level = if appl > 0.7 {
        "Hohe Priorität"
    } else if appl > 0.4 {
        "Mittlere Priorität"
    } else {
        "Bedingt geeignet"
    };
    format!(
        "{} {} ({level}): {}. Anwendbarkeit für {}: {:.0}%. \
        Modelliertes Kühlungspotenzial: ~{:.1}°C LST-Reduktion (±{:.1}°C Unsicherheit).",
        intervention.emoji(),
        intervention.label(),
        eff.mechanism,
        cell.name,
        appl * 100.0,
        eff.lst_delta_celsius * appl,
        eff.uncertainty_celsius,
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API: rank a single intervention
// ─────────────────────────────────────────────────────────────────────────────

fn rank_intervention(intervention: &InterventionType, cell: &HeatIslandCell) -> RankedIntervention {
    let eff  = effect(intervention);
    let appl = applicability(intervention, cell);
    let ps   = priority_score(appl, cell).clamp(0.0, 100.0);

    RankedIntervention {
        intervention: intervention.clone(),
        priority_score: ps,
        estimated_cooling_celsius: eff.lst_delta_celsius * appl,
        applicability: appl,
        rationale: build_rationale(intervention, cell, &eff, appl),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API: Best-Scenario for one cell
// ─────────────────────────────────────────────────────────────────────────────

const ALL_INTERVENTIONS: &[InterventionType] = &[
    InterventionType::StreetTrees,
    InterventionType::Unsealing,
    InterventionType::PocketPark,
    InterventionType::GreenRoof,
    InterventionType::FacadeGreening,
    InterventionType::BrightSurfaces,
    InterventionType::ShadeStructures,
    InterventionType::WaterFeatures,
    InterventionType::SpongeCity,
    InterventionType::ColdAirCorridor,
];

/// Mandatory uncertainty disclaimer — always attached to scenario output.
const METHODOLOGY_NOTE: &str =
    "Alle Kühlungsabschätzungen sind Modellwerte auf Basis wissenschaftlicher Literatur \
    (UBA 2021, BBSR 2023, WHO HHAP). Keine lokalen Messdaten. LST ≠ Lufttemperatur auf \
    Augenhöhe (VDI 3787 Bl. 1). Für verbindliche Planungsaussagen ist eine \
    Mikroklimasimulation (ENVI-met o. ä.) oder mobile Messkampagne erforderlich \
    (ISO 14091, VDI 3787 Bl. 2).";

/// Compute the Best-Scenario result for a district cell.
///
/// Returns all ten interventions ranked by priority, plus an aggregated estimate
/// of the cooling potential achieved by the top-3 measures.
pub fn compute_best_scenario(cell: &HeatIslandCell) -> ScoringResult<BestScenarioResult> {
    // 1. Rank all interventions
    let mut ranked: Vec<RankedIntervention> = ALL_INTERVENTIONS
        .iter()
        .map(|i| rank_intervention(i, cell))
        .collect();
    ranked.sort_by(|a, b| b.priority_score.partial_cmp(&a.priority_score).unwrap());

    // 2. Aggregate top-3 cooling with diminishing returns
    //    Each additional measure adds less because some cooling mechanisms overlap.
    let top3_cooling: f32 = ranked.iter()
        .take(3)
        .enumerate()
        .map(|(i, r)| r.estimated_cooling_celsius * (1.0 - 0.25 * i as f32))
        .sum::<f32>()
        // Physical cap: cannot cool more than 70 % of the SUHI intensity
        .min(cell.surface_temperature.delta_celsius * 0.70)
        .max(0.0);

    // 3. Simulate a modified cell with top-3 interventions applied
    let mut modified = cell.clone();
    for ri in ranked.iter().take(3) {
        let eff = effect(&ri.intervention);
        let a   = ri.applicability;
        // Apply a dampened fraction (50 % of theoretical max, conservative)
        modified.surface_temperature.delta_celsius -= eff.lst_delta_celsius * a * 0.50;
        modified.imperviousness.fraction_pct       -= eff.imp_reduction_pct * a;
        modified.vegetation.ndvi                   += eff.ndvi_increase * a;
        modified.vegetation.tree_cover_pct         += eff.tree_increase_pct * a;
    }
    // Clamp to physical bounds
    modified.surface_temperature.delta_celsius =
        modified.surface_temperature.delta_celsius.max(-1.0);
    modified.imperviousness.fraction_pct =
        modified.imperviousness.fraction_pct.clamp(0.0, 100.0);
    modified.vegetation.ndvi =
        modified.vegetation.ndvi.clamp(-0.1, 0.9);
    modified.vegetation.tree_cover_pct =
        modified.vegetation.tree_cover_pct.clamp(0.0, 100.0);

    // 4. Compute projected score
    let projected = compute_heat_risk_score(&modified, &HeatRiskWeights::default())?;
    let current   = cell.heat_risk_score;
    let reduction_pct = ((current - projected) / current.max(1.0) * 100.0)
        .clamp(0.0, 70.0); // cap at 70 % — no scenario promises more

    // 5. Build summary rationale
    let top3_labels: Vec<&str> = ranked.iter().take(3)
        .map(|r| r.intervention.label())
        .collect();

    let rationale = format!(
        "Für {} (Heat Risk Score: {current:.0}/100 — \"{}\", LST-Delta: {:.1}°C, \
        Versiegelung: {:.0}%): Die drei wirksamsten Maßnahmen sind {}. \
        Kombiniertes Kühlungspotenzial (Modellschätzung): ~{:.1}°C LST-Reduktion, \
        projizierter Score: {projected:.0}/100 (−{reduction_pct:.0}%).",
        cell.name,
        cell.risk_label(),
        cell.surface_temperature.delta_celsius,
        cell.imperviousness.fraction_pct,
        top3_labels.join(", "),
        top3_cooling,
    );

    Ok(BestScenarioResult {
        district_id: cell.id.clone(),
        district_name: cell.name.clone(),
        ranked_interventions: ranked,
        estimated_lst_reduction_celsius: top3_cooling,
        estimated_risk_reduction_pct: reduction_pct,
        projected_heat_risk_score: projected,
        current_heat_risk_score: current,
        rationale,
        methodology_note: METHODOLOGY_NOTE,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::demo;

    fn make_hot_cell() -> HeatIslandCell {
        let mut cell = demo::make_bahnhofsviertel();
        cell.heat_risk_score = 82.0;
        cell
    }

    #[test]
    fn best_scenario_produces_output() {
        let cell   = make_hot_cell();
        let result = compute_best_scenario(&cell).unwrap();
        assert!(!result.ranked_interventions.is_empty());
        assert_eq!(result.ranked_interventions.len(), 10); // all interventions ranked
    }

    #[test]
    fn projected_score_is_lower() {
        let cell   = make_hot_cell();
        let result = compute_best_scenario(&cell).unwrap();
        assert!(
            result.projected_heat_risk_score < result.current_heat_risk_score,
            "Projected {:.1} should be < current {:.1}",
            result.projected_heat_risk_score,
            result.current_heat_risk_score,
        );
    }

    #[test]
    fn reduction_capped_at_70_pct() {
        let cell   = make_hot_cell();
        let result = compute_best_scenario(&cell).unwrap();
        assert!(
            result.estimated_risk_reduction_pct <= 70.0,
            "Reduction {:.1}% exceeded 70% cap",
            result.estimated_risk_reduction_pct,
        );
    }

    #[test]
    fn interventions_sorted_descending() {
        let cell   = make_hot_cell();
        let result = compute_best_scenario(&cell).unwrap();
        let scores: Vec<f32> = result.ranked_interventions.iter()
            .map(|r| r.priority_score)
            .collect();
        for i in 0..scores.len() - 1 {
            assert!(
                scores[i] >= scores[i + 1],
                "Ranking not sorted at position {i}: {} < {}",
                scores[i], scores[i + 1]
            );
        }
    }

    #[test]
    fn cold_air_corridor_low_without_connectivity() {
        let mut cell = make_hot_cell();
        cell.cooling_potential.cold_air_corridor_score = 0.0;
        let result = compute_best_scenario(&cell).unwrap();
        let corridor = result.ranked_interventions.iter()
            .find(|r| r.intervention == InterventionType::ColdAirCorridor)
            .unwrap();
        assert!(
            corridor.applicability < 0.05,
            "Corridor applicability should be ~0 without connectivity, got {}",
            corridor.applicability
        );
    }

    #[test]
    fn methodology_note_always_present() {
        let cell   = make_hot_cell();
        let result = compute_best_scenario(&cell).unwrap();
        assert!(!result.methodology_note.is_empty());
        assert!(result.methodology_note.contains("VDI 3787"));
    }

    #[test]
    fn all_districts_produce_valid_scenario() {
        let dataset = demo::build_frankfurt_demo();
        for cell in dataset {
            let result = compute_best_scenario(&cell).unwrap();
            assert!(result.projected_heat_risk_score >= 0.0);
            assert!(result.projected_heat_risk_score <= 100.0);
            assert!(result.estimated_risk_reduction_pct <= 70.0);
        }
    }
}
