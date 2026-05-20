//! Green Best-Scenario analysis.
//!
//! Ranks cooling/greening interventions per green space object and produces
//! aggregated estimates for cooling, CO₂ sequestration, and score improvement.
//!
//! ## Uncertainty
//! All estimates are **model assumptions** from literature meta-analyses.
//! They are NOT calibrated against local measurements.  Always display the
//! `methodology_note` in every UI surface.

use super::data_model::*;
use super::scoring::*;

// ─────────────────────────────────────────────────────────────────────────────
// Mandatory uncertainty disclaimer
// ─────────────────────────────────────────────────────────────────────────────

pub const GREEN_METHODOLOGY_NOTE: &str =
    "⚠ Modellschätzung: Kühlungs- und CO₂-Werte basieren auf Literaturmittelwerten \
     (Bowler et al. 2010, i-Tree Eco, BBSR 2023). Keine Kalibrierung gegen Messdaten. \
     Für verbindliche Planung: Vor-Ort-Erhebung und ökologisches Gutachten erforderlich.";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/// Compute the Green Best-Scenario for a single green space object.
pub fn compute_green_scenario(obj: &GreenSpaceObject) -> ScoringResult<GreenScenarioResult> {
    let interventions = recommend_interventions(obj);

    let mut ranked: Vec<RankedGreenIntervention> = interventions
        .iter()
        .map(|iv| {
            let cooling = compute_intervention_cooling(iv, obj);
            let area = estimate_intervention_area(iv, obj);
            let cost = iv.typical_cost_eur_per_m2() * area;
            let funding = cost * iv.funding_pct();
            let applicability = compute_applicability(iv, obj);
            let priority = compute_intervention_priority(iv, obj, applicability);
            RankedGreenIntervention {
                intervention: iv.clone(),
                priority_score: priority,
                estimated_cooling_celsius: cooling,
                estimated_area_m2: area,
                estimated_cost_eur: cost,
                funding_available_eur: funding,
                applicability,
                rationale: build_rationale(iv, obj),
            }
        })
        .collect();

    ranked.sort_by(|a, b| b.priority_score.partial_cmp(&a.priority_score).unwrap());

    // Aggregate cooling (diminishing returns: each additional measure adds 75 % of previous)
    let total_cooling = ranked
        .iter()
        .take(3)
        .enumerate()
        .fold(0.0_f32, |acc, (i, r)| {
            acc + r.estimated_cooling_celsius * 0.75_f32.powi(i as i32)
        })
        // Cap at 2× the type's typical cooling — prevents unrealistic estimates
        .min(obj.space_type.typical_cooling_celsius() * 2.0);

    let co2 = estimate_co2_sequestration(&ranked, obj.area_m2);

    // Project score: interventions reduce the upgrade priority (= improve quality)
    let reduction_factor = ranked
        .iter()
        .take(3)
        .map(|r| r.applicability * 0.15)
        .sum::<f32>();
    let projected = (obj.upgrade_priority_score * (1.0 - reduction_factor.min(0.50)))
        .clamp(0.0, 100.0);
    let risk_reduction = ((obj.upgrade_priority_score - projected)
        / obj.upgrade_priority_score.max(1.0)
        * 100.0)
        .clamp(0.0, 100.0);

    let potential_areas = identify_potential_areas(obj);

    Ok(GreenScenarioResult {
        object_id: obj.id.clone(),
        object_name: obj.name.clone(),
        current_priority_score: obj.upgrade_priority_score,
        projected_priority_score: projected,
        estimated_cooling_celsius: total_cooling,
        estimated_co2_sequestration_kg_yr: co2,
        estimated_risk_reduction_pct: risk_reduction,
        ranked_interventions: ranked,
        potential_areas,
        rationale: build_scenario_rationale(obj),
        methodology_note: GREEN_METHODOLOGY_NOTE,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

fn compute_intervention_cooling(iv: &GreenIntervention, obj: &GreenSpaceObject) -> f32 {
    let base = match iv {
        GreenIntervention::TreePlanting    => 0.4,
        GreenIntervention::GreenRoof       => 0.8,
        GreenIntervention::Desealing       => 0.6,
        GreenIntervention::PocketPark      => 0.5,
        GreenIntervention::GreenCorridor   => 0.9,
        GreenIntervention::WaterFeature    => 0.7,
        GreenIntervention::WildflowerMeadow => 0.3,
        GreenIntervention::GreenFacade     => 0.4,
    };
    // Scale by heat deficit (high cooling_potential_score = more heat to remove)
    let heat_factor = (obj.cooling_potential_score / 100.0).clamp(0.5, 1.5);
    (base * heat_factor).clamp(0.1, 3.0)
}

fn estimate_intervention_area(iv: &GreenIntervention, obj: &GreenSpaceObject) -> f32 {
    match iv {
        GreenIntervention::GreenRoof  => (obj.area_m2 * 0.3).max(200.0),
        GreenIntervention::Desealing  => (obj.area_m2 * obj.imperviousness_pct / 100.0).max(100.0),
        GreenIntervention::PocketPark => 300.0_f32.min(obj.area_m2 * 0.5),
        GreenIntervention::GreenCorridor => 500.0,
        GreenIntervention::WildflowerMeadow => (obj.area_m2 * 0.2).max(50.0),
        GreenIntervention::TreePlanting => 1.0, // per-tree cost model
        _ => (obj.area_m2 * 0.1).max(50.0),
    }
}

fn compute_applicability(iv: &GreenIntervention, obj: &GreenSpaceObject) -> f32 {
    match iv {
        GreenIntervention::Desealing => {
            (obj.imperviousness_pct / 100.0).clamp(0.1, 1.0)
        }
        GreenIntervention::TreePlanting => {
            if obj.tree_cover_pct < 20.0 { 0.9 } else { 0.4 }
        }
        GreenIntervention::GreenRoof => 0.7,
        GreenIntervention::GreenCorridor => {
            (1.0 - obj.connectivity_index).clamp(0.1, 1.0)
        }
        GreenIntervention::WildflowerMeadow => {
            if obj.ndvi < 0.3 { 0.8 } else { 0.4 }
        }
        _ => 0.6,
    }
}

fn compute_intervention_priority(
    iv: &GreenIntervention,
    obj: &GreenSpaceObject,
    applicability: f32,
) -> f32 {
    let cooling_w = compute_intervention_cooling(iv, obj) / 3.0 * 40.0;
    let app_w = applicability * 40.0;
    let urgency_w = (obj.upgrade_priority_score / 100.0) * 20.0;
    (cooling_w + app_w + urgency_w).clamp(0.0, 100.0)
}

fn build_rationale(iv: &GreenIntervention, obj: &GreenSpaceObject) -> String {
    match iv {
        GreenIntervention::TreePlanting => format!(
            "Baumdeckung {:.0}% liegt unter Zielwert 30% (EEA). Straßenbäume kühlen bis 0,4°C.",
            obj.tree_cover_pct
        ),
        GreenIntervention::Desealing => format!(
            "Versiegelungsgrad {:.0}% — Entsiegelung reduziert Hitzeinseln und verbessert Wasserhaushalt.",
            obj.imperviousness_pct
        ),
        GreenIntervention::GreenRoof => {
            "Dachbegrünung reduziert Regenwasserabfluss, kühlt Gebäude und schafft Lebensraum.".into()
        }
        GreenIntervention::PocketPark => format!(
            "Entfernung zum nächsten Grün: {:.0}m. WHO-Ziel: < 300m. Pocket Park überbrückt Lücke.",
            obj.distance_to_nearest_green_m
        ),
        GreenIntervention::GreenCorridor => {
            "Konnektivitätsindex niedrig — Grünkorridor verbindet Lebensräume.".into()
        }
        GreenIntervention::WildflowerMeadow => {
            "Niedrige Vegetationsqualität (NDVI). Blühwiese fördert Insekten und kühlt.".into()
        }
        GreenIntervention::WaterFeature => {
            "Wasserelement erhöht Verdunstungskühle und Aufenthaltsqualität.".into()
        }
        GreenIntervention::GreenFacade => {
            "Fassadenbegrünung reduziert Wärmeabstrahlung versiegelter Flächen.".into()
        }
    }
}

fn build_scenario_rationale(obj: &GreenSpaceObject) -> String {
    format!(
        "{} «{}» — Prioritätsindex {:.1}/100. {} · NDVI {:.2} · Baumdeckung {:.0}% · Entfernung Grün {:.0}m.",
        obj.space_type.emoji(),
        obj.name,
        obj.upgrade_priority_score,
        if obj.upgrade_priority_score > 65.0 {
            "Dringender Handlungsbedarf"
        } else if obj.upgrade_priority_score > 50.0 {
            "Aufwertungspotenzial"
        } else {
            "Gute Grünqualität"
        },
        obj.ndvi,
        obj.tree_cover_pct,
        obj.distance_to_nearest_green_m,
    )
}

/// Synthesise plausible potential areas based on the object's indicators.
pub fn identify_potential_areas(obj: &GreenSpaceObject) -> Vec<PotentialArea> {
    let mut areas = Vec::new();
    if obj.imperviousness_pct > 50.0 {
        areas.push(PotentialArea {
            id: format!("{}_potential_1", obj.id),
            name: format!("Entsiegelungsfläche bei {}", obj.name),
            area_m2: (obj.area_m2 * 0.15).max(200.0),
            current_type: "Asphalt / Parkplatz".into(),
            intervention: GreenIntervention::Desealing,
            feasibility: Feasibility::Medium,
            estimated_cooling_celsius: 0.5,
            estimated_co2_sequestration_kg_yr: 120.0,
            priority_score: (obj.upgrade_priority_score * 0.9).clamp(0.0, 100.0),
            rationale: "Teilentsiegelung reduziert Hitze und verbessert Wasserinfiltration."
                .into(),
            geometry: None,
        });
    }
    if obj.tree_cover_pct < 20.0 {
        areas.push(PotentialArea {
            id: format!("{}_potential_2", obj.id),
            name: format!("Baumpflanzung {}", obj.name),
            area_m2: 50.0,
            current_type: "Straßenraum".into(),
            intervention: GreenIntervention::TreePlanting,
            feasibility: Feasibility::High,
            estimated_cooling_celsius: 0.4,
            estimated_co2_sequestration_kg_yr: 22.0,
            priority_score: (obj.tree_cover_score * 0.8).clamp(0.0, 100.0),
            rationale: "10 Neupflanzungen erhöhen Baumdeckung und Beschattung.".into(),
            geometry: None,
        });
    }
    areas
}

/// Estimate total CO₂ sequestration from the top-3 ranked interventions.
///
/// Based on i-Tree Eco (~22 kg CO₂/yr per mature tree) and
/// BBSR 2023 green area averages (~200 kg CO₂/ha/yr).
pub fn estimate_co2_sequestration(interventions: &[RankedGreenIntervention], area_m2: f32) -> f32 {
    let intervention_co2: f32 = interventions
        .iter()
        .take(3)
        .map(|r| {
            let base = match r.intervention {
                GreenIntervention::TreePlanting => r.estimated_area_m2 * 22.0, // per-tree proxy
                GreenIntervention::GreenRoof => r.estimated_area_m2 * 150.0 / 10_000.0,
                GreenIntervention::Desealing => r.estimated_area_m2 * 200.0 / 10_000.0,
                GreenIntervention::WildflowerMeadow => r.estimated_area_m2 * 80.0 / 10_000.0,
                _ => r.estimated_area_m2 * 100.0 / 10_000.0,
            };
            base * r.applicability
        })
        .sum();
    // Add existing area baseline (200 kg/ha/yr)
    intervention_co2 + area_m2 * 200.0 / 10_000.0
}
