#!/usr/bin/env python3
"""
UrbanLens — Ultra Slim
Ziel: Alle Dateien unter 5 MB für GitHub Pages
Ausführen: python3 ultra_slim.py
"""
import json
from pathlib import Path

IN = OUT = Path("data/layers")

def slim(filename, keep_keys, max_feat=20000, decimals=4):
    p = IN / filename
    if not p.exists():
        print(f"  ⚠ {filename} nicht gefunden — übersprungen")
        return

    before = p.stat().st_size // 1024
    gj = json.loads(p.read_text())
    feats = gj["features"][:max_feat]

    result = []
    for f in feats:
        # Koordinaten aggressiv runden (4 Stellen = ~10m Genauigkeit, reicht)
        def rnd(c):
            if c and isinstance(c[0], list):
                return [rnd(x) for x in c]
            return [round(c[0], decimals), round(c[1], decimals)]
        try:
            new_coords = rnd(f["geometry"]["coordinates"])
        except:
            continue

        # Nur relevante Properties
        props = {k: f["properties"][k]
                 for k in keep_keys
                 if k in f["properties"] and f["properties"][k]}

        result.append({
            "type": "Feature",
            "properties": props,
            "geometry": {"type": f["geometry"]["type"], "coordinates": new_coords}
        })

    out = {"type": "FeatureCollection", "features": result}
    with open(OUT / filename, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    after = (OUT / filename).stat().st_size // 1024
    status = "✅" if after < 5000 else "⚠"
    print(f"  {status} {filename}: {before} KB → {after} KB ({len(result)} Features)")

print("=" * 50)
print("UrbanLens — Ultra Slim (Ziel: <5 MB)")
print("=" * 50)

# Hitzekarte — wichtigste Datei, max 20k Gebäude
slim("heat_exposure_ffm.geojson",
     keep_keys={"lst_delta", "heat_class"},
     max_feat=20000)

# Hochwasser — nur Gebäude mit Risiko (sind schon gefiltert)
slim("flood_exposure_ffm.geojson",
     keep_keys={"flood_risk", "flood_dist_m"},
     max_feat=20000)

# Gebäude roh — nur falls noch gebraucht
slim("buildings_ffm.geojson",
     keep_keys={"building"},
     max_feat=15000)

# Andere Layer
slim("waterways_ffm.geojson",
     keep_keys={"waterway", "name", "natural"},
     max_feat=99999)

slim("green_ffm.geojson",
     keep_keys={"leisure", "landuse", "name"},
     max_feat=99999)

slim("noise_roads_ffm.geojson",
     keep_keys={"highway", "railway", "name"},
     max_feat=99999)

slim("bike_ffm.geojson",
     keep_keys={"highway", "cycleway", "name"},
     max_feat=99999)

slim("pois_ffm.geojson",
     keep_keys={"amenity", "highway", "railway", "name"},
     max_feat=99999)

print()
print("Größen nach Slim:")
total = 0
for f in sorted(IN.glob("*_ffm.geojson")):
    kb = f.stat().st_size // 1024
    total += kb
    status = "✅" if kb < 5000 else "❌"
    print(f"  {status} {f.name}: {kb} KB")
print(f"\n  Gesamt: {total // 1024} MB")
print()
print("→ Jetzt pushen:")
print("  git add data/layers/")
print("  git commit -m 'ultra slim layers'")
print("  git push")
