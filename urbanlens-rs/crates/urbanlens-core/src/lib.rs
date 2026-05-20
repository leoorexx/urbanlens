//! # urbanlens-core
//!
//! Core computation library for UrbanLens urban heat-island analysis.
//!
//! ## Architecture
//! ```text
//! urbanlens-core
//! ├── heat_islands/
//! │   ├── data_model   — all domain types (HeatIslandCell, LST, NDVI, …)
//! │   ├── scoring      — composite Heat Risk Score calculation
//! │   ├── scenario     — Best-Scenario algorithm + intervention ranking
//! │   └── geospatial   — spatial index, proximity queries, GeoJSON I/O
//! ├── export/
//! │   ├── geojson      — serialize cells → FeatureCollection
//! │   └── csv          — tabular export for spreadsheets / QGIS
//! └── demo             — synthetic Frankfurt dataset for immediate testing
//! ```
//!
//! ## Integration with UrbanLens frontend
//! This crate compiles to:
//! - **Native binary** via `urbanlens-cli` (replaces / augments Python generate_layers.py)
//! - **WebAssembly** via `urbanlens-wasm` (real-time scoring in the browser, called from
//!   index.html / map3d.html JavaScript)

pub mod heat_islands;
pub mod green_spaces;
pub mod export;
pub mod demo;

// Re-export most-used types at crate root for convenience
pub use heat_islands::data_model::{
    HeatIslandCell, SurfaceTemperature, VegetationIndex, Imperviousness,
    BuildingDensity, ShadowPotential, CoolingPotential, VulnerabilityScore,
    HeatBurden, LocalClimateZone, InterventionType, BestScenarioResult,
};
pub use heat_islands::scoring::{compute_heat_risk_score, HeatRiskWeights};
pub use heat_islands::scenario::compute_best_scenario;
