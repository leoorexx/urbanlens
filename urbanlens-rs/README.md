# urbanlens-rs

Rust computation engine for **UrbanLens** urban heat-island analysis.

## Architecture

```
urbanlens-rs/
├── crates/
│   ├── urbanlens-core/   ← Pure library (no_std-compatible, WASM-ready)
│   │   └── src/
│   │       ├── heat_islands/
│   │       │   ├── data_model.rs  ← All domain types
│   │       │   ├── scoring.rs     ← Heat Risk Score algorithm
│   │       │   ├── scenario.rs    ← Best-Scenario ranking
│   │       │   └── geospatial.rs  ← GeoJSON I/O, spatial index, proximity
│   │       ├── export/
│   │       │   ├── geojson.rs     ← FeatureCollection export
│   │       │   └── csv.rs         ← Tabular export (QGIS / Excel)
│   │       └── demo.rs            ← Synthetic Frankfurt dataset
│   ├── urbanlens-cli/    ← Native binary (replaces generate_layers.py for heat data)
│   └── urbanlens-wasm/   ← WebAssembly bindings for browser integration
```

## Integration with existing UrbanLens frontend

The existing frontend (index.html / map3d.html) uses Leaflet + MapLibre GL JS.
This Rust crate integrates in **two modes**:

### Mode 1 — CLI data processor (immediate, no WASM required)
```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build and run
cd urbanlens-rs
cargo run -p urbanlens-cli -- score   --output ../data/layers/heat_risk_ffm.geojson
cargo run -p urbanlens-cli -- scenario --output ../data/layers/heat_scenario_ffm.geojson
cargo run -p urbanlens-cli -- csv      --output ../data/layers/heat_risk_ffm.csv
cargo run -p urbanlens-cli -- summary
```

The output GeoJSON files drop straight into `data/layers/` and can be loaded
by the existing JavaScript map code — no changes to index.html required.

### Mode 2 — WebAssembly (real-time in-browser scoring)
```bash
# Install wasm-pack
cargo install wasm-pack

# Build WASM package
wasm-pack build crates/urbanlens-wasm --target web --out-dir ../../wasm-pkg
```

Then in index.html / map3d.html:
```html
<script type="module">
  import init, { score_district, best_scenario, demo_dataset }
    from './wasm-pkg/urbanlens_wasm.js';

  await init();

  // Score any STADTTEILE entry in real-time
  const result = JSON.parse(score_district(JSON.stringify({
    id: "bahnhofsviertel", name: "Bahnhofsviertel",
    lat: 50.1075, lon: 8.6701,
    lst_delta: 3.9, versieg: 88, ndvi: 0.08, tree_cover: 4,
    sgb2: 62, kinderarmut: 70, elderly_pct: 14, vulnerable_facilities: 4,
  })));
  console.log(result.heat_risk_score, result.heat_risk_label); // 82.3, "Kritisch"

  // Best-Scenario for that district
  const sc = JSON.parse(best_scenario(JSON.stringify(result)));
  console.log(sc.ranked_interventions[0].label); // "Straßenbäume pflanzen"

  // Full demo dataset as GeoJSON (9 districts)
  const fc = JSON.parse(demo_dataset());
</script>
```

## Running tests
```bash
cd urbanlens-rs
cargo test --workspace
```

## Data flow

```
Python generate_layers.py          Rust urbanlens-cli
 (Overpass API → base GeoJSON)  →  (adds heat scores → enriched GeoJSON)
                                           ↓
                              data/layers/heat_risk_ffm.geojson
                                           ↓
                              index.html / map3d.html (Leaflet / MapLibre)
                                       ↑
                              wasm-pkg/ (optional real-time scoring)
```

## Methodology

| Component | Source |
|---|---|
| LST delta (SUHI) | Landsat 8/9 TIR bands 10+11 · USGS EarthExplorer |
| Vegetation (NDVI/NDBI) | Sentinel-2 MSI 10 m · ESA Copernicus |
| Imperviousness | Copernicus HRL Imperviousness 2021 (20 m) |
| Tree Cover | Copernicus Tree Cover Density (TCD) |
| LCZ classification | Stewart & Oke 2012 · 17 zone types |
| Social vulnerability | Zensus 2022 · BA-Statistik · Stadtmonitoring FFM |
| Scenario cooling estimates | UBA 2021 · BBSR 2023 · WHO HHAP (qualitative) |

### Important disclaimer
**LST ≠ Lufttemperatur auf Augenhöhe** (VDI 3787 Bl. 1).  
All cooling estimates are **model assumptions** — not calibrated against local measurements.  
For binding planning decisions: ENVI-met simulation or mobile measurement campaign required
(ISO 14091, VDI 3787 Bl. 2).

## 3D Visualization strategy

The existing `map3d.html` uses **MapLibre GL JS** (WebGL-based, excellent geospatial 3D).
The Rust WASM module provides the **computation layer** that feeds MapLibre:

```javascript
// In map3d.html — replace synthetic data with Rust-computed scores
const geoJson = JSON.parse(await demo_dataset());  // from WASM
map.addSource('heat-risk', { type: 'geojson', data: geoJson });
map.addLayer({
  id: 'heat-extrusion',
  type: 'fill-extrusion',
  source: 'heat-risk',
  paint: {
    'fill-extrusion-color': ['get', 'heat_risk_color'],
    // Height = heat risk score × scale factor → hot districts tower above cool ones
    'fill-extrusion-height': ['*', ['get', 'heat_risk_score'], 20],
    'fill-extrusion-opacity': 0.85,
  }
});
```

For a **standalone Rust desktop viewer** (Bevy / wgpu), the `urbanlens-core`
library is already usable as-is — implement a `bevy_urbanlens` crate that
reads the GeoJSON output and renders it with `bevy_pbr` fill-extrusions.

## To-do list

- [x] Core data model (all domain types)
- [x] Heat Risk Score algorithm (8 weighted components)
- [x] Best-Scenario ranking (10 intervention types, literature-based)
- [x] LCZ classification (Stewart & Oke 2012)
- [x] GeoJSON + CSV export
- [x] CLI binary (summary, score, scenario, csv subcommands)
- [x] WASM bindings with JS API
- [x] Synthetic Frankfurt demo dataset
- [x] Unit tests (scoring, scenario, export, geospatial)
- [ ] Integrate with real Landsat 8/9 TIR preprocessing
- [ ] Connect to `data/layers/heat_exposure_ffm.geojson` (existing layer)
- [ ] R-tree proximity queries against `green_ffm.geojson` + `waterways_ffm.geojson`
- [ ] Extend STADTTEILE data with full 46 districts
- [ ] MapLibre GL integration page (`heat3d.html`)
- [ ] Bevy desktop viewer (optional, standalone)
- [ ] PDF report export (via headless browser or wkhtmltopdf)
