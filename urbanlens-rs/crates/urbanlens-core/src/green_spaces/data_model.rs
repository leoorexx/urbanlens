//! Domain types for the Green Space Registry Lens.
//!
//! Covers parks, urban forests, street trees, green roofs, and
//! potential transformation areas — all with scoring-ready attributes.

use serde::{Deserialize, Serialize};

// ─────────────────────────────────────────────────────────────────────────────
// Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GreenSpaceType {
    Park,
    UrbanForest,
    Allotment,
    Cemetery,
    SportsGreen,
    RiverbankGreen,
    StreetTree,
    GreenRoof,
    GreenFacade,
    PocketPark,
    GreenCorridor,
    PotentialArea,
    Grassland,
    WaterBody,
    ResidentialGreen,
}

impl GreenSpaceType {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Park             => "Park",
            Self::UrbanForest      => "Stadtwald",
            Self::Allotment        => "Kleingarten",
            Self::Cemetery         => "Friedhof",
            Self::SportsGreen      => "Sportgrünfläche",
            Self::RiverbankGreen   => "Ufergrün",
            Self::StreetTree       => "Straßenbaum",
            Self::GreenRoof        => "Dachbegrünung",
            Self::GreenFacade      => "Fassadenbegrünung",
            Self::PocketPark       => "Pocket Park",
            Self::GreenCorridor    => "Grünkorridor",
            Self::PotentialArea    => "Potenzialfläche",
            Self::Grassland        => "Grünland / Wiese",
            Self::WaterBody        => "Gewässer",
            Self::ResidentialGreen => "Wohnungsgrün",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            Self::Park             => "🌳",
            Self::UrbanForest      => "🌲",
            Self::Allotment        => "🥕",
            Self::Cemetery         => "🪦",
            Self::SportsGreen      => "⚽",
            Self::RiverbankGreen   => "🌊",
            Self::StreetTree       => "🌿",
            Self::GreenRoof        => "🏠",
            Self::GreenFacade      => "🧱",
            Self::PocketPark       => "🌱",
            Self::GreenCorridor    => "🔗",
            Self::PotentialArea    => "⬛",
            Self::Grassland        => "🌾",
            Self::WaterBody        => "💧",
            Self::ResidentialGreen => "🏘",
        }
    }

    /// Typical surface cooling effect at full coverage (°C), after Bowler et al. 2010.
    pub fn typical_cooling_celsius(&self) -> f32 {
        match self {
            Self::Park           => 1.5,
            Self::UrbanForest    => 2.5,
            Self::RiverbankGreen => 2.0,
            Self::WaterBody      => 2.0,
            Self::GreenRoof      => 0.8,
            Self::GreenFacade    => 0.5,
            Self::PocketPark     => 0.6,
            Self::GreenCorridor  => 1.0,
            Self::StreetTree     => 0.4,
            Self::Grassland      => 0.7,
            _                    => 0.3,
        }
    }

    /// Biodiversity base score (0–1) after IUCN Urban Biodiversity Guidelines.
    pub fn biodiversity_base(&self) -> f32 {
        match self {
            Self::UrbanForest    => 0.9,
            Self::Park           => 0.7,
            Self::RiverbankGreen => 0.85,
            Self::Grassland      => 0.75,
            Self::Cemetery       => 0.6,
            Self::GreenCorridor  => 0.8,
            Self::Allotment      => 0.6,
            Self::PocketPark     => 0.5,
            Self::SportsGreen    => 0.3,
            Self::GreenRoof      => 0.55,
            Self::WaterBody      => 0.8,
            _                    => 0.2,
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree catalogue types
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TreeAgeClass {
    Young,
    Mature,
    Old,
    Ancient,
}

impl TreeAgeClass {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Young   => "Jung (< 20 J)",
            Self::Mature  => "Reif (20–60 J)",
            Self::Old     => "Alt (60–100 J)",
            Self::Ancient => "Uralt (> 100 J)",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TreeCondition {
    Excellent,
    Good,
    Fair,
    Poor,
    Critical,
}

impl TreeCondition {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Excellent => "Sehr gut",
            Self::Good      => "Gut",
            Self::Fair      => "Mittel",
            Self::Poor      => "Schlecht",
            Self::Critical  => "Kritisch",
        }
    }

    /// Vitality factor (0–1) used in CO₂ and cooling estimates.
    pub fn vitality_factor(&self) -> f32 {
        match self {
            Self::Excellent => 1.0,
            Self::Good      => 0.85,
            Self::Fair      => 0.65,
            Self::Poor      => 0.35,
            Self::Critical  => 0.10,
        }
    }
}

/// A single tree entry from a municipal tree register (Baumkataster).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeObject {
    pub id: String,
    pub species: Option<String>,
    pub height_m: f32,
    pub crown_diameter_m: f32,
    pub trunk_circumference_cm: Option<f32>,
    pub age_class: TreeAgeClass,
    pub condition: TreeCondition,
    pub lat: f64,
    pub lon: f64,
    /// Projected shade area on the ground at solar noon (m²).
    pub shade_area_m2: f32,
    /// Estimated stored CO₂ (kg) — i-Tree Eco model.
    pub co2_stored_kg: f32,
    /// Cooling score 0–100 derived from condition × crown size.
    pub cooling_score: f32,
}

// ─────────────────────────────────────────────────────────────────────────────
// Interventions
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GreenIntervention {
    Desealing,
    PocketPark,
    TreePlanting,
    GreenRoof,
    GreenFacade,
    GreenCorridor,
    WaterFeature,
    WildflowerMeadow,
}

impl GreenIntervention {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Desealing       => "Entsiegelung",
            Self::PocketPark      => "Pocket Park anlegen",
            Self::TreePlanting    => "Straßenbäume pflanzen",
            Self::GreenRoof       => "Dachbegrünung",
            Self::GreenFacade     => "Fassadenbegrünung",
            Self::GreenCorridor   => "Grünkorridor anlegen",
            Self::WaterFeature    => "Wasserelement / Brunnen",
            Self::WildflowerMeadow => "Blühwiese anlegen",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            Self::Desealing        => "⛏",
            Self::PocketPark       => "🌱",
            Self::TreePlanting     => "🌳",
            Self::GreenRoof        => "🏠",
            Self::GreenFacade      => "🧱",
            Self::GreenCorridor    => "🔗",
            Self::WaterFeature     => "💧",
            Self::WildflowerMeadow => "🌸",
        }
    }

    /// Typical cost (EUR / m², or EUR / tree for TreePlanting).
    /// Sources: BBSR 2023, Kommunale Klimaanpassung Förderrichtlinie.
    pub fn typical_cost_eur_per_m2(&self) -> f32 {
        match self {
            Self::Desealing        => 35.0,
            Self::PocketPark       => 120.0,
            Self::TreePlanting     => 800.0, // per tree
            Self::GreenRoof        => 90.0,
            Self::GreenFacade      => 150.0,
            Self::GreenCorridor    => 60.0,
            Self::WaterFeature     => 2500.0,
            Self::WildflowerMeadow => 8.0,
        }
    }

    /// Fraction of cost that can be covered by public funding programmes.
    pub fn funding_pct(&self) -> f32 {
        match self {
            Self::GreenRoof        => 0.50,
            Self::Desealing        => 0.70,
            Self::TreePlanting     => 0.75,
            Self::GreenFacade      => 0.40,
            Self::PocketPark       => 0.60,
            Self::GreenCorridor    => 0.55,
            _                      => 0.30,
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Feasibility
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Feasibility {
    High,
    Medium,
    Low,
    RequiresFurtherStudy,
}

impl Feasibility {
    pub fn label(&self) -> &'static str {
        match self {
            Self::High                 => "Hoch",
            Self::Medium               => "Mittel",
            Self::Low                  => "Gering",
            Self::RequiresFurtherStudy => "Weitere Prüfung",
        }
    }

    pub fn factor(&self) -> f32 {
        match self {
            Self::High                 => 1.0,
            Self::Medium               => 0.7,
            Self::Low                  => 0.4,
            Self::RequiresFurtherStudy => 0.2,
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Potential transformation areas
// ─────────────────────────────────────────────────────────────────────────────

/// A candidate site identified for green space creation or upgrade.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PotentialArea {
    pub id: String,
    pub name: String,
    pub area_m2: f32,
    pub current_type: String,
    pub intervention: GreenIntervention,
    pub feasibility: Feasibility,
    pub estimated_cooling_celsius: f32,
    pub estimated_co2_sequestration_kg_yr: f32,
    pub priority_score: f32,
    pub rationale: String,
    pub geometry: Option<serde_json::Value>,
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary analysis object
// ─────────────────────────────────────────────────────────────────────────────

/// The primary analysis unit — one green space polygon or point.
///
/// All sub-scores are *deficit* or *priority* oriented: higher values mean
/// greater need for upgrade, matching the pattern of `heat_risk_score`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GreenSpaceObject {
    pub id: String,
    pub name: String,
    pub space_type: GreenSpaceType,
    /// Area of the green space (m²).
    pub area_m2: f32,
    pub lat: f64,
    pub lon: f64,
    /// GeoJSON geometry (Point / Polygon / MultiPolygon).
    pub geometry: Option<serde_json::Value>,

    // ── Physical indicators ──────────────────────────────────────────────────
    /// Sentinel-2 NDVI (−1 … +1).
    pub ndvi: f32,
    /// Copernicus Tree Cover Density (0–100 %).
    pub tree_cover_pct: f32,
    /// Copernicus HRL Imperviousness (0–100 %).
    pub imperviousness_pct: f32,
    /// Distance to the nearest other green space (m).
    pub distance_to_nearest_green_m: f32,
    /// Distance to the nearest water body (m).
    pub distance_to_water_m: f32,

    // ── Social context ───────────────────────────────────────────────────────
    pub population_within_300m: u32,
    pub vulnerable_facilities_within_500m: u32,

    // ── Spatial network ──────────────────────────────────────────────────────
    /// Fraction of green area within 500 m (0–1).
    pub connectivity_index: f32,

    // ── Sub-scores (0–100, higher = higher upgrade priority) ─────────────────
    pub green_coverage_score: f32,
    pub tree_cover_score: f32,
    pub accessibility_score: f32,
    pub cooling_potential_score: f32,
    pub biodiversity_potential_score: f32,
    pub connectivity_score: f32,

    // ── Composite ────────────────────────────────────────────────────────────
    /// Composite upgrade priority score 0–100.
    pub upgrade_priority_score: f32,

    pub recommended_interventions: Vec<GreenIntervention>,

    /// Mandatory uncertainty disclaimer.
    pub methodology_note: &'static str,
}

impl GreenSpaceObject {
    /// True if this space needs urgent upgrade action (score ≥ 65).
    pub fn is_priority(&self) -> bool {
        self.upgrade_priority_score >= 65.0
    }

    /// True if this space is already of high quality (score < 30).
    pub fn is_high_quality(&self) -> bool {
        self.upgrade_priority_score < 30.0
    }

    pub fn quality_label(&self) -> &'static str {
        crate::green_spaces::scoring::quality_label(self.upgrade_priority_score)
    }

    pub fn quality_color(&self) -> &'static str {
        crate::green_spaces::scoring::quality_color(self.upgrade_priority_score)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario output types
// ─────────────────────────────────────────────────────────────────────────────

/// A single ranked intervention in a green scenario result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankedGreenIntervention {
    pub intervention: GreenIntervention,
    pub priority_score: f32,
    pub estimated_cooling_celsius: f32,
    pub estimated_area_m2: f32,
    pub estimated_cost_eur: f32,
    pub funding_available_eur: f32,
    pub applicability: f32,
    pub rationale: String,
}

/// Output of the Green Best-Scenario analysis for one green space.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GreenScenarioResult {
    pub object_id: String,
    pub object_name: String,
    pub current_priority_score: f32,
    pub projected_priority_score: f32,
    pub estimated_cooling_celsius: f32,
    pub estimated_co2_sequestration_kg_yr: f32,
    pub estimated_risk_reduction_pct: f32,
    pub ranked_interventions: Vec<RankedGreenIntervention>,
    pub potential_areas: Vec<PotentialArea>,
    pub rationale: String,
    pub methodology_note: &'static str,
}

// ─────────────────────────────────────────────────────────────────────────────
// Input record (JSON → GreenSpaceObject conversion)
// ─────────────────────────────────────────────────────────────────────────────

/// Flat input record for WASM / API ingestion.
/// Call `into_object()` to compute all sub-scores.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GreenSpaceRecord {
    pub id: String,
    pub name: String,
    pub space_type: String,
    pub area_m2: f32,
    pub lat: f64,
    pub lon: f64,
    pub ndvi: f32,
    pub tree_cover_pct: f32,
    pub imperviousness_pct: f32,
    pub distance_to_nearest_green_m: f32,
    pub distance_to_water_m: f32,
    pub population_within_300m: u32,
    pub vulnerable_facilities_within_500m: u32,
    pub connectivity_index: f32,
    pub geometry: Option<serde_json::Value>,
}

impl GreenSpaceRecord {
    /// Compute all scores and produce a `GreenSpaceObject`.
    pub fn into_object(
        self,
    ) -> Result<GreenSpaceObject, crate::green_spaces::scoring::GreenScoringError> {
        use crate::green_spaces::scoring::*;

        let space_type = match self.space_type.as_str() {
            "Park" | "park"                           => GreenSpaceType::Park,
            "UrbanForest" | "urban_forest"            => GreenSpaceType::UrbanForest,
            "Allotment" | "allotment"                 => GreenSpaceType::Allotment,
            "Cemetery" | "cemetery"                   => GreenSpaceType::Cemetery,
            "SportsGreen" | "sports_green"            => GreenSpaceType::SportsGreen,
            "RiverbankGreen" | "riverbank_green"      => GreenSpaceType::RiverbankGreen,
            "StreetTree" | "street_tree"              => GreenSpaceType::StreetTree,
            "GreenRoof" | "green_roof"                => GreenSpaceType::GreenRoof,
            "GreenFacade" | "green_facade"            => GreenSpaceType::GreenFacade,
            "PocketPark" | "pocket_park"              => GreenSpaceType::PocketPark,
            "GreenCorridor" | "green_corridor"        => GreenSpaceType::GreenCorridor,
            "Grassland" | "grassland"                 => GreenSpaceType::Grassland,
            "WaterBody" | "water_body"                => GreenSpaceType::WaterBody,
            "ResidentialGreen" | "residential_green"  => GreenSpaceType::ResidentialGreen,
            _                                         => GreenSpaceType::PotentialArea,
        };

        let weights = GreenWeights::default();
        let green_coverage_score = score_green_coverage(self.area_m2, self.population_within_300m)?;
        let tree_cover_score = score_tree_cover(self.tree_cover_pct, self.ndvi)?;
        let accessibility_score =
            score_accessibility(self.distance_to_nearest_green_m, self.vulnerable_facilities_within_500m)?;
        let cooling_potential_score = score_cooling_potential(
            self.area_m2,
            self.tree_cover_pct,
            self.imperviousness_pct,
            self.distance_to_water_m,
            &space_type,
        )?;
        let biodiversity_potential_score =
            score_biodiversity_potential(self.ndvi, self.area_m2, &space_type, self.connectivity_index)?;
        let connectivity_score =
            score_connectivity(self.connectivity_index, self.distance_to_nearest_green_m)?;
        let upgrade_priority_score = compute_upgrade_priority(
            green_coverage_score,
            tree_cover_score,
            accessibility_score,
            cooling_potential_score,
            biodiversity_potential_score,
            connectivity_score,
            &weights,
        )?;

        let mut obj = GreenSpaceObject {
            id: self.id,
            name: self.name,
            space_type,
            area_m2: self.area_m2,
            lat: self.lat,
            lon: self.lon,
            geometry: self.geometry,
            ndvi: self.ndvi,
            tree_cover_pct: self.tree_cover_pct,
            imperviousness_pct: self.imperviousness_pct,
            distance_to_nearest_green_m: self.distance_to_nearest_green_m,
            distance_to_water_m: self.distance_to_water_m,
            population_within_300m: self.population_within_300m,
            vulnerable_facilities_within_500m: self.vulnerable_facilities_within_500m,
            connectivity_index: self.connectivity_index,
            green_coverage_score,
            tree_cover_score,
            accessibility_score,
            cooling_potential_score,
            biodiversity_potential_score,
            connectivity_score,
            upgrade_priority_score,
            recommended_interventions: vec![],
            methodology_note: "⚠ Modellschätzung — keine lokalen Messdaten.",
        };
        obj.recommended_interventions = recommend_interventions(&obj);
        Ok(obj)
    }
}
