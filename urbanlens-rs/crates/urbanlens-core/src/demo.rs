//! Synthetic Frankfurt demo dataset.
//!
//! Values derived from the `STADTTEILE` constant in `index.html` and extended
//! with plausible structural attributes.  All data is labelled as synthetic.
//!
//! This module exists so the WASM and CLI binaries have immediate test data
//! without requiring real satellite preprocessing.

use crate::heat_islands::data_model::{
    BuildingDensity, CoolingPotential, HeatBurden, HeatIslandCell,
    Imperviousness, InterventionType, LocalClimateZone, ShadowPotential,
    SurfaceTemperature, VegetationIndex, VulnerabilityScore,
};
use crate::heat_islands::scoring::{classify_lcz, HeatRiskWeights};

// ─────────────────────────────────────────────────────────────────────────────
// Individual district constructors
// ─────────────────────────────────────────────────────────────────────────────

/// Bahnhofsviertel — Frankfurt's most extreme heat hotspot.
/// LST-delta 3.9 °C, sealing 88 %, SGB-II 62 %, NDVI 0.08.
pub fn make_bahnhofsviertel() -> HeatIslandCell {
    make_cell(CellSpec {
        id: "bahnhofsviertel",
        name: "Bahnhofsviertel",
        lat: 50.1075, lon: 8.6701,
        lst_delta: 3.9,
        versieg: 88.0,
        ndvi: 0.08,
        tree_cover: 4.0,
        sgb2: 62.0, kinderarmut: 70.0, elderly: 14.0, vuln_fac: 4,
        heat_risk: 82.0,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch builder — mirrors all 46 STADTTEILE from index.html
// ─────────────────────────────────────────────────────────────────────────────

/// Build the complete synthetic Frankfurt dataset (9 representative districts).
/// A full 46-district dataset would require the GeoJSON district boundaries
/// from `data/layers/` — see `geospatial::StadtteilRecord` for that pathway.
pub fn build_frankfurt_demo() -> Vec<HeatIslandCell> {
    // (id, name, lat, lon, lst_delta, versieg, ndvi, tree_cover, sgb2, kinderarmut, elderly, vuln_fac, heat_risk)
    let specs: &[CellSpec] = &[
        CellSpec { id: "bahnhofsviertel",  name: "Bahnhofsviertel",  lat: 50.1075, lon: 8.6701, lst_delta: 3.9, versieg: 88.0, ndvi: 0.08, tree_cover: 4.0,  sgb2: 62.0, kinderarmut: 70.0, elderly: 14.0, vuln_fac: 4, heat_risk: 82.0 },
        CellSpec { id: "gutleutviertel",   name: "Gutleutviertel",   lat: 50.1000, lon: 8.6600, lst_delta: 3.4, versieg: 82.0, ndvi: 0.12, tree_cover: 6.0,  sgb2: 44.0, kinderarmut: 50.0, elderly: 15.0, vuln_fac: 3, heat_risk: 74.0 },
        CellSpec { id: "gallus",           name: "Gallus",           lat: 50.1050, lon: 8.6400, lst_delta: 2.9, versieg: 74.0, ndvi: 0.18, tree_cover: 10.0, sgb2: 30.0, kinderarmut: 36.0, elderly: 16.0, vuln_fac: 2, heat_risk: 64.0 },
        CellSpec { id: "altstadt",         name: "Altstadt",         lat: 50.1103, lon: 8.6820, lst_delta: 3.2, versieg: 80.0, ndvi: 0.10, tree_cover: 5.0,  sgb2: 18.0, kinderarmut: 20.0, elderly: 12.0, vuln_fac: 2, heat_risk: 68.0 },
        CellSpec { id: "innenstadt",       name: "Innenstadt",       lat: 50.1136, lon: 8.6796, lst_delta: 3.5, versieg: 83.0, ndvi: 0.09, tree_cover: 4.0,  sgb2: 14.0, kinderarmut: 16.0, elderly: 11.0, vuln_fac: 2, heat_risk: 70.0 },
        CellSpec { id: "bockenheim",       name: "Bockenheim",       lat: 50.1175, lon: 8.6484, lst_delta: 2.4, versieg: 70.0, ndvi: 0.22, tree_cover: 15.0, sgb2: 14.0, kinderarmut: 16.0, elderly: 14.0, vuln_fac: 2, heat_risk: 56.0 },
        CellSpec { id: "nordend-west",     name: "Nordend-West",     lat: 50.1286, lon: 8.6840, lst_delta: 2.2, versieg: 68.0, ndvi: 0.24, tree_cover: 18.0, sgb2: 10.0, kinderarmut: 11.0, elderly: 15.0, vuln_fac: 1, heat_risk: 50.0 },
        CellSpec { id: "schwanheim",       name: "Schwanheim",       lat: 50.0832, lon: 8.6028, lst_delta: 0.4, versieg: 38.0, ndvi: 0.55, tree_cover: 45.0, sgb2: 10.0, kinderarmut: 11.0, elderly: 18.0, vuln_fac: 1, heat_risk: 20.0 },
        CellSpec { id: "berkersheim",      name: "Berkersheim",      lat: 50.1541, lon: 8.7194, lst_delta: 0.2, versieg: 32.0, ndvi: 0.62, tree_cover: 55.0, sgb2:  7.0, kinderarmut:  8.0, elderly: 20.0, vuln_fac: 0, heat_risk: 16.0 },
    ];

    specs.iter().map(|s| make_cell(*s)).collect()
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Clone, Copy)]
struct CellSpec {
    id: &'static str,
    name: &'static str,
    lat: f64, lon: f64,
    lst_delta: f32,
    versieg: f32,
    ndvi: f32,
    tree_cover: f32,
    sgb2: f32,
    kinderarmut: f32,
    elderly: f32,
    vuln_fac: u32,
    heat_risk: f32,
}

fn make_cell(s: CellSpec) -> HeatIslandCell {
    let ndbi    = (s.versieg / 100.0 * 0.65 - 0.15).clamp(-0.2, 0.8);
    let cov     = (s.versieg / 100.0 * 0.85).clamp(0.1, 0.9);
    let height  = if s.versieg > 75.0 { 18.0 } else if s.versieg > 55.0 { 12.0 } else { 7.0_f32 };
    let far     = (s.versieg / 100.0 * 4.0).max(0.5);
    let svf     = (1.0 - s.versieg / 120.0).clamp(0.2, 1.0);
    let canopy  = s.tree_cover / 100.0;
    let solar   = (350.0 - s.tree_cover * 2.0 - (1.0 - s.versieg / 100.0) * 80.0).clamp(100.0, 350.0);
    let shade   = (canopy * 0.6 + (1.0 - s.versieg / 100.0) * 0.2).clamp(0.0, 0.90);

    let vuln_composite = crate::heat_islands::scoring::compute_vulnerability_composite(
        s.sgb2, s.kinderarmut, s.elderly, s.vuln_fac,
    );

    let physical = {
        let lst_n = ((s.lst_delta + 2.0) / 8.0).clamp(0.0, 1.0) * 100.0;
        (lst_n * 0.6 + s.versieg * 0.4).clamp(0.0, 100.0)
    };

    let recommended = pick_measures(s.versieg, s.ndvi, s.lst_delta);

    let mut cell = HeatIslandCell {
        id:   s.id.to_string(),
        name: s.name.to_string(),
        geometry: serde_json::json!({
            "type": "Point",
            "coordinates": [s.lon, s.lat]
        }),
        surface_temperature: SurfaceTemperature {
            lst_kelvin: 308.15 + s.lst_delta,
            delta_celsius: s.lst_delta,
            source: "Demo-Daten (synthetisch) — Basis: STADTTEILE index.html".to_string(),
            date: "2024-08-15".to_string(),
        },
        vegetation: VegetationIndex { ndvi: s.ndvi, ndbi, tree_cover_pct: s.tree_cover },
        imperviousness: Imperviousness {
            fraction_pct: s.versieg,
            source: "Demo-Daten (synthetisch)".to_string(),
        },
        building_density: BuildingDensity {
            coverage: cov, mean_height_m: height,
            floor_area_ratio: far, sky_view_factor: svf,
        },
        shadow_potential: ShadowPotential {
            shaded_fraction: shade, solar_radiation_wm2: solar, canopy_fraction: canopy,
        },
        cooling_potential: CoolingPotential {
            distance_to_green_m: (s.versieg * 6.0 - 100.0).max(0.0),
            distance_to_water_m: (s.versieg * 8.0 + 100.0).min(2000.0),
            cold_air_corridor_score: if s.versieg < 40.0 { 0.7 } else if s.versieg < 60.0 { 0.35 } else { 0.1 },
            sealable_area_m2: (s.versieg / 100.0 * 5000.0).max(0.0),
        },
        local_climate_zone: LocalClimateZone::OpenMidRise, // filled below
        vulnerability: VulnerabilityScore {
            sgb2_rate_pct: s.sgb2, child_poverty_pct: s.kinderarmut,
            elderly_pct: s.elderly, vulnerable_facilities: s.vuln_fac,
            composite: vuln_composite,
        },
        heat_burden: HeatBurden {
            physical,
            human_thermal: None,
            social_risk: (physical * vuln_composite / 100.0).clamp(0.0, 100.0),
            composite: physical,
        },
        heat_risk_score: s.heat_risk,
        recommended_measures: recommended,
    };

    cell.local_climate_zone = classify_lcz(&cell);
    cell
}

fn pick_measures(versieg: f32, ndvi: f32, lst_delta: f32) -> Vec<InterventionType> {
    let mut m = Vec::new();
    if versieg > 70.0 { m.push(InterventionType::StreetTrees); }
    if ndvi < 0.20    { m.push(InterventionType::PocketPark); }
    if lst_delta > 2.5 { m.push(InterventionType::BrightSurfaces); }
    if versieg > 60.0 { m.push(InterventionType::SpongeCity); }
    if m.is_empty()   { m.push(InterventionType::GreenRoof); }
    m
}
