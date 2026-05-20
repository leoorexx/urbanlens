//! Geospatial utilities for the Green Space Registry Lens.
//!
//! Provides Haversine distance calculation, spatial context derivation,
//! and green corridor detection between green space objects.

use super::data_model::GreenSpaceObject;

// ─────────────────────────────────────────────────────────────────────────────
// Distance
// ─────────────────────────────────────────────────────────────────────────────

/// Haversine great-circle distance between two WGS-84 coordinates (metres).
pub fn haversine_m(lon1: f64, lat1: f64, lon2: f64, lat2: f64) -> f64 {
    const R: f64 = 6_371_000.0; // mean Earth radius (m)
    let (phi1, phi2) = (lat1.to_radians(), lat2.to_radians());
    let dphi = (lat2 - lat1).to_radians();
    let dlam = (lon2 - lon1).to_radians();
    let a = (dphi / 2.0).sin().powi(2)
        + phi1.cos() * phi2.cos() * (dlam / 2.0).sin().powi(2);
    2.0 * R * a.sqrt().asin()
}

// ─────────────────────────────────────────────────────────────────────────────
// Spatial context
// ─────────────────────────────────────────────────────────────────────────────

/// Spatial context computed for a single point relative to a green-space dataset.
pub struct GreenSpatialContext {
    /// Distance to nearest green space object (m).  9 999 m if none found.
    pub nearest_green_m: f32,
    /// Fraction of total dataset area within 500 m radius (0–1).
    pub connectivity_index: f32,
}

/// Compute spatial context for a coordinate given a slice of all green spaces.
///
/// Skips the point itself (distance < 0.1 m) to avoid self-reference.
pub fn compute_spatial_context(
    lat: f64,
    lon: f64,
    all_spaces: &[GreenSpaceObject],
) -> GreenSpatialContext {
    let mut min_dist = f32::MAX;
    let mut green_area_within_500m = 0.0_f32;
    let total_area: f32 = all_spaces.iter().map(|s| s.area_m2).sum();

    for space in all_spaces {
        let d = haversine_m(lon, lat, space.lon, space.lat) as f32;
        if d > 0.1 {
            min_dist = min_dist.min(d);
        }
        if d < 500.0 {
            green_area_within_500m += space.area_m2;
        }
    }

    let connectivity_index = if total_area > 0.0 {
        (green_area_within_500m / total_area).min(1.0)
    } else {
        0.0
    };

    GreenSpatialContext {
        nearest_green_m: if min_dist == f32::MAX { 9_999.0 } else { min_dist },
        connectivity_index,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Corridor detection
// ─────────────────────────────────────────────────────────────────────────────

/// Find pairs of green spaces that are close enough to form potential corridors.
///
/// Returns `(id_a, id_b, distance_m)` for all pairs within 10–800 m of each other.
/// These pairs are candidates for Green Corridor interventions.
pub fn find_green_corridors(spaces: &[GreenSpaceObject]) -> Vec<(String, String, f64)> {
    let mut corridors = Vec::new();
    for (i, a) in spaces.iter().enumerate() {
        for b in spaces.iter().skip(i + 1) {
            let d = haversine_m(a.lon, a.lat, b.lon, b.lat);
            if d < 800.0 && d > 10.0 {
                corridors.push((a.id.clone(), b.id.clone(), d));
            }
        }
    }
    corridors
}
