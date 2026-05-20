//! Synthetic Frankfurt green-space demo dataset. /* DEMO */
//!
//! 14 representative green spaces with real Frankfurt coordinates.
//! All values are synthetic and clearly labelled as demo data.
//!
//! Sources for coordinates: OpenStreetMap Frankfurt am Main.

use super::data_model::*;
use super::scoring::*;

// ─────────────────────────────────────────────────────────────────────────────
// Main dataset builder /* DEMO */
// ─────────────────────────────────────────────────────────────────────────────

/// Build 14 synthetic Frankfurt green spaces with computed scores. /* DEMO */
pub fn build_frankfurt_green_demo() -> Vec<GreenSpaceObject> {
    // Tuple layout:
    // (id, name, type, area_m2, lat, lon, ndvi, tree_cover, imperv,
    //  dist_green, dist_water, pop_300m, vuln, connectivity)
    #[allow(clippy::type_complexity)]
    let records: Vec<(
        &str, &str, GreenSpaceType, f32, f64, f64,
        f32, f32, f32, f32, f32, u32, u32, f32,
    )> = vec![
        /* DEMO */ (
            "grueneburgpark", "Grüneburgpark",
            GreenSpaceType::Park, 260_000.0, 50.1248, 8.6631,
            0.72, 55.0, 8.0, 0.0, 1_200.0, 4_200, 1, 0.65,
        ),
        /* DEMO */ (
            "palmengarten", "Palmengarten",
            GreenSpaceType::Park, 220_000.0, 50.1226, 8.6564,
            0.68, 48.0, 12.0, 200.0, 900.0, 3_800, 0, 0.70,
        ),
        /* DEMO */ (
            "ostpark", "Ostpark",
            GreenSpaceType::Park, 330_000.0, 50.1085, 8.7112,
            0.65, 42.0, 15.0, 0.0, 600.0, 5_200, 2, 0.60,
        ),
        /* DEMO */ (
            "nidda_ufer", "Nidda-Uferpark",
            GreenSpaceType::RiverbankGreen, 480_000.0, 50.1380, 8.6220,
            0.75, 38.0, 20.0, 0.0, 0.0, 2_800, 0, 0.80,
        ),
        /* DEMO */ (
            "stadtwald", "Stadtwald Frankfurt",
            GreenSpaceType::UrbanForest, 4_800_000.0, 50.0680, 8.6620,
            0.88, 92.0, 2.0, 0.0, 2_000.0, 800, 0, 0.92,
        ),
        /* DEMO */ (
            "guenthersburgpark", "Günthersburgpark",
            GreenSpaceType::Park, 180_000.0, 50.1292, 8.7098,
            0.62, 52.0, 10.0, 0.0, 500.0, 4_100, 2, 0.55,
        ),
        /* DEMO */ (
            "bethmannpark", "Bethmannpark",
            GreenSpaceType::Park, 46_000.0, 50.1155, 8.7011,
            0.55, 38.0, 18.0, 300.0, 800.0, 6_200, 3, 0.40,
        ),
        /* DEMO */ (
            "bahnhofsviertel_pocket", "Pocket Park Bahnhofsviertel",
            GreenSpaceType::PocketPark, 420.0, 50.1075, 8.6701,
            0.12, 4.0, 88.0, 480.0, 1_200.0, 9_800, 4, 0.08,
        ),
        /* DEMO */ (
            "sachsenhausen_pocket", "Kleinstgrün Sachsenhausen",
            GreenSpaceType::PocketPark, 680.0, 50.1002, 8.6882,
            0.18, 8.0, 75.0, 320.0, 400.0, 7_200, 3, 0.15,
        ),
        /* DEMO */ (
            "nordend_potential", "Potenzialfläche Nordend",
            GreenSpaceType::PotentialArea, 1_200.0, 50.1322, 8.6834,
            0.05, 0.0, 95.0, 420.0, 900.0, 8_100, 4, 0.05,
        ),
        /* DEMO */ (
            "innenstadt_dach", "Dachbegrünung Innenstadt",
            GreenSpaceType::GreenRoof, 800.0, 50.1113, 8.6820,
            0.22, 0.0, 90.0, 350.0, 600.0, 11_000, 5, 0.10,
        ),
        /* DEMO */ (
            "riedwiese", "Riedwiese Niederrad",
            GreenSpaceType::Grassland, 85_000.0, 50.0882, 8.6502,
            0.58, 12.0, 22.0, 200.0, 300.0, 2_100, 1, 0.48,
        ),
        /* DEMO */ (
            "kleingartenanlage_bornheim", "Kleingartenanlagen Bornheim",
            GreenSpaceType::Allotment, 120_000.0, 50.1248, 8.7221,
            0.60, 28.0, 30.0, 150.0, 700.0, 3_400, 1, 0.42,
        ),
        /* DEMO */ (
            "main_ufer", "Mainufer Frankfurt",
            GreenSpaceType::RiverbankGreen, 320_000.0, 50.1031, 8.6790,
            0.50, 22.0, 35.0, 0.0, 0.0, 8_500, 3, 0.70,
        ),
    ];

    let weights = GreenWeights::default();

    records
        .into_iter()
        .map(
            |(id, name, space_type, area_m2, lat, lon, ndvi, tree_cover_pct,
              imperviousness_pct, dist_green, dist_water, pop, vuln, connectivity)| {
                // Compute all sub-scores
                let green_coverage_score =
                    score_green_coverage(area_m2, pop).unwrap_or(50.0);
                let tree_cover_score =
                    score_tree_cover(tree_cover_pct, ndvi).unwrap_or(50.0);
                let accessibility_score =
                    score_accessibility(dist_green, vuln).unwrap_or(50.0);
                let cooling_potential_score = score_cooling_potential(
                    area_m2,
                    tree_cover_pct,
                    imperviousness_pct,
                    dist_water,
                    &space_type,
                )
                .unwrap_or(50.0);
                let biodiversity_potential_score =
                    score_biodiversity_potential(ndvi, area_m2, &space_type, connectivity)
                        .unwrap_or(50.0);
                let connectivity_score =
                    score_connectivity(connectivity, dist_green).unwrap_or(50.0);
                let upgrade_priority_score = compute_upgrade_priority(
                    green_coverage_score,
                    tree_cover_score,
                    accessibility_score,
                    cooling_potential_score,
                    biodiversity_potential_score,
                    connectivity_score,
                    &weights,
                )
                .unwrap_or(50.0);

                let mut obj = GreenSpaceObject {
                    id: id.to_string(),
                    name: name.to_string(),
                    space_type,
                    area_m2,
                    lat,
                    lon,
                    geometry: None,
                    ndvi,
                    tree_cover_pct,
                    imperviousness_pct,
                    distance_to_nearest_green_m: dist_green,
                    distance_to_water_m: dist_water,
                    population_within_300m: pop,
                    vulnerable_facilities_within_500m: vuln,
                    connectivity_index: connectivity,
                    green_coverage_score,
                    tree_cover_score,
                    accessibility_score,
                    cooling_potential_score,
                    biodiversity_potential_score,
                    connectivity_score,
                    upgrade_priority_score,
                    recommended_interventions: vec![],
                    methodology_note:
                        "⚠ Synthetische Demo-Daten — keine realen Messwerte.", /* DEMO */
                };
                obj.recommended_interventions = recommend_interventions(&obj);
                obj
            },
        )
        .collect()
}

// ─────────────────────────────────────────────────────────────────────────────
// Potential areas dataset /* DEMO */
// ─────────────────────────────────────────────────────────────────────────────

/// Predefined potential transformation sites in Frankfurt. /* DEMO */
pub fn build_frankfurt_potential_areas() -> Vec<PotentialArea> {
    vec![
        /* DEMO */
        PotentialArea {
            id: "pa_bahnhof_parking".into(),
            name: "Parkplatz Kaiserstraße — Entsiegelung".into(),
            area_m2: 2_400.0,
            current_type: "Parkplatz".into(),
            intervention: GreenIntervention::Desealing,
            feasibility: Feasibility::Medium,
            estimated_cooling_celsius: 0.6,
            estimated_co2_sequestration_kg_yr: 480.0,
            priority_score: 82.0,
            rationale:
                "Dichtbebaute Innenstadt, hohe LST, direkter Nutzen für 9.800 Anwohner.".into(),
            geometry: None,
        },
        /* DEMO */
        PotentialArea {
            id: "pa_nordend_roof".into(),
            name: "Gründach Nordend-Ost".into(),
            area_m2: 3_200.0,
            current_type: "Flachdach".into(),
            intervention: GreenIntervention::GreenRoof,
            feasibility: Feasibility::High,
            estimated_cooling_celsius: 0.8,
            estimated_co2_sequestration_kg_yr: 48.0,
            priority_score: 74.0,
            rationale:
                "Dichtes Gründerzeit-Quartier ohne Grün. 50% Förderung verfügbar.".into(),
            geometry: None,
        },
        /* DEMO */
        PotentialArea {
            id: "pa_sachsenhausen_corridor".into(),
            name: "Grünkorridor Sachsenhausen–Ostpark".into(),
            area_m2: 8_500.0,
            current_type: "Brache / Restflächen".into(),
            intervention: GreenIntervention::GreenCorridor,
            feasibility: Feasibility::Low,
            estimated_cooling_celsius: 1.2,
            estimated_co2_sequestration_kg_yr: 1_700.0,
            priority_score: 68.0,
            rationale:
                "Verbindet isolierte Grünflächen — Biodiversitätskorridor fehlt.".into(),
            geometry: None,
        },
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree dataset /* DEMO */
// ─────────────────────────────────────────────────────────────────────────────

/// Three representative trees from Frankfurt's Baumkataster (synthetic). /* DEMO */
pub fn build_frankfurt_tree_demo() -> Vec<TreeObject> {
    vec![
        /* DEMO */
        TreeObject {
            id: "tree_001".into(),
            species: Some("Tilia cordata".into()),
            height_m: 18.0,
            crown_diameter_m: 12.0,
            trunk_circumference_cm: Some(180.0),
            age_class: TreeAgeClass::Mature,
            condition: TreeCondition::Good,
            lat: 50.1155,
            lon: 8.7011,
            shade_area_m2: std::f32::consts::PI * 6.0_f32 * 6.0,
            co2_stored_kg: 820.0,
            cooling_score: 72.0,
        },
        /* DEMO */
        TreeObject {
            id: "tree_002".into(),
            species: Some("Platanus × acerifolia".into()),
            height_m: 25.0,
            crown_diameter_m: 18.0,
            trunk_circumference_cm: Some(310.0),
            age_class: TreeAgeClass::Old,
            condition: TreeCondition::Excellent,
            lat: 50.1248,
            lon: 8.6631,
            shade_area_m2: std::f32::consts::PI * 9.0 * 9.0,
            co2_stored_kg: 1_850.0,
            cooling_score: 91.0,
        },
        /* DEMO */
        TreeObject {
            id: "tree_003".into(),
            species: Some("Quercus robur".into()),
            height_m: 8.0,
            crown_diameter_m: 5.0,
            trunk_circumference_cm: Some(60.0),
            age_class: TreeAgeClass::Young,
            condition: TreeCondition::Fair,
            lat: 50.1075,
            lon: 8.6701,
            shade_area_m2: std::f32::consts::PI * 2.5 * 2.5,
            co2_stored_kg: 120.0,
            cooling_score: 31.0,
        },
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_potential_areas_build() {
        let areas = build_frankfurt_potential_areas();
        assert!(!areas.is_empty());
        assert_eq!(areas.len(), 3);
    }

    #[test]
    fn test_trees_build() {
        let trees = build_frankfurt_tree_demo();
        assert!(!trees.is_empty());
        assert!(trees[0].co2_stored_kg > 0.0);
        assert!(trees[1].cooling_score > trees[2].cooling_score);
    }

    #[test]
    fn test_all_spaces_have_valid_scores() {
        let spaces = build_frankfurt_green_demo();
        assert_eq!(spaces.len(), 14);
        for s in &spaces {
            assert!(
                s.upgrade_priority_score >= 0.0 && s.upgrade_priority_score <= 100.0,
                "out of range for {}: {}",
                s.name,
                s.upgrade_priority_score
            );
            assert!(!s.recommended_interventions.is_empty(),
                "no interventions for {}", s.name);
        }
    }
}
