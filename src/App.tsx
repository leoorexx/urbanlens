import { useEffect, useMemo, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Mode = "co2" | "heat" | "flood" | "green";
type HeatClass  = "low" | "mid" | "high";
type GreenClass = "close" | "mid" | "far";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CENTER: [number, number] = [8.6821, 50.1109];

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

const MODES: { id: Mode; label: string; emoji: string; desc: string }[] = [
  { id: "co2",   emoji: "🌡",  label: "Klimakrise",   desc: "CO₂-Emissionen nach Gebäude" },
  { id: "heat",  emoji: "🌿",  label: "Hitze & Grün", desc: "Thermische Hotspots × Baumabstand" },
  { id: "flood", emoji: "🌊",  label: "Überflutung",  desc: "Gebäude im HQ100-Risikobereich" },
  { id: "green", emoji: "👁",  label: "Straßenebene", desc: "Fußgänger-Perspektive 70°" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const heightFor    = (t?: string) => (t && HEIGHT_BY_TYPE[t]) || 10;
const greenClass   = (d?: number): GreenClass =>
  d == null ? "far" : d < 50 ? "close" : d < 150 ? "mid" : "far";
const pad          = (n: number) => n.toString().padStart(2, "0");
const toISODate    = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dayOfYear    = (d: Date) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
const fromDOY      = (year: number, doy: number) => {
  const d = new Date(year, 0, 1); d.setDate(doy); return d;
};
const hexToRgba    = (hex: string, a = 220): [number,number,number,number] => [
  parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16),
  parseInt(hex.slice(5,7),16), a,
];
const lerpRgba = (
  a: [number,number,number], b: [number,number,number], t: number
): [number,number,number,number] => [
  Math.round(a[0]+(b[0]-a[0])*t),
  Math.round(a[1]+(b[1]-a[1])*t),
  Math.round(a[2]+(b[2]-a[2])*t), 220,
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function App() {
  const mapEl        = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const overlayRef   = useRef<any>(null);
  const sunLightRef  = useRef<any>(null);
  const layerCtx     = useRef<{ PolygonLayer: any; ScatterplotLayer: any } | null>(null);
  const buildingsRef = useRef<any[]>([]);

  const now = new Date();
  const [mode,       setMode]      = useState<Mode>("co2");
  const [doy,        setDoy]       = useState(dayOfYear(now));
  const [minutes,    setMinutes]   = useState(now.getHours()*60+now.getMinutes());
  const [year]                     = useState(now.getFullYear());
  const [playing,    setPlaying]   = useState(false);
  const [showTrees,  setShowTrees] = useState(false);
  const [ready,      setReady]     = useState(false);
  const [selected,   setSelected]  = useState<any|null>(null);
  const [sunInfo,    setSunInfo]   = useState<{alt:number;az:number}|null>(null);
  const [infoOpen,   setInfoOpen]  = useState(false);

  const currentDate = useMemo(() => {
    const d = fromDOY(year, doy);
    d.setHours(Math.floor(minutes/60), minutes%60, 0, 0);
    return d;
  }, [year, doy, minutes]);

  const timeStr  = `${pad(Math.floor(minutes/60))}:${pad(minutes%60)}`;
  const dateStr  = toISODate(currentDate);
  const isDay    = (sunInfo?.alt ?? 0) > 0;
  const monthLbl = currentDate.toLocaleDateString("de-DE",{day:"2-digit",month:"long"});

  /* ── INIT ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapEl.current) return;
    let dead = false;

    (async () => {
      const [
        { default: mgl },
        deckMapbox, deckCore, deckLayers, scMod,
      ] = await Promise.all([
        import("maplibre-gl"),
        import("@deck.gl/mapbox"),
        import("@deck.gl/core"),
        import("@deck.gl/layers"),
        import("suncalc"),
      ]);
      if (dead) return;

      const { MapboxOverlay }                                      = deckMapbox;
      const { _SunLight: SunLight, AmbientLight, LightingEffect } = deckCore as any;
      const { PolygonLayer, ScatterplotLayer }                     = deckLayers;
      const suncalc = (scMod as any).default ?? scMod;
      layerCtx.current = { PolygonLayer, ScatterplotLayer };

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
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256, attribution: "© OpenStreetMap, © CARTO",
          }},
          layers: [{ id:"carto", type:"raster", source:"carto" }],
        } as any,
        center: CENTER, zoom: 14, pitch: 55, bearing: -20, maxPitch: 80,
        ...({ antialias: true } as any),
      });
      mapRef.current = map;

      map.on("load", async () => {
        /* lighting */
        const sunLight = new SunLight({ timestamp: currentDate.getTime(),
          color:[255,240,210], intensity:1.6, _shadow:true });
        const ambient  = new AmbientLight({ color:[255,255,255], intensity:0.9 });
        const lighting = new LightingEffect({ ambient, sunLight });
        sunLightRef.current = sunLight;

        const overlay = new MapboxOverlay({ interleaved:true, effects:[lighting], layers:[] });
        map.addControl(overlay as any);
        overlayRef.current = overlay;

        /* buildings */
        const raw = await fetch("/data/co2_buildings_ffm.geojson").then(r=>r.json());
        buildingsRef.current = raw.features.map((f: any, i: number) => {
          const p   = f.properties ?? {};
          const gc  = greenClass(p.green_dist_m);
          const hc: HeatClass = p.heat_class ?? "low";
          const geom = f.geometry;
          const polys = geom.type==="Polygon" ? [geom.coordinates]
                      : geom.type==="MultiPolygon" ? geom.coordinates : [];
          return {
            id: i, polys,
            height: heightFor(p.building),
            co2:    p.co2_kg_m2 ?? 0,
            biColor: BIVARIATE[hc]?.[gc] ?? "#888",
            floodRisk: p.flood_risk ?? null,
            props: p,
          };
        });

        /* click source for highlight */
        map.addSource("bld-src", { type:"geojson", data: raw });
        map.addLayer({ id:"bld-hl", type:"line", source:"bld-src",
          paint:{"line-color":"#FFD600","line-width":2.5},
          filter:["==",["id"],""]} );
        map.on("click", (_e:any) => {
          // We use the overlay for picking — fall back to a bounding-box query
        });

        /* trees */
        fetch("/data/trees_ffm.geojson").then(r=>r.json()).then(t => {
          (mapRef.current as any).__trees = t.features.map((f:any) =>
            ({ pos: f.geometry.coordinates as [number,number] }));
          redraw();
        });

        /* cursor */
        map.getCanvas().addEventListener("click", handleMapClick);

        updateSun(currentDate, suncalc);
        redraw();
        setReady(true);
      });
    })();

    return () => { dead=true; mapRef.current?.remove(); mapRef.current=null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMapClick(_e: MouseEvent) {
    // deck.gl handles clicks via onHover/onClick in layer props
  }

  /* ── SUN UPDATE ────────────────────────────────────────────────────────── */
  function updateSun(date: Date, sc: any) {
    if (!sunLightRef.current) return;
    sunLightRef.current.timestamp = date.getTime();
    overlayRef.current?.setProps({});
    const pos = sc.getPosition(date, CENTER[1], CENTER[0]);
    setSunInfo({ alt:(pos.altitude*180)/Math.PI, az:(pos.azimuth*180)/Math.PI+180 });
  }

  useEffect(() => {
    if (!ready) return;
    import("suncalc").then(m => updateSun(currentDate, (m as any).default ?? m));
    redraw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, ready]);

  useEffect(() => { if (ready) redraw(); }, [showTrees, mode, ready]);

  /* ── PLAY ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setMinutes(m => (m+15)%(24*60)), 100);
    return () => clearInterval(id);
  }, [playing]);

  /* ── STREET MODE ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (mode === "green") {
      mapRef.current.easeTo({ pitch:72, zoom:17, duration:900 });
    } else {
      mapRef.current.easeTo({ pitch:55, zoom:14, duration:700 });
    }
  }, [mode, ready]);

  /* ── DECK REDRAW ──────────────────────────────────────────────────────── */
  function redraw() {
    const ov  = overlayRef.current;
    const ctx = layerCtx.current;
    if (!ov || !ctx) return;
    const { PolygonLayer, ScatterplotLayer } = ctx;
    const blds  = buildingsRef.current;
    const trees = (mapRef.current as any)?.__trees as {pos:[number,number]}[] | undefined;

    const layers: any[] = [
      new PolygonLayer({
        id: "buildings",
        data: blds,
        extruded: true,
        getPolygon:   (d:any) => d.polys[0]?.[0] ?? [],
        getElevation: (d:any) => d.height,
        getFillColor: (d:any) => {
          if (mode==="heat") return hexToRgba(d.biColor);
          if (mode==="flood") {
            if (!d.floodRisk) return [200,200,190,80];
            const risk: Record<string,number> = { critical:0, high:0.33, medium:0.66, low:1 };
            const t = risk[d.floodRisk] ?? 0.5;
            return lerpRgba([127,29,29],[251,191,36],t);
          }
          const t = Math.min(d.co2/180, 1);
          return lerpRgba([30,58,138],[127,29,29],t);
        },
        material: { ambient:0.55, diffuse:0.9, shininess:14, specularColor:[50,50,50] },
        pickable: true,
        onClick: (info:any) => {
          if (info.object) {
            setSelected(info.object.props);
            setInfoOpen(true);
          } else {
            setInfoOpen(false);
          }
        },
        updateTriggers: { getFillColor: [mode] },
      }),
    ];

    if (showTrees && trees) {
      layers.push(new ScatterplotLayer({
        id: "trees",
        data: trees,
        getPosition: (d:any) => d.pos,
        getRadius: 3, radiusUnits:"meters",
        getFillColor: [52,211,153,200], stroked:false,
      }));
    }

    ov.setProps({ layers });
  }

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-50 font-sans text-stone-900 antialiased">
      <div ref={mapEl} className="absolute inset-0" />

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">

        {/* Logo */}
        <div className="pointer-events-auto shrink-0 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-black/8 backdrop-blur">
          <div className="text-[13px] font-bold tracking-tight">
            Urban<span className="text-amber-500">Lens</span>
            <span className="ml-2 text-[11px] font-normal text-stone-400">Frankfurt</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-400">
            <span className={isDay ? "text-amber-500" : "text-indigo-400"}>
              {isDay ? "☀" : "🌙"}
            </span>
            {sunInfo && (
              <span className="font-mono">
                {sunInfo.alt.toFixed(1)}° · {sunInfo.az.toFixed(0)}°
              </span>
            )}
            <span>·</span>
            <span className="font-mono">{timeStr}</span>
            <span>·</span>
            <span>{monthLbl}</span>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="pointer-events-auto flex gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-black/8 backdrop-blur">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.desc}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all ${
                mode === m.id
                  ? "bg-stone-900 text-amber-400 shadow-sm"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
            >
              <span>{m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── LEFT LEGEND ──────────────────────────────────────────────────── */}
      <aside className="absolute left-4 top-[88px] z-10 w-60">
        <div className="rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/8 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {currentMode.emoji} {currentMode.label}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            {currentMode.desc}
          </p>

          {mode === "co2" && (
            <>
              <div className="mt-3 h-2 rounded-full"
                style={{background:"linear-gradient(90deg,#1e3a8a,#3b82f6,#fbbf24,#f97316,#7f1d1d)"}}/>
              <div className="mt-1 flex justify-between text-[9px] text-stone-400">
                {["0","60","100","140","180+"].map(v=><span key={v}>{v}</span>)}
              </div>
              <p className="mt-2 text-[10px] text-stone-400">kg CO₂ / m² · Baujahr + EPC-Hessen</p>
              {/* Inaction callout */}
              <div className="mt-3 space-y-1.5">
                <div className="rounded-lg bg-red-50 px-3 py-2 ring-1 ring-red-200">
                  <p className="text-[10px] font-bold text-red-600">⚠ Ohne Maßnahmen 2050</p>
                  <p className="text-[10px] text-red-500">+3,8°C · 340 Hitzetote/Jahr</p>
                  <p className="text-[10px] text-red-400">€2,3 Mrd. Flutschäden</p>
                </div>
              </div>
            </>
          )}

          {mode === "heat" && (
            <div className="mt-3 inline-grid grid-cols-[auto_repeat(3,1fr)] gap-1 text-[9px]">
              <div/>
              {["nah","mittel","fern"].map(l=>(
                <div key={l} className="text-center text-stone-400">{l}</div>
              ))}
              {(["high","mid","low"] as HeatClass[]).map(h=>(
                <>
                  <div key={`lbl-${h}`} className="self-center pr-1 text-right text-stone-400">
                    {h==="high"?"heiß":h==="mid"?"mittel":"kühl"}
                  </div>
                  {(["close","mid","far"] as GreenClass[]).map(g=>(
                    <div key={`${h}${g}`} className="h-6 rounded-sm"
                      style={{background:BIVARIATE[h][g]}}/>
                  ))}
                </>
              ))}
            </div>
          )}

          {mode === "flood" && (
            <div className="mt-3 space-y-1">
              {[
                ["#7f1d1d","Kritisch — HQ50"],
                ["#ef4444","Hoch — HQ100"],
                ["#f97316","Mittel — Extremregen"],
                ["#fbbf24","Gering — Randzone"],
              ].map(([c,l])=>(
                <div key={l} className="flex items-center gap-2 text-[10px] text-stone-600">
                  <div className="h-3 w-5 rounded-sm" style={{background:c as string}}/>
                  {l}
                </div>
              ))}
            </div>
          )}

          {mode === "green" && (
            <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
              Fußgänger-Perspektive 72° Neigung.<br/>
              Scroll zum Zoomen, Drag zum Drehen.
            </p>
          )}

          <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-stone-100 pt-3 text-[11px] text-stone-600">
            <input type="checkbox" checked={showTrees}
              onChange={e=>setShowTrees(e.target.checked)}
              className="accent-emerald-500"/>
            🌳 Straßenbäume (22k)
          </label>
        </div>
      </aside>

      {/* ── SELECTED BUILDING ─────────────────────────────────────────────── */}
      {infoOpen && selected && (
        <aside className="absolute right-4 top-[88px] z-10 w-72 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/8 backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Gebäude</p>
              <h3 className="mt-0.5 text-sm font-semibold capitalize">
                {selected.building?.replace(/_/g," ") ?? "Unbekannt"}
              </h3>
            </div>
            <button onClick={()=>setInfoOpen(false)}
              className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
              ✕
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[11px]">
            {[
              ["CO₂ kg/m²",     selected.co2_kg_m2     ?? "—"],
              ["Klasse",         selected.co2_class     ?? "—"],
              ["Δ LST",          selected.lst_delta ? `${selected.lst_delta} K` : "—"],
              ["Hitzeklasse",    selected.heat_class    ?? "—"],
              ["Grün-Abstand",   selected.green_dist_m ? `${selected.green_dist_m} m` : "—"],
              ["Baujahr-Typ",    selected.age_class     ?? "—"],
            ].map(([k,v])=>(
              <>
                <dt key={`k${k}`} className="text-stone-400">{k}</dt>
                <dd key={`v${k}`} className="text-right font-mono">{v}</dd>
              </>
            ))}
          </dl>

          {selected.co2_kg_m2 > 100 && (
            <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-[10px] ring-1 ring-red-200">
              <p className="font-bold text-red-600">Hoher Sanierungsbedarf</p>
              <p className="mt-0.5 text-red-500">
                Dieses Gebäude emittiert überdurchschnittlich viel CO₂.<br/>
                Ohne Sanierung bis 2035: +{Math.round(selected.co2_kg_m2*0.15)} kg/m² Mehrbelastung.
              </p>
            </div>
          )}
        </aside>
      )}

      {/* ── BOTTOM TIME SCRUBBER ──────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/8 backdrop-blur">

          {/* Hour */}
          <div className="flex items-center gap-3">
            <button
              onClick={()=>setPlaying(p=>!p)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-900 text-white transition hover:bg-stone-700"
              aria-label={playing?"Pause":"Play"}
            >
              {playing ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <rect x="1" y="1" width="3" height="8"/>
                  <rect x="6" y="1" width="3" height="8"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M2 1L9 5L2 9Z"/>
                </svg>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-400">
                {["00:00","06:00","12:00","18:00","24:00"].map(t=><span key={t}>{t}</span>)}
              </div>
              <input type="range" min={0} max={24*60-1} step={15}
                value={minutes} onChange={e=>setMinutes(+e.target.value)}
                className="mt-1 w-full accent-amber-500"/>
            </div>

            <button
              onClick={()=>{const d=new Date();setDoy(dayOfYear(d));setMinutes(d.getHours()*60+d.getMinutes());}}
              className="shrink-0 rounded-xl border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:bg-stone-50"
            >
              Jetzt
            </button>
          </div>

          {/* Date */}
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M16 3v4M8 3v4M3 10h18"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-400">
                {["Jan","Apr","Jul","Okt","Dez"].map(m=><span key={m}>{m}</span>)}
              </div>
              <input type="range" min={1} max={365}
                value={doy} onChange={e=>setDoy(+e.target.value)}
                className="mt-1 w-full accent-emerald-500"/>
            </div>
            <div className="shrink-0 font-mono text-[11px] text-stone-400">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* ── LOADER ────────────────────────────────────────────────────────── */}
      {!ready && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-stone-100/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
            <div className="text-lg font-bold">
              Urban<span className="text-amber-500">Lens</span>
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-400"/>
            </div>
            <p className="text-[11px] text-stone-400">
              Lade Frankfurt · 8k Gebäude · 22k Bäume · Sonnenstand
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
