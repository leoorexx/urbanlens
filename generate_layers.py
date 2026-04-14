#!/usr/bin/env python3
"""UrbanLens Layer Generator — Gebäude in Quadranten aufgeteilt"""
import json, time, math, requests
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
            r = requests.post(API, data={"data": query}, timeout=90)
            r.raise_for_status()
            result = r.json()
            n = len(result.get("elements", []))
            print(f"    {n} Elemente empfangen")
            time.sleep(5)
            return result
        except Exception as ex:
            print(f"    ⚠ {ex}")
            if i < retries:
                w = 20*i; print(f"    ⏳ Warte {w}s..."); time.sleep(w)
    return None

def to_gj(elements, lines=False):
    feats = []
    AREA = {"landuse","leisure","natural","amenity","building"}
    for e in elements:
        t = e.get("tags",{})
        if e["type"]=="node" and e.get("lat"):
            feats.append({"type":"Feature","properties":t,
                "geometry":{"type":"Point","coordinates":[e["lon"],e["lat"]]}})
        elif e["type"]=="way" and e.get("geometry"):
            coords=[[p["lon"],p["lat"]] for p in e["geometry"]]
            if not coords: continue
            is_area = not lines and any(k in t for k in AREA) and len(coords)>3
            if is_area and coords[0]!=coords[-1]: coords.append(coords[0])
            gt = "Polygon" if is_area else "LineString"
            feats.append({"type":"Feature","properties":t,
                "geometry":{"type":gt,"coordinates":[coords] if gt=="Polygon" else coords}})
    return {"type":"FeatureCollection","features":feats}

def save(gj, name):
    p = OUT/name
    with open(p,"w",encoding="utf-8") as f:
        json.dump(gj, f, ensure_ascii=False, separators=(",",":"))
    print(f"    ✓ {name} ({p.stat().st_size//1024} KB, {len(gj['features'])} Features)")

def exists(name):
    p = OUT/name
    if p.exists() and p.stat().st_size > 500:
        gj = json.loads(p.read_text())
        print(f"  ↷ {name} vorhanden ({len(gj['features'])} Features) — übersprungen")
        return True
    return False

def quadrants(s,w,n,e):
    """Teilt Bbox in 4 Quadranten auf."""
    mc = (s+n)/2; ml = (w+e)/2
    return [
        (s,w,mc,ml,"NW"), (s,ml,mc,e,"NO"),
        (mc,w,n,ml,"SW"), (mc,ml,n,e,"SO"),
    ]

def fetch_buildings(city, s,w,n,e):
    """Lädt Gebäude in 4 Quadranten — löst Timeout-Problem."""
    fname = f"buildings_{city}.geojson"
    if exists(fname): return

    print(f"  → Gebäude (4 Quadranten, je ~75k Features)...")
    all_feats = []
    for qs,qw,qn,qe,label in quadrants(s,w,n,e):
        q = f"[out:json][timeout:90];way[\"building\"]({qs},{qw},{qn},{qe});out geom;"
        data = fetch(q, f"Gebäude {label}")
        if data:
            gj = to_gj(data["elements"])
            all_feats.extend(gj["features"])
            print(f"    Quadrant {label}: {len(gj['features'])} Gebäude")

    combined = {"type":"FeatureCollection","features":all_feats}
    save(combined, fname)

def run(city, cfg):
    s,w,n,e = cfg["s"],cfg["w"],cfg["n"],cfg["e"]

    # Gebäude zuerst (in Quadranten)
    fetch_buildings(city, s,w,n,e)

    # Alle anderen Layer
    layers = [
        (f"waterways_{city}.geojson", False,
         f"[out:json][timeout:90];(way[\"waterway\"=\"river\"]({s},{w},{n},{e});way[\"waterway\"=\"canal\"]({s},{w},{n},{e});way[\"waterway\"=\"stream\"]({s},{w},{n},{e});way[\"natural\"=\"water\"]({s},{w},{n},{e});way[\"natural\"=\"wetland\"]({s},{w},{n},{e}););out geom;",
         "Gewässer"),
        (f"green_{city}.geojson", False,
         f"[out:json][timeout:90];(way[\"leisure\"=\"park\"]({s},{w},{n},{e});way[\"leisure\"=\"garden\"]({s},{w},{n},{e});way[\"landuse\"=\"forest\"]({s},{w},{n},{e});way[\"landuse\"=\"grass\"]({s},{w},{n},{e});way[\"landuse\"=\"meadow\"]({s},{w},{n},{e}););out geom;",
         "Parks & Grün"),
        (f"heat_zones_{city}.geojson", False,
         f"[out:json][timeout:90];(way[\"landuse\"=\"industrial\"]({s},{w},{n},{e});way[\"landuse\"=\"commercial\"]({s},{w},{n},{e});way[\"landuse\"=\"retail\"]({s},{w},{n},{e});way[\"amenity\"=\"parking\"]({s},{w},{n},{e}););out geom;",
         "Hitzezonen"),
        (f"noise_roads_{city}.geojson", True,
         f"[out:json][timeout:90];(way[\"highway\"=\"motorway\"]({s},{w},{n},{e});way[\"highway\"=\"trunk\"]({s},{w},{n},{e});way[\"highway\"=\"primary\"]({s},{w},{n},{e});way[\"highway\"=\"secondary\"]({s},{w},{n},{e});way[\"railway\"=\"rail\"]({s},{w},{n},{e});way[\"railway\"=\"tram\"]({s},{w},{n},{e}););out geom;",
         "Lärmstraßen"),
        (f"bike_{city}.geojson", True,
         f"[out:json][timeout:90];(way[\"highway\"=\"cycleway\"]({s},{w},{n},{e});way[\"cycleway\"=\"lane\"]({s},{w},{n},{e});way[\"cycleway\"=\"track\"]({s},{w},{n},{e});way[\"cycleway\"=\"shared_lane\"]({s},{w},{n},{e}););out geom;",
         "Radwege"),
        (f"pois_{city}.geojson", False,
         f"[out:json][timeout:90];(node[\"amenity\"=\"school\"]({s},{w},{n},{e});node[\"amenity\"=\"kindergarten\"]({s},{w},{n},{e});node[\"amenity\"=\"hospital\"]({s},{w},{n},{e});node[\"amenity\"=\"doctors\"]({s},{w},{n},{e});node[\"amenity\"=\"pharmacy\"]({s},{w},{n},{e});node[\"amenity\"=\"community_centre\"]({s},{w},{n},{e});node[\"amenity\"=\"place_of_worship\"]({s},{w},{n},{e});node[\"amenity\"=\"library\"]({s},{w},{n},{e});node[\"highway\"=\"bus_stop\"]({s},{w},{n},{e});node[\"railway\"=\"tram_stop\"]({s},{w},{n},{e});node[\"railway\"=\"station\"]({s},{w},{n},{e}););out;",
         "POIs"),
    ]

    for fname, lines, query, label in layers:
        if exists(fname): continue
        data = fetch(query, label)
        if data: save(to_gj(data["elements"], lines), fname)

    # Composite Layer berechnen
    compute_flood(city)
    compute_heat(city)

def d(la1,lo1,la2,lo2):
    R=6371000
    a=math.sin(math.radians(la2-la1)/2)**2+math.cos(math.radians(la1))*math.cos(math.radians(la2))*math.sin(math.radians(lo2-lo1)/2)**2
    return R*2*math.asin(math.sqrt(a))

def ctr(coords):
    if coords and isinstance(coords[0],list) and isinstance(coords[0][0],list): coords=coords[0]
    return sum(c[0] for c in coords)/len(coords), sum(c[1] for c in coords)/len(coords)

def compute_flood(city):
    nm = f"flood_exposure_{city}.geojson"
    if exists(nm): return
    print("  → Flood-Exposure berechnen (Gebäude × Gewässer-Distanz)...")
    bp = OUT/f"buildings_{city}.geojson"; wp = OUT/f"waterways_{city}.geojson"
    if not bp.exists() or not wp.exists(): print("    ⚠ Dateien fehlen"); return

    wpts = []
    for f in json.loads(wp.read_text())["features"]:
        g=f["geometry"]; c=g["coordinates"]
        if g["type"]=="LineString": wpts+=[(pt[1],pt[0]) for pt in c[::5]]
        elif g["type"]=="Polygon":
            try: cx,cy=ctr(c); wpts.append((cy,cx))
            except: pass

    feats = []
    for f in json.loads(bp.read_text())["features"]:
        try: cx,cy=ctr(f["geometry"]["coordinates"])
        except: continue
        md = min((d(cy,cx,w[0],w[1]) for w in wpts), default=9999)
        if md > 500: continue
        risk = "critical" if md<30 else "high" if md<100 else "medium" if md<250 else "low"
        p = dict(f["properties"]); p["flood_risk"]=risk; p["flood_dist_m"]=round(md)
        feats.append({"type":"Feature","properties":p,"geometry":f["geometry"]})
    save({"type":"FeatureCollection","features":feats}, nm)

def compute_heat(city):
    nm = f"heat_exposure_{city}.geojson"
    if exists(nm): return
    print("  → Heat-Exposure berechnen (Gebäude × Grün-Distanz)...")
    bp = OUT/f"buildings_{city}.geojson"; gp = OUT/f"green_{city}.geojson"
    if not bp.exists(): print("    ⚠ buildings fehlen"); return

    gpts = []
    if gp.exists():
        for f in json.loads(gp.read_text())["features"]:
            try: cx,cy=ctr(f["geometry"]["coordinates"]); gpts.append((cy,cx))
            except: pass

    BASE = {"industrial":5.5,"commercial":4.0,"retail":3.0,"office":3.5,
            "garage":4.5,"parking":4.5,"apartments":2.0,"residential":1.5,
            "house":1.0,"school":2.0,"hospital":2.5,"yes":2.0}
    feats = []
    for f in json.loads(bp.read_text())["features"]:
        try: cx,cy=ctr(f["geometry"]["coordinates"])
        except: continue
        base = BASE.get(f["properties"].get("building","yes"), 2.0)
        mgd = min((d(cy,cx,g[0],g[1]) for g in gpts), default=9999)
        cooling = max(0, min(2.0,(500-mgd)/250)) if gpts else 0
        lst = round(base-cooling, 1)
        cls = "extreme" if lst>=4.5 else "high" if lst>=3.0 else "medium" if lst>=1.5 else "low"
        p = dict(f["properties"]); p["lst_delta"]=lst; p["heat_class"]=cls
        p["green_dist_m"] = round(mgd) if mgd<9999 else None
        feats.append({"type":"Feature","properties":p,"geometry":f["geometry"]})
    save({"type":"FeatureCollection","features":feats}, nm)

if __name__ == "__main__":
    print("="*50)
    print("UrbanLens Layer Generator")
    print("Gebäude werden in 4 Quadranten geladen.")
    print("Bereits vorhandene Dateien werden übersprungen.")
    print("="*50)
    for city_id, cfg in CITIES.items():
        print(f"\n🏙  {cfg['name']}\n"+"-"*40)
        run(city_id, cfg)
    print("\n"+"="*50+"\n✅ Fertig! Dateien in data/layers/:")
    for f in sorted(OUT.glob("*.geojson")):
        print(f"  {f.name} ({f.stat().st_size//1024} KB)")
