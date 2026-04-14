#!/usr/bin/env python3
"""
UrbanLens Layer Generator
Einmalig ausführen → generiert alle GeoJSON-Dateien in data/layers/
Danach lädt die Karte lokal, kein API-Aufruf nötig.

Benötigt: pip install requests
Ausführen: python generate_layers.py
"""

import json
import time
import os
import requests
from pathlib import Path

CITIES = {
    "ffm": {
        "name": "Frankfurt am Main",
        "bbox": (50.05, 8.55, 50.22, 8.82),  # south, west, north, east
    },
    "utr": {
        "name": "Utrecht",
        "bbox": (52.04, 5.05, 52.14, 5.20),
    }
}

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OUTPUT_DIR = Path("data/layers")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def overpass(query: str, label: str) -> dict:
    """Sendet Overpass-Query, gibt GeoJSON zurück."""
    print(f"  → Lade {label}...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    time.sleep(2)  # Höflichkeitspause
    return data

def osm_to_geojson(elements: list, area_tags: set = None) -> dict:
    """Wandelt Overpass-Elemente in GeoJSON um."""
    if area_tags is None:
        area_tags = {"landuse", "leisure", "natural", "amenity", "building"}
    
    features = []
    for e in elements:
        props = e.get("tags", {})
        
        if e["type"] == "node":
            lat = e.get("lat")
            lon = e.get("lon")
            if lat and lon:
                features.append({
                    "type": "Feature",
                    "properties": props,
                    "geometry": {"type": "Point", "coordinates": [lon, lat]}
                })
        
        elif e["type"] == "way" and e.get("geometry"):
            coords = [[pt["lon"], pt["lat"]] for pt in e["geometry"]]
            if not coords:
                continue
            
            is_area = any(k in props for k in area_tags) and len(coords) > 3
            if is_area and coords[0] != coords[-1]:
                coords.append(coords[0])  # schließen
            
            geom_type = "Polygon" if is_area else "LineString"
            geometry = {
                "type": geom_type,
                "coordinates": [coords] if geom_type == "Polygon" else coords
            }
            features.append({
                "type": "Feature",
                "properties": props,
                "geometry": geometry
            })
    
    return {"type": "FeatureCollection", "features": features}

def save(geojson: dict, filename: str):
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))
    kb = path.stat().st_size // 1024
    print(f"    ✓ {filename} ({kb} KB, {len(geojson['features'])} Features)")

# ══════════════════════════════════════════════════════════════
# LAYER GENERATOR FUNCTIONS
# ══════════════════════════════════════════════════════════════

def gen_buildings(city_id: str, bbox: tuple):
    """
    Gebäude-Footprints für Heatmap-Visualisierung.
    Kernlayer: wird für Heat, Flood-Exposure etc. gefärbt.
    """
    s, w, n, e = bbox
    q = f"""[out:json][timeout:120];
(way["building"](bbox:{s},{w},{n},{e});
way["building:use"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Gebäude-Footprints")
    geojson = osm_to_geojson(data["elements"], area_tags={"building"})
    save(geojson, f"buildings_{city_id}.geojson")

def gen_waterways(city_id: str, bbox: tuple):
    """Gewässer für Hochwasser-Layer."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(way["waterway"="river"](bbox:{s},{w},{n},{e});
way["waterway"="canal"](bbox:{s},{w},{n},{e});
way["waterway"="stream"](bbox:{s},{w},{n},{e});
way["waterway"="drain"](bbox:{s},{w},{n},{e});
way["waterway"="ditch"](bbox:{s},{w},{n},{e});
way["natural"="water"](bbox:{s},{w},{n},{e});
way["natural"="wetland"](bbox:{s},{w},{n},{e});
way["landuse"="basin"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Gewässer (Hochwasser)")
    geojson = osm_to_geojson(data["elements"])
    save(geojson, f"waterways_{city_id}.geojson")

def gen_green(city_id: str, bbox: tuple):
    """Parks, Wälder, Grünflächen."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(way["leisure"="park"](bbox:{s},{w},{n},{e});
way["leisure"="garden"](bbox:{s},{w},{n},{e});
way["landuse"="forest"](bbox:{s},{w},{n},{e});
way["landuse"="grass"](bbox:{s},{w},{n},{e});
way["landuse"="meadow"](bbox:{s},{w},{n},{e});
way["landuse"="recreation_ground"](bbox:{s},{w},{n},{e});
way["natural"="wood"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Grünflächen")
    geojson = osm_to_geojson(data["elements"])
    save(geojson, f"green_{city_id}.geojson")

def gen_heat_zones(city_id: str, bbox: tuple):
    """Versiegelte Flächen für Hitzeinsel-Layer."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(way["landuse"="industrial"](bbox:{s},{w},{n},{e});
way["landuse"="commercial"](bbox:{s},{w},{n},{e});
way["landuse"="retail"](bbox:{s},{w},{n},{e});
way["landuse"="railway"](bbox:{s},{w},{n},{e});
way["amenity"="parking"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Hitzeinseln (Landuse)")
    geojson = osm_to_geojson(data["elements"])
    save(geojson, f"heat_zones_{city_id}.geojson")

def gen_roads(city_id: str, bbox: tuple):
    """Hauptstraßen für Lärm-Layer."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(way["highway"="motorway"](bbox:{s},{w},{n},{e});
way["highway"="motorway_link"](bbox:{s},{w},{n},{e});
way["highway"="trunk"](bbox:{s},{w},{n},{e});
way["highway"="trunk_link"](bbox:{s},{w},{n},{e});
way["highway"="primary"](bbox:{s},{w},{n},{e});
way["highway"="primary_link"](bbox:{s},{w},{n},{e});
way["highway"="secondary"](bbox:{s},{w},{n},{e});
way["railway"="rail"](bbox:{s},{w},{n},{e});
way["railway"="light_rail"](bbox:{s},{w},{n},{e});
way["railway"="tram"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Straßen + Schiene (Lärm)")
    geojson = osm_to_geojson(data["elements"], area_tags=set())
    save(geojson, f"noise_roads_{city_id}.geojson")

def gen_bike(city_id: str, bbox: tuple):
    """Radwege aller Qualitätsstufen."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(way["highway"="cycleway"](bbox:{s},{w},{n},{e});
way["cycleway"="lane"](bbox:{s},{w},{n},{e});
way["cycleway"="track"](bbox:{s},{w},{n},{e});
way["cycleway"="shared_lane"](bbox:{s},{w},{n},{e});
way["cycleway:right"="lane"](bbox:{s},{w},{n},{e});
way["cycleway:right"="track"](bbox:{s},{w},{n},{e});
);out geom;"""
    data = overpass(q, "Radwege")
    geojson = osm_to_geojson(data["elements"], area_tags=set())
    save(geojson, f"bike_{city_id}.geojson")

def gen_pois(city_id: str, bbox: tuple):
    """Alle POIs: Schulen, Gesundheit, ÖPNV, Community."""
    s, w, n, e = bbox
    q = f"""[out:json][timeout:60];
(node["amenity"="school"](bbox:{s},{w},{n},{e});
node["amenity"="kindergarten"](bbox:{s},{w},{n},{e});
node["amenity"="hospital"](bbox:{s},{w},{n},{e});
node["amenity"="clinic"](bbox:{s},{w},{n},{e});
node["amenity"="doctors"](bbox:{s},{w},{n},{e});
node["amenity"="pharmacy"](bbox:{s},{w},{n},{e});
node["amenity"="community_centre"](bbox:{s},{w},{n},{e});
node["amenity"="social_centre"](bbox:{s},{w},{n},{e});
node["amenity"="place_of_worship"](bbox:{s},{w},{n},{e});
node["amenity"="library"](bbox:{s},{w},{n},{e});
node["highway"="bus_stop"](bbox:{s},{w},{n},{e});
node["railway"="tram_stop"](bbox:{s},{w},{n},{e});
node["railway"="station"](bbox:{s},{w},{n},{e});
);out;"""
    data = overpass(q, "POIs (alle)")
    geojson = osm_to_geojson(data["elements"])
    save(geojson, f"pois_{city_id}.geojson")

# ══════════════════════════════════════════════════════════════
# COMPOSITE: Gebäude × Risiko
# ══════════════════════════════════════════════════════════════

def gen_flood_exposure(city_id: str, bbox: tuple):
    """
    Gebäude im Hochwasserrisikogebiet:
    Berechnet Distanz jedes Gebäudes zum nächsten Gewässer.
    Färbt nach Distanz: <30m=kritisch, <100m=hoch, <300m=mittel
    """
    print("  → Berechne Flood-Exposure (Gebäude × Gewässer)...")
    
    # Lade Gebäude und Gewässer
    buildings_path = OUTPUT_DIR / f"buildings_{city_id}.geojson"
    waterways_path = OUTPUT_DIR / f"waterways_{city_id}.geojson"
    
    if not buildings_path.exists() or not waterways_path.exists():
        print("    ⚠ Erst buildings und waterways generieren!")
        return
    
    import math
    
    def dist_meters(lat1, lon1, lat2, lon2):
        R = 6371000
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))
    
    def centroid(coords):
        if isinstance(coords[0][0], list):  # Polygon
            coords = coords[0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        return sum(lons)/len(lons), sum(lats)/len(lats)
    
    # Gewässer-Mittelpunkte sammeln
    with open(waterways_path) as f:
        waterways = json.load(f)
    
    water_points = []
    for feat in waterways["features"]:
        coords = feat["geometry"]["coordinates"]
        if feat["geometry"]["type"] == "LineString":
            for c in coords:
                water_points.append((c[1], c[0]))  # lat, lon
        elif feat["geometry"]["type"] == "Polygon":
            clon, clat = centroid(coords)
            water_points.append((clat, clon))
    
    # Gebäude laden, Distanz berechnen
    with open(buildings_path) as f:
        buildings = json.load(f)
    
    exposed = []
    for feat in buildings["features"]:
        coords = feat["geometry"]["coordinates"]
        try:
            clon, clat = centroid(coords)
        except:
            continue
        
        min_dist = min(
            dist_meters(clat, clon, wp[0], wp[1])
            for wp in water_points
        ) if water_points else 9999
        
        if min_dist > 500:
            continue  # Nicht relevant
        
        risk = (
            "critical" if min_dist < 30 else
            "high"     if min_dist < 100 else
            "medium"   if min_dist < 250 else
            "low"
        )
        
        props = dict(feat["properties"])
        props["flood_risk"] = risk
        props["flood_dist_m"] = round(min_dist)
        
        exposed.append({
            "type": "Feature",
            "properties": props,
            "geometry": feat["geometry"]
        })
    
    result = {"type": "FeatureCollection", "features": exposed}
    save(result, f"flood_exposure_{city_id}.geojson")

def gen_heat_exposure(city_id: str, bbox: tuple):
    """
    Gebäude-level Hitzeinsel:
    Jedes Gebäude bekommt einen LST-Schätzwert basierend auf:
    - Gebäudetyp (industrial > commercial > residential)
    - Distanz zur nächsten Grünfläche
    - Versiegelungsgrad der Umgebung
    """
    print("  → Berechne Heat-Exposure (Gebäude × Grünflächen)...")
    
    buildings_path = OUTPUT_DIR / f"buildings_{city_id}.geojson"
    green_path     = OUTPUT_DIR / f"green_{city_id}.geojson"
    
    if not buildings_path.exists():
        print("    ⚠ Erst buildings generieren!")
        return
    
    import math
    
    def dist_meters(lat1, lon1, lat2, lon2):
        R = 6371000
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))
    
    def centroid(coords):
        if isinstance(coords[0][0], list):
            coords = coords[0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        return sum(lons)/len(lons), sum(lats)/len(lats)
    
    # Grünflächen-Mittelpunkte
    green_points = []
    if green_path.exists():
        with open(green_path) as f:
            green = json.load(f)
        for feat in green["features"]:
            coords = feat["geometry"]["coordinates"]
            try:
                clon, clat = centroid(coords)
                green_points.append((clat, clon))
            except:
                pass
    
    # Basistemperatur nach Gebäudetyp (Delta zu Stadtdurchschnitt in °C)
    BASE_TEMP = {
        "industrial": 5.5,
        "warehouse":  5.0,
        "commercial": 4.0,
        "office":     3.5,
        "retail":     3.0,
        "garage":     4.5,
        "parking":    4.5,
        "roof":       2.5,
        "apartments": 2.0,
        "residential":1.5,
        "house":      1.0,
        "school":     2.0,
        "hospital":   2.5,
        "yes":        2.0,  # unbekannt
    }
    
    with open(buildings_path) as f:
        buildings = json.load(f)
    
    result_features = []
    for feat in buildings["features"]:
        props = feat["properties"]
        coords = feat["geometry"]["coordinates"]
        
        try:
            clon, clat = centroid(coords)
        except:
            continue
        
        # Basistemperatur
        btype = props.get("building", "yes")
        base_delta = BASE_TEMP.get(btype, 2.0)
        
        # Grünflächen-Kühleffekt
        if green_points:
            min_green_dist = min(
                dist_meters(clat, clon, gp[0], gp[1])
                for gp in green_points
            )
            # -0.5°C pro 100m Abstand zu Grün (bis max -2°C Kühlung)
            cooling = max(0, min(2.0, (500 - min_green_dist) / 250))
        else:
            min_green_dist = 9999
            cooling = 0
        
        lst_delta = round(base_delta - cooling, 1)
        
        heat_class = (
            "extreme" if lst_delta >= 4.5 else
            "high"    if lst_delta >= 3.0 else
            "medium"  if lst_delta >= 1.5 else
            "low"
        )
        
        new_props = dict(props)
        new_props["lst_delta"] = lst_delta
        new_props["heat_class"] = heat_class
        new_props["green_dist_m"] = round(min_green_dist) if min_green_dist < 9999 else None
        
        result_features.append({
            "type": "Feature",
            "properties": new_props,
            "geometry": feat["geometry"]
        })
    
    result = {"type": "FeatureCollection", "features": result_features}
    save(result, f"heat_exposure_{city_id}.geojson")

# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 55)
    print("UrbanLens Layer Generator")
    print("Lädt Daten von Overpass API und generiert GeoJSON-Dateien")
    print("=" * 55)
    print()
    
    for city_id, cfg in CITIES.items():
        print(f"🏙  {cfg['name']} ({city_id})")
        print("-" * 40)
        bbox = cfg["bbox"]
        
        # Reihenfolge wichtig: erst Basis-Layer, dann Composites
        gen_buildings(city_id, bbox)
        gen_waterways(city_id, bbox)
        gen_green(city_id, bbox)
        gen_heat_zones(city_id, bbox)
        gen_roads(city_id, bbox)
        gen_bike(city_id, bbox)
        gen_pois(city_id, bbox)
        
        print("  → Composite Layer...")
        gen_flood_exposure(city_id, bbox)
        gen_heat_exposure(city_id, bbox)
        
        print()
    
    print("=" * 55)
    print("✅ Fertig! Alle Dateien in data/layers/")
    print()
    print("Generierte Dateien:")
    for f in sorted(OUTPUT_DIR.glob("*.geojson")):
        kb = f.stat().st_size // 1024
        print(f"  {f.name} ({kb} KB)")
    print()
    print("→ Nächster Schritt: index.html öffnen")
    print("  Die Karte lädt jetzt lokal, kein API-Call nötig.")
