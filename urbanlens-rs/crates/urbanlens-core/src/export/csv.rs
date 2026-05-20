//! Export HeatIslandCell data to CSV for QGIS, Excel or R.

use anyhow::Result;
use crate::heat_islands::data_model::HeatIslandCell;

/// Write cells as CSV (headers + rows).
///
/// Columns are a subset of the GeoJSON properties — chosen to be immediately
/// useful in QGIS attribute tables and Excel pivot tables.
pub fn cells_to_csv(cells: &[HeatIslandCell]) -> Result<String> {
    let mut out = String::new();

    // Header
    out.push_str("id,name,heat_risk_score,heat_risk_label,\
        lst_delta_celsius,suhi_class,\
        ndvi,ndbi,tree_cover_pct,ndvi_class,\
        versieg_pct,\
        lcz,lcz_nocturnal_delta,\
        sgb2_pct,kinderarmut_pct,vuln_score,\
        heat_burden,heat_burden_social,\
        dist_green_m,dist_water_m,\
        is_hotspot,is_coolspot,\
        data_source,data_date\n");

    for c in cells {
        out.push_str(&format!(
            "{},{},{:.1},{},{:.2},{},\
            {:.3},{:.3},{:.1},{},\
            {:.1},\
            \"{}\",{:.1},\
            {:.1},{:.1},{:.1},\
            {:.1},{:.1},\
            {:.0},{:.0},\
            {},{},\
            \"{}\",{}\n",
            c.id,
            c.name,
            c.heat_risk_score,
            c.risk_label(),
            c.surface_temperature.delta_celsius,
            c.surface_temperature.suhi_class(),
            c.vegetation.ndvi,
            c.vegetation.ndbi,
            c.vegetation.tree_cover_pct,
            c.vegetation.ndvi_class(),
            c.imperviousness.fraction_pct,
            c.local_climate_zone.label(),
            c.local_climate_zone.nocturnal_delta_celsius(),
            c.vulnerability.sgb2_rate_pct,
            c.vulnerability.child_poverty_pct,
            c.vulnerability.composite,
            c.heat_burden.composite,
            c.heat_burden.social_risk,
            c.cooling_potential.distance_to_green_m,
            c.cooling_potential.distance_to_water_m,
            c.is_hotspot(),
            c.is_coolspot(),
            c.surface_temperature.source.replace('"', "'"),
            c.surface_temperature.date,
        ));
    }

    Ok(out)
}

// ─────────────────────────────────────────────────────────────────────────────
// Green Space CSV export
// ─────────────────────────────────────────────────────────────────────────────

use crate::green_spaces::data_model::GreenSpaceObject;

/// Export green spaces to CSV (headers + rows).
pub fn green_spaces_to_csv(spaces: &[GreenSpaceObject]) -> Result<String> {
    let mut out = String::from(
        "id,name,type,area_m2,lat,lon,ndvi,tree_cover_pct,imperviousness_pct,\
        upgrade_priority_score,quality_label,green_coverage_score,tree_cover_score,\
        accessibility_score,cooling_potential_score,biodiversity_potential_score,\
        connectivity_score,is_priority\n",
    );
    for s in spaces {
        out.push_str(&format!(
            "{},{},{},{:.1},{:.6},{:.6},{:.3},{:.1},{:.1},{:.1},{},{:.1},{:.1},{:.1},{:.1},{:.1},{:.1},{}\n",
            s.id,
            s.name,
            s.space_type.label(),
            s.area_m2,
            s.lat,
            s.lon,
            s.ndvi,
            s.tree_cover_pct,
            s.imperviousness_pct,
            s.upgrade_priority_score,
            s.quality_label(),
            s.green_coverage_score,
            s.tree_cover_score,
            s.accessibility_score,
            s.cooling_potential_score,
            s.biodiversity_potential_score,
            s.connectivity_score,
            s.is_priority(),
        ));
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::demo;

    #[test]
    fn csv_has_header_and_rows() {
        let cells  = demo::build_frankfurt_demo();
        let csv    = cells_to_csv(&cells).unwrap();
        let lines: Vec<&str> = csv.lines().collect();
        assert_eq!(lines.len(), cells.len() + 1, "Expected header + n rows");
        assert!(lines[0].starts_with("id,name"));
    }

    #[test]
    fn csv_row_count_matches() {
        let cells = demo::build_frankfurt_demo();
        let csv   = cells_to_csv(&cells).unwrap();
        let data_rows = csv.lines().count() - 1; // minus header
        assert_eq!(data_rows, cells.len());
    }
}
