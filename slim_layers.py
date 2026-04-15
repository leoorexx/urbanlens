#!/usr/bin/env python3
"""
UrbanLens — Dateien verkleinern für GitHub Pages
Reduziert GeoJSON auf ~5 MB durch:
1. Koordinaten auf 5 Dezimalstellen runden (~1m Genauigkeit reicht)
2. Unnötige OSM-Tags entfernen
3. Nur relevante Gebäude behalten

Ausführen: python3 slim_layers.py
"""
import json
from pathlib import Path

IN  = Path("data/layers")
OUT = Path("data/layers")  # überschreibt die Originale

def round_coords(coords, decimals=5):
    """Rundet Koordinaten — spart ~40% Dateigröße."""
    if not coords: return coords
    if isinstance(coords[0], list):
        return [round_coords(c, decimals) for c in coords]
    return [round(coords[0], decimals), round(coords[1], decimals)]

def slim_props(props, keep_keys):
    """Behält nur die wichtigen Properties."""
    return {k: v for k, v in props.items() if k in keep_keys and v}

def process(filename, keep_keys, max_features=None):
    p = IN / filename
    if not p.exists():
        print(f"  ⚠ {filename} nicht gefunden")
        return

    before_kb = p.stat().st_size // 1024
    gj = json.loads(p.read_text())
    feats = gj["features"]

    if max_features and len(feats) > max_features:
        feats = feats[:max_features]

    slim = []
    for f in feats:
        g = f["geometry"]
        try:
            new_coords = round_coords(g["coordinates"])
        except:
            continue
        slim.append({
            "type": "Feature",
            "properties": slim_props(f["properties"], keep_keys),
            "geometry": {"type": g["type"], "coordinates": new_coords}
        })

    result = {"type": "FeatureCollection", "features": slim}
    with open(OUT / filename, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

    after_kb = (OUT / filename).stat().st_size // 1024
    print(f"  ✓ {filename}: {before_kb} KB → {after_kb} KB ({len(slim)} Features)")

print("=" * 50)
print("UrbanLens — Layer verkleinern")
print("=" * 50)
print()

# Gebäude — nur building-Typ und Exposure-Werte
process("buildings_ffm.geojson",
    keep_keys={"building", "name"},
    max_features=80000)  # 80k reichen für Frankfurt-Innenstadt

process("heat_exposure_ffm.geojson",
    keep_keys={"building", "lst_delta", "heat_class", "green_dist_m"},
    max_features=80000)

process("flood_exposure_ffm.geojson",
    keep_keys={"building", "flood_risk", "flood_dist_m"},
    max_features=None)  # alle behalten — sind schon gefiltert

process("waterways_ffm.geojson",
    keep_keys={"waterway", "name", "natural"},
    max_features=None)

process("green_ffm.geojson",
    keep_keys={"leisure", "landuse", "name", "natural"},
    max_features=None)

process("noise_roads_ffm.geojson",
    keep_keys={"highway", "railway", "name", "maxspeed"},
    max_features=None)

process("bike_ffm.geojson",
    keep_keys={"highway", "cycleway", "cycleway:right", "name"},
    max_features=None)

process("pois_ffm.geojson",
    keep_keys={"amenity", "highway", "railway", "leisure", "name"},
    max_features=None)

# Utrecht
for suffix in ["buildings","heat_exposure","flood_exposure","waterways","green","noise_roads","bike","pois"]:
    fn = f"{suffix}_utr.geojson"
    if (IN/fn).exists():
        process(fn,
            keep_keys={"building","lst_delta","heat_class","flood_risk","flood_dist_m","waterway","leisure","landuse","highway","railway","amenity","cycleway","name","natural"},
            max_features=40000 if "buildings" in fn or "heat" in fn else None)

print()
print("✅ Fertig! Jetzt pushen:")
print()
print("  git add data/layers/")
print("  git commit -m 'slim: reduce layer file sizes'")
print("  git push")
