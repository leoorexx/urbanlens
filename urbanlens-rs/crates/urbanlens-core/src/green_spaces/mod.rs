//! Green Space Registry Lens — parallel module to `heat_islands`.
//!
//! Provides domain types, scoring functions, scenario analysis, and
//! geospatial utilities for urban green space quality assessment.
//!
//! ## Architecture
//! ```text
//! green_spaces/
//! ├── data_model   — GreenSpaceObject, TreeObject, PotentialArea, …
//! ├── scoring      — 6 scoring functions + composite upgrade_priority_score
//! ├── scenario     — Green Best-Scenario algorithm + ranked interventions
//! ├── geospatial   — haversine distance, spatial context, corridor detection
//! └── demo         — 14 synthetic Frankfurt green spaces for immediate testing
//! ```
//!
//! ## Sources
//! EEA 2021 · WHO EURO 2016 · Bowler et al. 2010 · UBA 2021 · BBSR 2023 ·
//! i-Tree Eco · Copernicus HRL/TCD · Stewart & Oke 2012

pub mod data_model;
pub mod scoring;
pub mod scenario;
pub mod geospatial;
pub mod demo;
