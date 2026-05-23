import { useEffect, useRef } from "react";
import { useStore } from "../../store";

const CENTER: [number, number] = [8.6821, 50.1109];
const BASE = import.meta.env.BASE_URL;

type HeatClass  = "low" | "mid" | "high";
type GreenClass = "close" | "mid" | "far";

const BIVARIATE: Record<HeatClass, Record<GreenClass, string>> = {
  low:  { close: "#7FB069", mid: "#C9D6B5", far: "#F4E1B5" },
  mid:  { close: "#8B7AB8", mid: "#C99BB0", far: "#D97757" },
  high: { close: "#5C3A8C", mid: "#B5476B", far: "#8B0000" },
};

function greenClass(d?: number): GreenClass {
  return d == null ? "far" : d < 50 ? "close" : d < 150 ? "mid" : "far";
}
function co2Color(v: number) {
  if (v < 30)  return "#1e3a8a";
  if (v < 60)  return "#3b82f6";
  if (v < 100) return "#fbbf24";
  if (v < 140) return "#f97316";
  return "#7f1d1d";
}
function floodColor(r: string | null) {
  if (!r) return "#94a3b8";
  if (r === "critical") return "#7f1d1d";
  if (r === "high")     return "#ef4444";
  if (r === "medium")   return "#f97316";
  return "#fbbf24";
}

/* global maplibregl injected by CDN script in index.html */
declare const maplibregl: any;

export function MapCanvas() {
  const mapEl  = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const colorMode   = useStore((s) => s.colorMode);
  const layers      = useStore((s) => s.layers);
  const mapMode     = useStore((s) => s.mapMode);
  const playing     = useStore((s) => s.playing);
  const setSelected = useStore((s) => s.setSelected);
  const setMapReady = useStore((s) => s.setMapReady);
  const setMinutes  = useStore((s) => s.setMinutes);

  /* ── Init ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapEl.current) return;

    const map = new maplibregl.Map({
      container: mapEl.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap © CARTO",
          },
        },
        layers: [{ id: "carto-tiles", type: "raster", source: "carto" }],
      },
      center: CENTER,
      zoom: 14,
      pitch: 55,
      bearing: -20,
      maxPitch: 85,
      antialias: true,
    });

    mapRef.current = map;
    map.once("load", () => map.resize());

    map.on("load", async () => {
      /* Buildings */
      try {
        const raw = await fetch(`${BASE}data/co2_buildings_ffm.geojson`).then(r => r.json());
        raw.features = raw.features.map((f: any) => {
          const p  = f.properties ?? {};
          const hc = (p.heat_class as HeatClass) ?? "low";
          const gc = greenClass(p.green_dist_m);
          const lvl = p.building_levels ? Number(p.building_levels) * 3.2 : null;
          return {
            ...f,
            properties: {
              ...p,
              _co2Color:   co2Color(p.co2_kg_m2 ?? 0),
              _heatColor:  BIVARIATE[hc]?.[gc] ?? "#888",
              _floodColor: floodColor(p.flood_risk ?? null),
              _height:     lvl ?? 10,
            },
          };
        });

        map.addSource("buildings", { type: "geojson", data: raw });
        map.addLayer({
          id: "buildings-3d",
          type: "fill-extrusion",
          source: "buildings",
          paint: {
            "fill-extrusion-color":   ["get", "_co2Color"],
            "fill-extrusion-height":  ["get", "_height"],
            "fill-extrusion-base":    0,
            "fill-extrusion-opacity": 0.9,
          },
        });

        map.on("click", "buildings-3d", (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          setSelected({ props: f.properties, lngLat: [e.lngLat.lng, e.lngLat.lat] });
        });
        map.on("mouseenter", "buildings-3d", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "buildings-3d", () => { map.getCanvas().style.cursor = ""; });
      } catch (err) {
        console.error("Buildings load error:", err);
      }

      /* Trees */
      try {
        const trees = await fetch(`${BASE}data/trees_ffm.geojson`).then(r => r.json());
        map.addSource("trees", { type: "geojson", data: trees });
        map.addLayer({
          id: "trees-layer",
          type: "circle",
          source: "trees",
          paint: {
            "circle-radius":  3,
            "circle-color":   "#34d399",
            "circle-opacity": 0.75,
          },
        });
      } catch (err) {
        console.warn("Trees load error:", err);
      }

      setMapReady(true);
    });

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Color mode ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("buildings-3d")) return;
    const prop =
      colorMode === "heat"  ? "_heatColor"  :
      colorMode === "flood" ? "_floodColor" : "_co2Color";
    map.setPaintProperty("buildings-3d", "fill-extrusion-color", ["get", prop]);
  }, [colorMode]);

  /* ── Layer visibility ────────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("buildings-3d"))
      map.setLayoutProperty("buildings-3d", "visibility", layers.has("buildings") ? "visible" : "none");
    if (map.getLayer("trees-layer"))
      map.setLayoutProperty("trees-layer", "visibility", layers.has("trees") ? "visible" : "none");
  }, [layers]);

  /* ── Map mode ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (mapMode === "2d")      map.easeTo({ pitch: 0,  zoom: 13, bearing: 0,   duration: 700 });
    else if (mapMode === "3d") map.easeTo({ pitch: 55, zoom: 14, bearing: -20, duration: 700 });
    else                       map.easeTo({ pitch: 72, zoom: 17, bearing: 0,   duration: 900 });
  }, [mapMode]);

  /* ── Autoplay ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setMinutes((useStore.getState().minutes + 15) % (24 * 60));
    }, 80);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return <div ref={mapEl} className="absolute inset-0" />;
}
