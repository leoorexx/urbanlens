#!/usr/bin/env python3
"""
UrbanLens — Soziale & Comfort Layer
Lädt: Bänke, Gastronomie, Einzelhandel, Fußwege, Sport, Parkplätze
Ausführen: python3 download_social.py
"""
import json, time, requests
from pathlib import Path

OUT = Path("data/layers")
OUT.mkdir(parents=True, exist_ok=True)
API = "https://overpass-api.de/api/interpreter"

CITIES = {
    "ffm": {"name": "Frankfurt", "s":50.05,"w":8.55,"n":50.22,"e":8.82},
    "utr": {"name": "Utrecht",   "s":52.04,"w":5.05,"n":52.14,"e":5.20},
}

def fetch(query, label, retries=4):
    for i in range(1, retries+1):
        try:
            print(f"  → {label} (Versuch {i})...")
            r = requests.post(API, data={"data": query}, timeout=60)
            r.raise_for_status()
            data = r.json()
            print(f"    {len(data.get('elements',[]))} Elemente")
            time.sleep(4)
            return data
        except Exception as e:
            print(f"    ⚠ {e}")
            if i < retries: time.sleep(15*i)
    return None

def save_nodes(elements, name):
    feats = []
    for e in elements:
        lat = e.get("lat") or (e.get("center",{}).get("lat"))
        lon = e.get("lon") or (e.get("center",{}).get("lon"))
        if lat and lon:
            feats.append({"type":"Feature","properties":e.get("tags",{}),
                "geometry":{"type":"Point","coordinates":[lon,lat]}})
    gj = {"type":"FeatureCollection","features":feats}
    p = OUT/name
    with open(p,"w",encoding="utf-8") as f: json.dump(gj,f,ensure_ascii=False,separators=(",",":"))
    print(f"    ✓ {name} ({p.stat().st_size//1024} KB, {len(feats)} Features)")

def save_ways(elements, name):
    feats = []
    for e in elements:
        if e.get("geometry"):
            coords = [[pt["lon"],pt["lat"]] for pt in e["geometry"]]
            if not coords: continue
            tags = e.get("tags",{})
            is_area = tags.get("area")=="yes" or tags.get("leisure") or tags.get("landuse")
            if is_area and len(coords)>3:
                if coords[0]!=coords[-1]: coords.append(coords[0])
                geom = {"type":"Polygon","coordinates":[coords]}
            else:
                geom = {"type":"LineString","coordinates":coords}
            feats.append({"type":"Feature","properties":tags,"geometry":geom})
    gj = {"type":"FeatureCollection","features":feats}
    p = OUT/name
    with open(p,"w",encoding="utf-8") as f: json.dump(gj,f,ensure_ascii=False,separators=(",",":"))
    print(f"    ✓ {name} ({p.stat().st_size//1024} KB, {len(feats)} Features)")

def exists(name):
    p = OUT/name
    if p.exists() and p.stat().st_size > 200:
        print(f"  ↷ {name} vorhanden — übersprungen")
        return True
    return False

def run(cid, cfg):
    s,w,n,e = cfg["s"],cfg["w"],cfg["n"],cfg["e"]
    b = f"({s},{w},{n},{e})"

    # ── SOCIABILITY ───────────────────────────────────────────
    if not exists(f"social_{cid}.geojson"):
        data = fetch(f"""[out:json][timeout:60];
(node["amenity"="bench"]{b};
node["amenity"="restaurant"]{b};
node["amenity"="cafe"]{b};
node["amenity"="bar"]{b};
node["amenity"="pub"]{b};
node["leisure"="playground"]{b};
node["leisure"="picnic_table"]{b};
node["amenity"="fountain"]{b};
node["amenity"="waste_basket"]{b};
);out;""", "Sociability (Bänke, Gastronomie, Spielplätze)")
        if data: save_nodes(data["elements"], f"social_{cid}.geojson")

    # ── USES & ACTIVITIES — Einzelhandel ─────────────────────
    if not exists(f"retail_{cid}.geojson"):
        data = fetch(f"""[out:json][timeout:60];
(node["shop"="supermarket"]{b};
node["shop"="bakery"]{b};
node["shop"="butcher"]{b};
node["shop"="greengrocer"]{b};
node["shop"="convenience"]{b};
node["shop"="clothes"]{b};
node["shop"="hairdresser"]{b};
node["amenity"="marketplace"]{b};
node["shop"="department_store"]{b};
node["shop"="mall"]{b};
);out;""", "Retail (Einzelhandel, Nahversorgung)")
        if data: save_nodes(data["elements"], f"retail_{cid}.geojson")

    # ── ACCESS & LINKAGES — Fußwege ──────────────────────────
    if not exists(f"footways_{cid}.geojson"):
        data = fetch(f"""[out:json][timeout:60];
(way["highway"="footway"]{b};
way["highway"="pedestrian"]{b};
way["highway"="path"]["foot"="yes"]{b};
way["highway"="steps"]{b};
);out geom;""", "Fußwege & Gehsteige")
        if data: save_ways(data["elements"], f"footways_{cid}.geojson")

    # ── COMFORT & IMAGE — Sport & Freizeitinfrastruktur ──────
    if not exists(f"sport_{cid}.geojson"):
        data = fetch(f"""[out:json][timeout:60];
(node["leisure"="sports_centre"]{b};
way["leisure"="pitch"]{b};
node["leisure"="fitness_centre"]{b};
way["leisure"="park"]{b};
node["amenity"="swimming_pool"]{b};
node["leisure"="swimming_pool"]{b};
);out center;""", "Sport & Freizeit")
        if data: save_nodes(data["elements"], f"sport_{cid}.geojson")

    # ── COMFORT & IMAGE — Parkplätze (Autos = Fußgänger raus)
    if not exists(f"parking_{cid}.geojson"):
        data = fetch(f"""[out:json][timeout:60];
(way["amenity"="parking"]{b};
node["amenity"="parking"]{b};
);out geom;""", "Parkplätze")
        if data: save_ways(data["elements"], f"parking_{cid}.geojson")

print("="*50)
print("UrbanLens — Soziale Layer Download")
print("="*50)
for cid, cfg in CITIES.items():
    print(f"\n🏙  {cfg['name']}\n"+"-"*40)
    run(cid, cfg)

print("\n✅ Fertig! Dateien in data/layers/:")
for f in sorted(OUT.glob("social_*.geojson")):
    print(f"  {f.name} ({f.stat().st_size//1024} KB)")
