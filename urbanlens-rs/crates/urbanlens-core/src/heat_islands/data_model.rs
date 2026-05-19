//! Domain types for urban heat-island analysis.
//!
//! Every physical measurement carries its source and date so that
//! provenance is always traceable from score back to satellite scene.

use serde::{Deserialize, Serialize};

// ─────────────────────────────────────────────────────────────────────────────
// Satellite / remote-sensing measurements
// ─────────────────────────────────────────────────────────────────────────────

/// Land Surface Temperature derived from Landsat 8/9 TIR bands (Band 10 + 11).
///
/// **Important:** LST ≠ air temperature at screen height (2 m).
/// Human thermal comfort requires PET or UTCI combining air temp, humidity,
/// wind and radiation (VDI 3787 Bl. 2 / ISO 14091).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurfaceTemperature {
    /// Absolute LST in Kelvin (split-window algorithm, emissivity-corrected)
    pub lst_kelvin: f32,
    /// Delta vs. suburban reference pixel — SUHI intensity (°C)
    /// Positive = warmer than reference suburb (heat island).
    pub delta_celsius: f32,
    /// Data source description
    pub source: String,
    /// ISO-8601 acquisition date of the satellite scene
    pub date: String,
}

impl SurfaceTemperature {
    /// Convert absolute LST to Celsius.
    #[inline]
    pub fn celsius(&self) -> f32 {
        self.lst_kelvin - 273.15
    }

    /// Classify SUHI intensity per Copernicus CURE methodology.
    pub fn suhi_class(&self) -> &'static str {
        match self.delta_celsius {
            d if d < 0.0 => "Kühl (Kaltspot)",
            d if d < 1.0 => "Normal",
            d if d < 2.0 => "Leicht erhöht",
            d if d < 3.5 => "Hitzeinsel",
            _             => "Kritische Hitzeinsel",
        }
    }
}

/// Vegetation and built-up indices from Sentinel-2 MSI (10 m resolution).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VegetationIndex {
    /// Normalized Difference Vegetation Index — B8 (NIR) and B4 (Red).
    /// Range −1 … +1; healthy vegetation > 0.4, urban surfaces < 0.2.
    pub ndvi: f32,
    /// Normalized Difference Built-up Index — B11 (SWIR1) and B8 (NIR).
    /// Positive values indicate sealed / built-up surfaces.
    pub ndbi: f32,
    /// Copernicus Tree Cover Density (0–100 %)
    pub tree_cover_pct: f32,
}

impl VegetationIndex {
    /// Vegetation health classification (qualitative).
    pub fn ndvi_class(&self) -> &'static str {
        match self.ndvi {
            v if v < 0.1 => "Keine Vegetation / versiegelt",
            v if v < 0.2 => "Sehr spärliche Vegetation",
            v if v < 0.35 => "Geringe Vegetationsdichte",
            v if v < 0.5 => "Moderate Vegetation",
            _             => "Dichte, gesunde Vegetation",
        }
    }
}

/// Imperviousness from Copernicus High Resolution Layer (HRL, 20 m).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Imperviousness {
    /// Sealed-surface fraction in percent (0–100).
    pub fraction_pct: f32,
    /// Data source
    pub source: String,
}

/// Building morphology derived from OSM + communal building-height data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildingDensity {
    /// Fraction of ground area covered by buildings (0–1).
    pub coverage: f32,
    /// Population-weighted mean building height (m).
    pub mean_height_m: f32,
    /// Floor-Area Ratio (total floor area / plot area).
    pub floor_area_ratio: f32,
    /// Sky View Factor: fraction of sky hemisphere visible from street level
    /// (0 = fully enclosed canyon, 1 = open field).
    pub sky_view_factor: f32,
}

/// Shadow and solar radiation at street level.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShadowPotential {
    /// Fraction of street surface area receiving ≥ 2 h shade during 12–15 h (peak heat).
    pub shaded_fraction: f32,
    /// Mean daily global solar radiation (W m⁻²).
    pub solar_radiation_wm2: f32,
    /// Tree canopy cover fraction (0–1).
    pub canopy_fraction: f32,
}

/// Distance-based cooling potential.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoolingPotential {
    /// Distance to nearest public green space ≥ 0.5 ha (m).
    /// Cooling effect detectable up to ~300 m (Aram et al. 2019).
    pub distance_to_green_m: f32,
    /// Distance to nearest water body / waterway (m).
    pub distance_to_water_m: f32,
    /// Connectivity to cold-air corridor from surrounding landscape (0–1).
    /// 0 = no corridor connection, 1 = direct, unobstructed.
    pub cold_air_corridor_score: f32,
    /// Estimated sealable area eligible for unsealing (m²).
    pub sealable_area_m2: f32,
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived / composite scores
// ─────────────────────────────────────────────────────────────────────────────

/// Local Climate Zone classification (Stewart & Oke 2012).
/// Describes the urban structure type which controls nocturnal heat retention.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum LocalClimateZone {
    /// LCZ 1 — Compact high-rise (≥ 25 m, coverage ≥ 40 %)
    CompactHighRise,
    /// LCZ 2 — Compact mid-rise (10–25 m)
    CompactMidRise,
    /// LCZ 3 — Compact low-rise (< 10 m, coverage ≥ 40 %)
    CompactLowRise,
    /// LCZ 4 — Open high-rise (≥ 25 m, coverage < 40 %)
    OpenHighRise,
    /// LCZ 5 — Open mid-rise
    OpenMidRise,
    /// LCZ 6 — Open low-rise
    OpenLowRise,
    /// LCZ 8 — Large low-rise (big-box retail, industrial)
    LargeLowRise,
    /// LCZ 9 — Sparsely built (< 20 % coverage)
    SparselyBuilt,
    /// LCZ D — Low plants (agricultural / suburban green)
    LowPlants,
    /// LCZ E — Bare rock / paved (airports, plazas)
    BarePaved,
    /// LCZ G — Water
    Water,
}

impl LocalClimateZone {
    pub fn label(&self) -> &'static str {
        match self {
            Self::CompactHighRise => "LCZ 1 · Dichte Hochhausbebauung",
            Self::CompactMidRise  => "LCZ 2 · Dichte mittlere Bebauung",
            Self::CompactLowRise  => "LCZ 3 · Dichte Niedrigbebauung",
            Self::OpenHighRise    => "LCZ 4 · Offene Hochhausbebauung",
            Self::OpenMidRise     => "LCZ 5 · Offene mittlere Bebauung",
            Self::OpenLowRise     => "LCZ 6 · Offene Niedrigbebauung",
            Self::LargeLowRise    => "LCZ 8 · Großflächige Niedrigbebauung",
            Self::SparselyBuilt   => "LCZ 9 · Lockere Bebauung",
            Self::LowPlants       => "LCZ D · Niedrige Vegetation",
            Self::BarePaved       => "LCZ E · Versiegelt / Freifläche",
            Self::Water           => "LCZ G · Gewässer",
        }
    }

    /// Typical nocturnal heat retention offset vs. rural reference (°C).
    /// Based on Stewart & Oke 2012, Table 3.
    pub fn nocturnal_delta_celsius(&self) -> f32 {
        match self {
            Self::CompactHighRise => 7.0,
            Self::CompactMidRise  => 6.0,
            Self::CompactLowRise  => 5.0,
            Self::OpenHighRise    => 4.5,
            Self::OpenMidRise     => 3.5,
            Self::OpenLowRise     => 2.5,
            Self::LargeLowRise    => 3.0,
            Self::SparselyBuilt   => 1.5,
            Self::LowPlants       => 0.5,
            Self::BarePaved       => 2.0,
            Self::Water           => -0.5,
        }
    }
}

/// Social vulnerability of the affected population.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VulnerabilityScore {
    /// SGB-II social-welfare rate (% of population) — Bundesagentur für Arbeit.
    pub sgb2_rate_pct: f32,
    /// Child poverty rate (% of children in households below poverty threshold).
    pub child_poverty_pct: f32,
    /// Elderly population fraction (≥ 65 years, %).
    pub elderly_pct: f32,
    /// Count of vulnerable facilities (hospitals, care homes, kindergartens, schools).
    pub vulnerable_facilities: u32,
    /// Composite vulnerability score 0–100 (higher = more vulnerable).
    pub composite: f32,
}

/// Combined heat burden (LST + structure + social amplification).
///
/// **Methodological note:** This is a *proxy indicator*, not a validated
/// human-biometeorological index. For planning purposes use PET / UTCI
/// (VDI 3787 Bl. 2) derived from in-situ measurements or ENVI-met simulation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeatBurden {
    /// Physical heat exposure (LST + sealing) 0–100.
    pub physical: f32,
    /// Human thermal component (adds shade, wind, humidity corrections) 0–100.
    /// Only meaningful if micro-meteorological data is available.
    pub human_thermal: Option<f32>,
    /// Social risk amplification = physical × vulnerability / 100.
    pub social_risk: f32,
    /// Composite index 0–100.
    pub composite: f32,
}

// ─────────────────────────────────────────────────────────────────────────────
// Intervention / Scenario types
// ─────────────────────────────────────────────────────────────────────────────

/// Cooling interventions that can be applied in scenario analysis.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum InterventionType {
    /// 🌳 Straßenbäume pflanzen
    StreetTrees,
    /// 🪨 Entsiegelung von Flächen
    Unsealing,
    /// 🌿 Pocket Park anlegen
    PocketPark,
    /// 🏠 Dachbegrünung
    GreenRoof,
    /// 🌱 Fassadenbegrünung
    FacadeGreening,
    /// ⬜ Helle Oberflächen / hohe Albedo
    BrightSurfaces,
    /// ☂ Verschattungselemente (Pergola, Sonnensegel)
    ShadeStructures,
    /// 💧 Wasserflächen / Trinkbrunnen / Sprühnebler
    WaterFeatures,
    /// 🧽 Schwammstadt-Elemente (Rigolen, Zisternen)
    SpongeCity,
    /// 💨 Kaltluftkorridor freihalten / reaktivieren
    ColdAirCorridor,
}

impl InterventionType {
    pub fn label(&self) -> &'static str {
        match self {
            Self::StreetTrees     => "Straßenbäume pflanzen",
            Self::Unsealing       => "Entsiegelung",
            Self::PocketPark      => "Pocket Park",
            Self::GreenRoof       => "Dachbegrünung",
            Self::FacadeGreening  => "Fassadenbegrünung",
            Self::BrightSurfaces  => "Helle Oberflächen",
            Self::ShadeStructures => "Verschattungselemente",
            Self::WaterFeatures   => "Wasserflächen / Trinkbrunnen",
            Self::SpongeCity      => "Schwammstadt-Elemente",
            Self::ColdAirCorridor => "Kaltluftkorridor aktivieren",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            Self::StreetTrees     => "🌳",
            Self::Unsealing       => "🪨",
            Self::PocketPark      => "🌿",
            Self::GreenRoof       => "🏠",
            Self::FacadeGreening  => "🌱",
            Self::BrightSurfaces  => "⬜",
            Self::ShadeStructures => "☂",
            Self::WaterFeatures   => "💧",
            Self::SpongeCity      => "🧽",
            Self::ColdAirCorridor => "💨",
        }
    }

    /// Cost estimate in EUR from UrbanLens MASS data and literature.
    pub fn typical_cost_eur(&self) -> Option<u32> {
        match self {
            Self::StreetTrees     => Some(150_000),   // 50 trees @ 3k€
            Self::Unsealing       => Some(200_000),   // 2000 m² @ 100 €/m²
            Self::PocketPark      => Some(350_000),   // small park
            Self::GreenRoof       => Some(120_000),   // 1000 m² @ 120 €/m²
            Self::FacadeGreening  => Some(80_000),    // 500 m² @ 160 €/m²
            Self::BrightSurfaces  => Some(60_000),    // repaint + material
            Self::ShadeStructures => Some(90_000),    // pergola structures
            Self::WaterFeatures   => Some(200_000),   // fountains + infrastructure
            Self::SpongeCity      => Some(200_000),   // retention elements
            Self::ColdAirCorridor => None,            // planning cost varies
        }
    }
}

/// A specific scenario configuration to evaluate.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterventionScenario {
    pub id: String,
    pub name: String,
    /// Interventions included in this scenario.
    pub interventions: Vec<InterventionType>,
    /// Fraction of eligible area covered by each intervention (0–1).
    pub coverage: f32,
}

/// A single ranked intervention recommendation with estimated effects.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankedIntervention {
    pub intervention: InterventionType,
    /// Combined priority score 0–100.
    pub priority_score: f32,
    /// Estimated LST reduction (°C) for this cell — **model assumption**.
    pub estimated_cooling_celsius: f32,
    /// Applicability factor for this specific district (0–1).
    pub applicability: f32,
    /// Human-readable rationale.
    pub rationale: String,
}

/// Output of the Best-Scenario analysis for one district.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BestScenarioResult {
    pub district_id: String,
    pub district_name: String,
    /// All interventions, sorted by priority (descending).
    pub ranked_interventions: Vec<RankedIntervention>,
    /// Combined LST reduction from top-3 interventions (°C) — model assumption.
    pub estimated_lst_reduction_celsius: f32,
    /// Estimated relative reduction of heat risk score (%).
    pub estimated_risk_reduction_pct: f32,
    /// Projected heat risk score after interventions.
    pub projected_heat_risk_score: f32,
    /// Current heat risk score (for comparison).
    pub current_heat_risk_score: f32,
    /// Summary rationale.
    pub rationale: String,
    /// Mandatory uncertainty disclaimer.
    pub methodology_note: &'static str,
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary analysis cell
// ─────────────────────────────────────────────────────────────────────────────

/// The primary analysis unit — one district, grid cell, or street segment.
///
/// All physical measurements and derived scores are kept together so that
/// every number is traceable back to its source.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeatIslandCell {
    pub id: String,
    pub name: String,
    /// GeoJSON geometry (Polygon or MultiPolygon for districts).
    pub geometry: serde_json::Value,

    // ── Physical measurements ──────────────────────────────────────────────
    pub surface_temperature: SurfaceTemperature,
    pub vegetation: VegetationIndex,
    pub imperviousness: Imperviousness,
    pub building_density: BuildingDensity,
    pub shadow_potential: ShadowPotential,
    pub cooling_potential: CoolingPotential,

    // ── Derived classifications ────────────────────────────────────────────
    pub local_climate_zone: LocalClimateZone,
    pub vulnerability: VulnerabilityScore,
    pub heat_burden: HeatBurden,

    // ── Composite score ───────────────────────────────────────────────────
    /// Heat Risk Score 0–100.  Computed by `scoring::compute_heat_risk_score`.
    pub heat_risk_score: f32,

    /// Top recommended interventions (may be empty before scenario analysis).
    pub recommended_measures: Vec<InterventionType>,
}

impl HeatIslandCell {
    /// Human-readable risk label.
    pub fn risk_label(&self) -> &'static str {
        crate::heat_islands::scoring::heat_risk_label(self.heat_risk_score)
    }

    /// Hex colour for map rendering.
    pub fn risk_color(&self) -> &'static str {
        crate::heat_islands::scoring::heat_risk_color(self.heat_risk_score)
    }

    /// True if this cell qualifies as a hotspot (score ≥ 65).
    pub fn is_hotspot(&self) -> bool {
        self.heat_risk_score >= 65.0
    }

    /// True if this cell is a confirmed cool island (score < 30).
    pub fn is_coolspot(&self) -> bool {
        self.heat_risk_score < 30.0
    }
}
