import { useEffect, useMemo, useRef } from "react";
import { useStore } from "../../store";

const CENTER: [number, number] = [8.6821, 50.1109];
const BASE = import.meta.env.BASE_URL;

/* ── Color helpers ────────────────────────────────────────────────────────── */
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

function co2Color(co2: number): string {
  if (co2 < 30)  return "#1e3a8a";
  if (co2 < 60)  return "#3b82f6";
  if (co2 < 100) return "#fbbf24";
  if (co2 < 140) return "#f97316";
  return "#7f1d1d";
}

function floodColor(risk: string | null): string {
  if (!risk) return "#94a3b8";
  if (risk === "critical") return "#7f1d1d";
  if (risk === "high")     return "#ef4444";
  if (risk === "medium")   return "#f97316";
  return "#fbbf24";
}

/* ── MapCanvas ────────────────────────────────────────────────────────────── */
export function MapCanvas() {
  const mapEl   = useRef<HTMLDivElement>(null);
  const mapRef  = useRef<any>(null);
  const mglRef  = useRef<any>(null);

  const colorMode  = useStore((s) => s.colorMode);
  const layers     = useStore((s) => s.layers);
  const mapMode    = useStore((s) => s.mapMode);
  const doy        = useStore((s) => s.doy);
  const minutes    = useStore((s) => s.minutes);
  const playing    = useStore((s) => s.playing);
  const setSelected  = useStore((s) => s.setSelected);
  const setMapReady  = useStore((s) => s.setMapReady);
  const setMinutes   = useStore((s) => s.setMinutes);

  const now = new Date();
  const currentDate = useMemo(() => {
    const d = new Date(now.getFullYear(), 0, 1);
    d.setDate(doy);
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doy, minutes]);

  /* ── One-time map init ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapEl.current) return;
    let dead = false;

    import("maplibre-gl").then(({ default: mgl }) => {
      if (dead || !mapEl.current) return;
      mglRef.current = mgl;

      const map = new mgl.Map({
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
        } as any,
        center: CENTER,
        zoom: 14,
        pitch: 55,
        bearing: -20,
        maxPitch: 80,
        antialias: true,
      } as any);

      mapRef.current = map;

      map.on("load", async () => {
        if (dead) return;

        /* Load buildings */
        try {
          const geojson = await fetch(`${BASE}data/co2_buildings_ffm.geojson`).then(r => r.json());

          /* Add per-feature color properties */
          geojson.features = geojson.features.map((f: any) => {
            const p = f.properties ?? {};
            const gc = greenClass(p.green_dist_m);
            const hc = (p.heat_class as HeatClass) ?? "low";
            return {
              ...f,
              properties: {
                ...p,
                _co2Color:   co2Color(p.co2_kg_m2 ?? 0),
                _heatColor:  BIVARIATE[hc]?.[gc] ?? "#888888",
                _floodColor: floodColor(p.flood_risk ?? null),
                _height:     p.height ?? p.building_levels ? (p.building_levels * 3.2) : 10,
              },
            };
          });

          map.addSource("buildings", { type: "geojson", data: geojson });

          map.addLayer({
            id: "buildings-3d",
            type: "fill-extrusion",
            source: "buildings",
            paint: {
              "fill-extrusion-color": ["get", "_co2Color"],
              "fill-extrusion-height": ["get", "_height"],
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.85,
            },
          });

          /* Click handler */
          map.on("click", "buildings-3d", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            setSelected({
              props: f.properties,
              lngLat: [e.lngLat.lng, e.lngLat.lat],
            });
          });

          map.on("mouseenter", "buildings-3d", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "buildings-3d", () => {
            map.getCanvas().style.cursor = "";
          });
        } catch (e) {
          console.warn("Buildings failed to load:", e);
        }

        /* Load trees */
        try {
          const trees = await fetch(`${BASE}data/trees_ffm.geojson`).then(r => r.json());
          map.addSource("trees", { type: "geojson", data: trees });
          map.addLayer({
            id: "trees-circles",
            type: "circle",
            source: "trees",
            paint: {
              "circle-radius": 3,
              "circle-color": "#34d399",
              "circle-opacity": 0.7,
            },
          });
          map.setLayoutProperty("trees-circles", "visibility", "visible");
        } catch (e) {
          console.warn("Trees failed to load:", e);
        }

        setMapReady(true);
      });
    });

    return () => {
      dead = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Color mode → update building paint ──────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("buildings-3d")) return;

    const colorProp =
      colorMode === "heat"  ? "_heatColor"  :
      colorMode === "flood" ? "_floodColor" : "_co2Color";

    map.setPaintProperty("buildings-3d", "fill-extrusion-color", ["get", colorProp]);
  }, [colorMode]);

  /* ── Layer visibility ─────────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("buildings-3d")) {
      map.setLayoutProperty("buildings-3d",    "visibility", layers.has("buildings") ? "visible" : "none");
    }
    if (map.getLayer("trees-circles")) {
      map.setLayoutProperty("trees-circles", "visibility", layers.has("trees") ? "visible" : "none");
    }
  }, [layers]);

  /* ── Map mode transitions ─────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (mapMode === "2d")     map.easeTo({ pitch: 0,  zoom: 13, bearing: 0,   duration: 700 });
    else if (mapMode === "3d") map.easeTo({ pitch: 55, zoom: 14, bearing: -20, duration: 700 });
    else                       map.easeTo({ pitch: 72, zoom: 17, bearing: 0,   duration: 900 });
  }, [mapMode]);

  /* ── Autoplay ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setMinutes((useStore.getState().minutes + 15) % (24 * 60));
    }, 80);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  /* ── Light direction from sun ─────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    import("suncalc").then(m => {
      const sc  = (m as any).default ?? m;
      const pos = sc.getPosition(currentDate, 50.1109, 8.6821);
      const az  = (pos.azimuth * 180) / Math.PI + 180;
      const alt = Math.max((pos.altitude * 180) / Math.PI, 5);
      try {
        map.setLight({ anchor: "map", position: [1.5, az, alt], intensity: 0.35 });
      } catch { /* ignore */ }
    });
  }, [currentDate]);

  return <div ref={mapEl} className="absolute inset-0" />;
}
