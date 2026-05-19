//! urbanlens-cli — Heat Island data processor.
//!
//! # Usage
//! ```
//! # Generate enriched GeoJSON from demo data
//! urbanlens score --output data/layers/heat_risk_ffm.geojson
//!
//! # Compute best scenarios and append to existing GeoJSON
//! urbanlens scenario --output data/layers/heat_scenario_ffm.geojson
//!
//! # Export to CSV for QGIS / Excel
//! urbanlens csv --output heat_risk_ffm.csv
//!
//! # Print summary table to stdout
//! urbanlens summary
//! ```
//!
//! # Integration with existing pipeline
//! This binary is the Rust analogue of `generate_layers.py`.  Run it after
//! the Python script has fetched OSM/Overpass data and produced the base layers
//! to add the satellite-derived scoring on top.

use anyhow::Result;
use clap::{Parser, Subcommand};
use std::path::PathBuf;

use urbanlens_core::demo::build_frankfurt_demo;
use urbanlens_core::export::{csv::cells_to_csv, geojson::cells_to_geojson};
use urbanlens_core::heat_islands::scoring::HeatRiskWeights;
use urbanlens_core::heat_islands::scenario::compute_best_scenario;
use urbanlens_core::heat_islands::data_model::HeatIslandCell;

// ─────────────────────────────────────────────────────────────────────────────
// CLI definition (clap derive)
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Parser)]
#[command(
    name  = "urbanlens",
    about = "UrbanLens heat-island scoring and scenario CLI",
    version,
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Compute Heat Risk Scores and write enriched GeoJSON
    Score {
        #[arg(short, long, default_value = "heat_risk_ffm.geojson")]
        output: PathBuf,
    },
    /// Run Best-Scenario analysis and write GeoJSON with scenario results
    Scenario {
        #[arg(short, long, default_value = "heat_scenario_ffm.geojson")]
        output: PathBuf,
    },
    /// Export to CSV (for QGIS / Excel)
    Csv {
        #[arg(short, long, default_value = "heat_risk_ffm.csv")]
        output: PathBuf,
    },
    /// Print a score summary table to stdout
    Summary,
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

fn main() -> Result<()> {
    let cli = Cli::parse();

    eprintln!("🌡️  UrbanLens Heat Island Processor");
    eprintln!("    Methodology: VDI 3787 Bl.1 · LCZ (Stewart & Oke 2012) · Copernicus SUHI");
    eprintln!("    ⚠  Demo mode: synthetic Frankfurt dataset (real satellite data requires");
    eprintln!("       Landsat 8/9 TIR preprocessing via USGS EarthExplorer)");
    eprintln!();

    let cells = build_frankfurt_demo();
    eprintln!("✓ Loaded {} districts", cells.len());

    match cli.command {
        Commands::Score { output } => {
            let json = cells_to_geojson(&cells)?;
            std::fs::write(&output, json)?;
            eprintln!("✓ GeoJSON written to {}", output.display());
            print_summary(&cells);
        }
        Commands::Scenario { output } => {
            // Build scenario-enriched GeoJSON
            let mut features: Vec<serde_json::Value> = Vec::new();
            for cell in &cells {
                let scenario = compute_best_scenario(cell)?;
                features.push(cell_to_scenario_feature(cell, &scenario));
            }
            let fc = serde_json::json!({
                "type": "FeatureCollection",
                "features": features,
            });
            std::fs::write(&output, serde_json::to_string_pretty(&fc)?)?;
            eprintln!("✓ Scenario GeoJSON written to {}", output.display());
            print_scenario_summary(&cells)?;
        }
        Commands::Csv { output } => {
            let csv = cells_to_csv(&cells)?;
            std::fs::write(&output, csv)?;
            eprintln!("✓ CSV written to {}", output.display());
        }
        Commands::Summary => {
            print_summary(&cells);
        }
    }

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

fn print_summary(cells: &[HeatIslandCell]) {
    println!("\n{:<22} {:>6}  {:>8}  {:>7}  {:<28}",
        "Stadtteil", "Score", "LST-Δ°C", "Versieg%", "Label");
    println!("{}", "─".repeat(76));
    let mut sorted = cells.to_vec();
    sorted.sort_by(|a, b| b.heat_risk_score.partial_cmp(&a.heat_risk_score).unwrap());
    for c in &sorted {
        println!("{:<22} {:>6.1}  {:>8.1}  {:>7.0}  {:<28}",
            c.name,
            c.heat_risk_score,
            c.surface_temperature.delta_celsius,
            c.imperviousness.fraction_pct,
            c.risk_label(),
        );
    }
    println!();

    let hotspots = cells.iter().filter(|c| c.is_hotspot()).count();
    let coolspots = cells.iter().filter(|c| c.is_coolspot()).count();
    println!("🔴 Hotspots (Score ≥ 65): {hotspots}");
    println!("🟢 Coolspots (Score < 30): {coolspots}");
    println!();
    println!("⚠  Alle Werte sind Modellschätzungen (synthetischer Datensatz).");
    println!("   LST ≠ Lufttemperatur auf Augenhöhe (VDI 3787 Bl. 1).");
}

fn print_scenario_summary(cells: &[HeatIslandCell]) -> Result<()> {
    println!("\n{:<22} {:>6}  {:>8}  {:>8}  {:<28}",
        "Stadtteil", "Aktuell", "Projiziert", "Redukt%", "Top-1 Maßnahme");
    println!("{}", "─".repeat(80));
    let mut sorted = cells.to_vec();
    sorted.sort_by(|a, b| b.heat_risk_score.partial_cmp(&a.heat_risk_score).unwrap());
    for c in &sorted {
        let sc = compute_best_scenario(c)?;
        let top1 = sc.ranked_interventions.first()
            .map(|r| format!("{} {}", r.intervention.emoji(), r.intervention.label()))
            .unwrap_or_default();
        println!("{:<22} {:>6.1}  {:>9.1}  {:>7.0}%  {:<28}",
            c.name,
            sc.current_heat_risk_score,
            sc.projected_heat_risk_score,
            sc.estimated_risk_reduction_pct,
            top1,
        );
    }
    Ok(())
}

fn cell_to_scenario_feature(
    cell: &HeatIslandCell,
    sc: &urbanlens_core::heat_islands::data_model::BestScenarioResult,
) -> serde_json::Value {
    let top3: Vec<serde_json::Value> = sc.ranked_interventions.iter().take(3).map(|r| {
        serde_json::json!({
            "label": format!("{} {}", r.intervention.emoji(), r.intervention.label()),
            "priority": r.priority_score,
            "cooling_celsius": r.estimated_cooling_celsius,
            "rationale": r.rationale,
        })
    }).collect();

    serde_json::json!({
        "type": "Feature",
        "geometry": cell.geometry,
        "properties": {
            "id":   cell.id,
            "name": cell.name,
            "heat_risk_score":            cell.heat_risk_score,
            "heat_risk_label":            cell.risk_label(),
            "projected_heat_risk_score":  sc.projected_heat_risk_score,
            "estimated_lst_reduction":    sc.estimated_lst_reduction_celsius,
            "estimated_risk_reduction_pct": sc.estimated_risk_reduction_pct,
            "top_interventions":          top3,
            "rationale":                  sc.rationale,
            "methodology_note":           sc.methodology_note,
            // Passthrough fields for map rendering
            "lst_delta":  cell.surface_temperature.delta_celsius,
            "versieg":    cell.imperviousness.fraction_pct,
            "ndvi":       cell.vegetation.ndvi,
            "vuln_score": cell.vulnerability.composite,
        }
    })
}
