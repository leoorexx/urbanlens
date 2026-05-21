import { useEffect, useMemo, useRef } from "react";
import { useStore } from "../../store";
import type { ColorMode } from "../../store";

const CENTER: [number, number] = [8.6821, 50.1109];

type RGB  = [number, number, number];
type RGBA = [number, number, number, number];

function hexToRgb(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpRgba(a: RGB, b: RGB, t: number, alpha = 220): RGBA {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    alpha,
  ];
}

type HeatClass  = "low" | "mid" | "high";
type GreenClass = "close" | "mid" | "far";

const BIVARIATE: Record<HeatClass, Record<GreenClass, string>> = {
  low:  { close: "#7FB069", mid: "#C9D6B5", far: "#F4E1B5" },
  mid:  { close: "#8B7AB8", mid: "#C99BB0", far: "#D97757" },
  high: { close: "#5C3A8C", mid: "#B5476B", far: "#8B0000" },
};

const HEIGHT_BY_TYPE: Record<string, number> = {
  allotment_house: 3, shed: 3, garage: 3, hut: 3, roof: 4,
  house: 8, detached: 9, semidetached_house: 9, terrace: 10, bungalow: 5,
  train_station: 18, public: 16, civic: 16, parking: 8, garages: 4,
  apartments: 14, residential: 10, commercial: 12, retail: 6,
  office: 16, industrial: 8, warehouse: 8, school: 10, hospital: 16,
};

const heightFor = (t?: string) => (t && HEIGHT_BY_TYPE[t]) || 10;

function greenClass(d?: number): GreenClass {
  return d == null ? "far" : d < 50 ? "close" : d < 150 ? "mid" : "far";
}

function getBuildingColor(d: any, mode: ColorMode): RGBA {
  if (mode === "heat") {
    const rgb = hexToRgb(d.biColor);
    return [...rgb, 210] as RGBA;
  }
  if (mode === "flood") {
    if (!d.floodRisk) return [180, 185, 195, 60];
    const risk: Record<string, number> = { critical: 0, high: 0.33, medium: 0.66, low: 1 };
    return lerpRgba([127, 29, 29], [251, 191, 36], risk[d.floodRisk] ?? 0.5);
  }
  // co2 (default)
  return lerpRgba([30, 58, 138], [127, 29, 29], Math.min(d.co2 / 180, 1));
}

export function MapCanvas() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<any>(null);
  const overlayRef  = useRef<any>(null);
  const sunLightRef = useRef<any>(null);
  const deckCtx     = useRef<{ PolygonLayer: any; ScatterplotLayer: any } | null>(null);
  const bldRef      = useRef<any[]>([]);
  const treeRef     = useRef<{ pos: [number, number] }[]>([]);

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

  /* ── Init (once) ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapEl.current) return;
    let dead = false;

    (async () => {
      const [{ default: mgl }, deckMapbox, deckCore, deckLayers] = await Promise.all([
        import("maplibre-gl"),
        import("@deck.gl/mapbox"),
        import("@deck.gl/core"),
        import("@deck.gl/layers"),
      ]);
      if (dead) return;

      const { MapboxOverlay }                                      = deckMapbox;
      const { _SunLight: SunLight, AmbientLight, LightingEffect } = deckCore as any;
      const { PolygonLayer, ScatterplotLayer }                     = deckLayers;
      deckCtx.current = { PolygonLayer, ScatterplotLayer };

      const map = new mgl.Map({
        container: mapEl.current!,
        style: {
          version: 8,
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          sources: { carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256, attribution: "© OpenStreetMap © CARTO",
          }},
          layers: [{ id: "carto", type: "raster", source: "carto" }],
        } as any,
        center: CENTER, zoom: 14, pitch: 55, bearing: -20, maxPitch: 80,
        ...({ antialias: true } as any),
      });
      mapRef.current = map;

      map.on("load", async () => {
        if (dead) return;

        const sunLight = new SunLight({
          timestamp: currentDate.getTime(),
          color: [255, 235, 205], intensity: 1.8, _shadow: true,
        });
        const ambient  = new AmbientLight({ color: [200, 220, 255], intensity: 0.7 });
        const lighting = new LightingEffect({ sunLight, ambient });
        sunLightRef.current = sunLight;

        const overlay = new MapboxOverlay({ interleaved: true, effects: [lighting], layers: [] });
        map.addControl(overlay as any);
        overlayRef.current = overlay;

        /* Load buildings */
        try {
          const raw = await fetch("/data/co2_buildings_ffm.geojson").then(r => r.json());
          bldRef.current = raw.features.map((f: any, i: number) => {
            const p  = f.properties ?? {};
            const gc = greenClass(p.green_dist_m);
            const hc = (p.heat_class as HeatClass) ?? "low";
            const geom = f.geometry;
            const polys = geom.type === "Polygon" ? [geom.coordinates]
              : geom.type === "MultiPolygon" ? geom.coordinates : [];
            return {
              id: i, polys,
              height:    heightFor(p.building),
              co2:       p.co2_kg_m2 ?? 0,
              biColor:   BIVARIATE[hc]?.[gc] ?? "#888888",
              floodRisk: p.flood_risk ?? null,
              props: p,
            };
          });
        } catch { /* graceful */ }

        /* Load trees */
        try {
          const tj = await fetch("/data/trees_ffm.geojson").then(r => r.json());
          treeRef.current = tj.features.map((f: any) => ({
            pos: f.geometry.coordinates as [number, number],
          }));
        } catch { /* optional */ }

        redraw();
        setMapReady(true);
      });
    })();

    return () => { dead = true; mapRef.current?.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Sun on time change ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!sunLightRef.current || !overlayRef.current) return;
    sunLightRef.current.timestamp = currentDate.getTime();
    redraw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  /* ── Redraw on layer/color change ─────────────────────────────────────── */
  useEffect(() => { redraw(); }, [colorMode, layers]); // eslint-disable-line

  /* ── Map mode transitions ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapMode === "2d")     mapRef.current.easeTo({ pitch: 0,  zoom: 13, bearing: 0,   duration: 700 });
    else if (mapMode === "3d") mapRef.current.easeTo({ pitch: 55, zoom: 14, bearing: -20, duration: 700 });
    else                       mapRef.current.easeTo({ pitch: 72, zoom: 17, bearing: 0,   duration: 900 });
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

  function redraw() {
    const ov  = overlayRef.current;
    const ctx = deckCtx.current;
    if (!ov || !ctx) return;

    const { PolygonLayer, ScatterplotLayer } = ctx;
    const store  = useStore.getState();
    const mode   = store.colorMode;
    const active = store.layers;
    const deckLayers: any[] = [];

    if (active.has("buildings")) {
      deckLayers.push(new PolygonLayer({
        id: "buildings",
        data: bldRef.current,
        extruded: true,
        getPolygon:   (d: any) => d.polys[0]?.[0] ?? [],
        getElevation: (d: any) => d.height,
        getFillColor: (d: any) => getBuildingColor(d, mode),
        material: { ambient: 0.5, diffuse: 0.9, shininess: 12 },
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 214, 0, 80],
        onClick: (info: any) => {
          setSelected(info.object
            ? { props: info.object.props, lngLat: [info.coordinate?.[0] ?? 0, info.coordinate?.[1] ?? 0] }
            : null
          );
        },
        updateTriggers: { getFillColor: [mode] },
      }));
    }

    if (active.has("trees") && treeRef.current.length > 0) {
      deckLayers.push(new ScatterplotLayer({
        id: "trees",
        data: treeRef.current,
        getPosition: (d: any) => d.pos,
        getRadius: 4, radiusUnits: "meters",
        getFillColor: [52, 211, 153, 200],
        stroked: false, pickable: false,
      }));
    }

    ov.setProps({ layers: deckLayers });
  }

  return <div ref={mapEl} className="absolute inset-0" />;
}
