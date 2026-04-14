#!/usr/bin/env python3
"""
UrbanLens — Composite Layer Berechnung
Berechnet flood_exposure und heat_exposure aus bereits vorhandenen Dateien.
Schnell: ~2 Minuten statt 5 Stunden (Grid-Algorithmus statt Brute-Force)

Ausführen: python3 compute_composites.py
"""
import json, math
from pathlib import Path

OUT = Path("data/layers")

def dist(la1, lo1, la2, lo2):
    R = 6371000
    a = math.sin(math.radians(la2-la1)/2)**2 + \
        math.cos(math.radians(la1)) * math.cos(math.radians(la2)) * \
        math.sin(math.radians(lo2-lo1)/2)**2
    return R * 2 * math.asin(math.sqrt(min(1, a)))

def centroid(coords):
    """Mittelpunkt eines Polygons oder Linie."""
    if coords and isinstance(coords[0], list) and isinstance(coords[0][0], list):
        coords = coords[0]
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return sum(lons)/len(lons), sum(lats)/len(lats)

def make_grid(points, cell_deg=0.005):
    """Baut ein Raster für schnelle Nachbarsuche. ~500m Zellen."""
    grid = {}
    for lat, lon in points:
        key = (round(lat/cell_deg), round(lon/cell_deg))
        grid.setdefault(key, []).append((lat, lon))
    return grid, cell_deg

def nearest_in_grid(grid, cell_deg, lat, lon, max_dist_m=600):
    """Findet nächsten Punkt im Grid — nur benachbarte Zellen prüfen."""
    key_r = round(lat/cell_deg)
    key_c = round(lon/cell_deg)
    best = max_dist_m + 1
    # Prüfe 3×3 Zellen um aktuellen Punkt
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            for (plat, plon) in grid.get((key_r+dr, key_c+dc), []):
                d = dist(lat, lon, plat, plon)
                if d < best:
                    best = d
    return best

def save(features, name):
    gj = {"type": "FeatureCollection", "features": features}
    p = OUT / name
    with open(p, "w", encoding="utf-8") as f:
        json.dump(gj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  ✓ {name} ({p.stat().st_size//1024} KB, {len(features)} Features)")

def compute_flood(city):
    name = f"flood_exposure_{city}.geojson"
    p = OUT / name
    if p.exists() and p.stat().st_size > 1000:
        gj = json.loads(p.read_text())
        print(f"  ↷ {name} bereits vorhanden ({len(gj['features'])} Features)")
        return

    bp = OUT / f"buildings_{city}.geojson"
    wp = OUT / f"waterways_{city}.geojson"
    if not bp.exists(): print(f"  ⚠ {bp} fehlt"); return
    if not wp.exists(): print(f"  ⚠ {wp} fehlt"); return

    print(f"  → Gewässer-Punkte sammeln...")
    wpts = []
    for f in json.loads(wp.read_text())["features"]:
        g = f["geometry"]; c = g["coordinates"]
        if g["type"] == "LineString":
            # Jeden 3. Punkt nehmen — reicht für Distanzschätzung
            wpts += [(pt[1], pt[0]) for pt in c[::3]]
        elif g["type"] == "Polygon":
            try:
                cx, cy = centroid(c)
                wpts.append((cy, cx))
            except: pass
    print(f"    {len(wpts)} Gewässer-Punkte")

    print(f"  → Grid aufbauen...")
    grid, cell_deg = make_grid(wpts, cell_deg=0.004)
    print(f"    {len(grid)} Zellen")

    print(f"  → Gebäude berechnen...")
    buildings = json.loads(bp.read_text())["features"]
    feats = []
    for i, f in enumerate(buildings):
        if i % 10000 == 0:
            print(f"    {i}/{len(buildings)} ({100*i//len(buildings)}%)")
        try:
            cx, cy = centroid(f["geometry"]["coordinates"])
        except: continue

        md = nearest_in_grid(grid, cell_deg, cy, cx, max_dist_m=600)
        if md > 500: continue

        risk = ("critical" if md < 30 else
                "high"     if md < 100 else
                "medium"   if md < 250 else "low")

        p2 = dict(f["properties"])
        p2["flood_risk"] = risk
        p2["flood_dist_m"] = round(md)
        feats.append({"type": "Feature", "properties": p2, "geometry": f["geometry"]})

    save(feats, name)

def compute_heat(city):
    name = f"heat_exposure_{city}.geojson"
    p = OUT / name
    if p.exists() and p.stat().st_size > 1000:
        gj = json.loads(p.read_text())
        print(f"  ↷ {name} bereits vorhanden ({len(gj['features'])} Features)")
        return

    bp = OUT / f"buildings_{city}.geojson"
    gp = OUT / f"green_{city}.geojson"
    if not bp.exists(): print(f"  ⚠ {bp} fehlt"); return

    # Grünflächen-Punkte
    gpts = []
    if gp.exists():
        for f in json.loads(gp.read_text())["features"]:
            try:
                cx, cy = centroid(f["geometry"]["coordinates"])
                gpts.append((cy, cx))
            except: pass
    print(f"  → {len(gpts)} Grünflächen-Punkte, Grid aufbauen...")
    ggrid, gcell = make_grid(gpts, cell_deg=0.008) if gpts else ({}, 0.008)

    BASE = {
        "industrial": 5.5, "warehouse": 5.0, "commercial": 4.0,
        "office": 3.5, "retail": 3.0, "garage": 4.5, "parking": 4.5,
        "apartments": 2.0, "residential": 1.5, "house": 1.0,
        "school": 2.0, "hospital": 2.5, "yes": 2.0,
    }

    print(f"  → Gebäude berechnen...")
    buildings = json.loads(bp.read_text())["features"]
    feats = []
    for i, f in enumerate(buildings):
        if i % 10000 == 0:
            print(f"    {i}/{len(buildings)} ({100*i//len(buildings)}%)")
        try:
            cx, cy = centroid(f["geometry"]["coordinates"])
        except: continue

        btype = f["properties"].get("building", "yes")
        base = BASE.get(btype, 2.0)

        if gpts:
            mgd = nearest_in_grid(ggrid, gcell, cy, cx, max_dist_m=800)
            cooling = max(0, min(2.0, (500 - mgd) / 250))
        else:
            mgd = 9999; cooling = 0

        lst = round(base - cooling, 1)
        cls = ("extreme" if lst >= 4.5 else
               "high"    if lst >= 3.0 else
               "medium"  if lst >= 1.5 else "low")

        p2 = dict(f["properties"])
        p2["lst_delta"] = lst
        p2["heat_class"] = cls
        p2["green_dist_m"] = round(mgd) if mgd < 9999 else None
        feats.append({"type": "Feature", "properties": p2, "geometry": f["geometry"]})

    save(feats, name)

if __name__ == "__main__":
    print("=" * 50)
    print("UrbanLens — Composite Layer Berechnung")
    print("Nutzt Grid-Algorithmus (~2 Min statt Stunden)")
    print("=" * 50)

    for city in ["ffm", "utr"]:
        bp = OUT / f"buildings_{city}.geojson"
        if not bp.exists():
            print(f"\n⚠ Keine Gebäude für {city} — übersprungen")
            continue
        print(f"\n🏙  {city.upper()}")
        print("-" * 40)
        compute_flood(city)
        compute_heat(city)

    print("\n" + "=" * 50)
    print("✅ Fertig!")
    for f in sorted(OUT.glob("*exposure*.geojson")):
        print(f"  {f.name} ({f.stat().st_size//1024} KB)")
