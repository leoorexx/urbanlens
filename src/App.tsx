import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Mode = "co2" | "heat" | "flood" | "green";
type HeatClass  = "low" | "mid" | "high";
type GreenClass = "close" | "mid" | "far";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CENTER: [number, number] = [8.6821, 50.1109];
const BASE = import.meta.env.BASE_URL;

const BIVARIATE: Record<HeatClass, Record<GreenClass, string>> = {
  low:  { close: "#7FB069", mid: "#C9D6B5", far: "#F4E1B5" },
  mid:  { close: "#8B7AB8", mid: "#C99BB0", far: "#D97757" },
  high: { close: "#5C3A8C", mid: "#B5476B", far: "#8B0000" },
};

const MODES: { id: Mode; label: string; emoji: string; desc: string }[] = [
  { id: "co2",   emoji: "🌡",  label: "Klimakrise",   desc: "CO₂-Emissionen nach Gebäude" },
  { id: "heat",  emoji: "🌿",  label: "Hitze & Grün", desc: "Thermische Hotspots × Baumabstand" },
  { id: "flood", emoji: "🌊",  label: "Überflutung",  desc: "Gebäude im HQ100-Risikobereich" },
  { id: "green", emoji: "👁",  label: "Straßenebene", desc: "Fußgänger-Perspektive 70°" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const greenClass = (d?: number): GreenClass =>
  d == null ? "far" : d < 50 ? "close" : d < 150 ? "mid" : "far";
const pad       = (n: number) => n.toString().padStart(2, "0");
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dayOfYear = (d: Date) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
const fromDOY = (year: number, doy: number) => {
  const d = new Date(year, 0, 1); d.setDate(doy); return d;
};
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

/* CDN global set by <script> in index.html */
declare const maplibregl: any;

/* ═══════════════════════════════════════════════════════════════════════════
   MAP VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function MapView({ onDashboard }: { onDashboard: () => void }) {
  const mapEl  = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const now = new Date();
  const [mode,      setMode]      = useState<Mode>("co2");
  const [doy,       setDoy]       = useState(dayOfYear(now));
  const [minutes,   setMinutes]   = useState(now.getHours()*60+now.getMinutes());
  const [year]                    = useState(now.getFullYear());
  const [playing,   setPlaying]   = useState(false);
  const [showTrees, setShowTrees] = useState(false);
  const [ready,     setReady]     = useState(false);
  const [selected,  setSelected]  = useState<any|null>(null);
  const [infoOpen,  setInfoOpen]  = useState(false);

  const currentDate = useMemo(() => {
    const d = fromDOY(year, doy);
    d.setHours(Math.floor(minutes/60), minutes%60, 0, 0);
    return d;
  }, [year, doy, minutes]);

  const timeStr  = `${pad(Math.floor(minutes/60))}:${pad(minutes%60)}`;
  const dateStr  = toISODate(currentDate);
  const monthLbl = currentDate.toLocaleDateString("de-DE", { day:"2-digit", month:"long" });

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
          setSelected(f.properties);
          setInfoOpen(true);
        });
        map.on("mouseenter", "buildings-3d", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "buildings-3d", () => { map.getCanvas().style.cursor = ""; });
      } catch (err) { console.error("Buildings:", err); }

      try {
        const trees = await fetch(`${BASE}data/trees_ffm.geojson`).then(r => r.json());
        map.addSource("trees", { type: "geojson", data: trees });
        map.addLayer({
          id: "trees-layer",
          type: "circle",
          source: "trees",
          layout: { visibility: "none" },
          paint: { "circle-radius": 3, "circle-color": "#34d399", "circle-opacity": 0.75 },
        });
      } catch (err) { console.warn("Trees:", err); }

      setReady(true);
    });

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("buildings-3d")) return;
    const prop = mode === "heat" ? "_heatColor" : mode === "flood" ? "_floodColor" : "_co2Color";
    map.setPaintProperty("buildings-3d", "fill-extrusion-color", ["get", prop]);
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (mode === "green") map.easeTo({ pitch: 72, zoom: 17, bearing: 0,   duration: 900 });
    else                  map.easeTo({ pitch: 55, zoom: 14, bearing: -20, duration: 700 });
  }, [mode, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("trees-layer")) return;
    map.setLayoutProperty("trees-layer", "visibility", showTrees ? "visible" : "none");
  }, [showTrees]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setMinutes(m => (m + 15) % (24 * 60)), 100);
    return () => clearInterval(id);
  }, [playing]);

  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-50">
      <div ref={mapEl} className="absolute inset-0" />

      {/* TOP BAR */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto shrink-0 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-black/8 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="text-[13px] font-bold tracking-tight">
              Urban<span className="text-amber-500">Lens</span>
              <span className="ml-2 text-[11px] font-normal text-stone-400">Frankfurt</span>
            </div>
            <button onClick={onDashboard}
              className="rounded-lg bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-amber-400 hover:bg-stone-700 transition">
              Dashboard →
            </button>
          </div>
          <div className="mt-0.5 text-[10px] text-stone-400 font-mono">{timeStr} · {monthLbl}</div>
        </div>

        <div className="pointer-events-auto flex gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-black/8 backdrop-blur">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} title={m.desc}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all ${
                mode === m.id ? "bg-stone-900 text-amber-400 shadow-sm" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}>
              <span>{m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* LEFT LEGEND */}
      <aside className="absolute left-4 top-[88px] z-10 w-60">
        <div className="rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/8 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{currentMode.emoji} {currentMode.label}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{currentMode.desc}</p>

          {mode === "co2" && <>
            <div className="mt-3 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#1e3a8a,#3b82f6,#fbbf24,#f97316,#7f1d1d)" }} />
            <div className="mt-1 flex justify-between text-[9px] text-stone-400">
              {["0","60","100","140","180+"].map(v => <span key={v}>{v}</span>)}
            </div>
            <p className="mt-2 text-[10px] text-stone-400">kg CO₂ / m² · Baujahr + EPC-Hessen</p>
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 ring-1 ring-red-200">
              <p className="text-[10px] font-bold text-red-600">⚠ Ohne Maßnahmen 2050</p>
              <p className="text-[10px] text-red-500">+3,8°C · 340 Hitzetote/Jahr</p>
              <p className="text-[10px] text-red-400">€2,3 Mrd. Flutschäden</p>
            </div>
          </>}

          {mode === "heat" && (
            <div className="mt-3 inline-grid grid-cols-[auto_repeat(3,1fr)] gap-1 text-[9px]">
              <div />
              {["nah","mittel","fern"].map(l => <div key={l} className="text-center text-stone-400">{l}</div>)}
              {(["high","mid","low"] as HeatClass[]).map(h => (<>
                <div key={`l${h}`} className="self-center pr-1 text-right text-stone-400">
                  {h === "high" ? "heiß" : h === "mid" ? "mittel" : "kühl"}
                </div>
                {(["close","mid","far"] as GreenClass[]).map(g => (
                  <div key={`${h}${g}`} className="h-6 rounded-sm" style={{ background: BIVARIATE[h][g] }} />
                ))}
              </>))}
            </div>
          )}

          {mode === "flood" && (
            <div className="mt-3 space-y-1">
              {[["#7f1d1d","Kritisch — HQ50"],["#ef4444","Hoch — HQ100"],["#f97316","Mittel"],["#fbbf24","Gering"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2 text-[10px] text-stone-600">
                  <div className="h-3 w-5 rounded-sm" style={{ background: c }} />{l}
                </div>
              ))}
            </div>
          )}

          {mode === "green" && <p className="mt-2 text-[10px] leading-relaxed text-stone-500">Fußgänger-Perspektive 72°.<br />Scroll zum Zoomen, Drag zum Drehen.</p>}

          <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-stone-100 pt-3 text-[11px] text-stone-600">
            <input type="checkbox" checked={showTrees} onChange={e => setShowTrees(e.target.checked)} className="accent-emerald-500" />
            🌳 Straßenbäume (22k)
          </label>
        </div>
      </aside>

      {/* BUILDING DETAIL */}
      {infoOpen && selected && (
        <aside className="absolute right-4 top-[88px] z-10 w-72 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/8 backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Gebäude</p>
              <h3 className="mt-0.5 text-sm font-semibold capitalize">
                {(selected.building as string|undefined)?.replace(/_/g," ") ?? "Unbekannt"}
              </h3>
            </div>
            <button onClick={() => setInfoOpen(false)} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100">✕</button>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[11px]">
            {([
              ["CO₂ kg/m²",    selected.co2_kg_m2    != null ? `${Number(selected.co2_kg_m2).toFixed(1)}` : "—"],
              ["CO₂-Klasse",   selected.co2_class    ?? "—"],
              ["Δ LST",        selected.lst_delta    != null ? `${selected.lst_delta} K` : "—"],
              ["Hitzeklasse",  selected.heat_class   ?? "—"],
              ["Grün-Abstand", selected.green_dist_m != null ? `${selected.green_dist_m} m` : "—"],
              ["Flutrisiko",   selected.flood_risk   ?? "—"],
            ] as [string,string][]).map(([k,v]) => (<>
              <dt key={`k${k}`} className="text-stone-400">{k}</dt>
              <dd key={`v${k}`} className="text-right font-mono">{v}</dd>
            </>))}
          </dl>
          {Number(selected.co2_kg_m2) > 100 && (
            <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-[10px] ring-1 ring-red-200">
              <p className="font-bold text-red-600">Hoher Sanierungsbedarf</p>
              <p className="mt-0.5 text-red-500">BEG-Förderung verfügbar · über Frankfurter Schnitt</p>
            </div>
          )}
        </aside>
      )}

      {/* TIMELINE */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setPlaying(p => !p)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-900 text-white hover:bg-stone-700 transition">
              {playing
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8"/><rect x="6" y="1" width="3" height="8"/></svg>
                : <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1L9 5L2 9Z"/></svg>}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-400">
                {["00:00","06:00","12:00","18:00","24:00"].map(t => <span key={t}>{t}</span>)}
              </div>
              <input type="range" min={0} max={24*60-1} step={15} value={minutes}
                onChange={e => setMinutes(+e.target.value)} className="mt-1 w-full accent-amber-500" />
            </div>
            <button onClick={() => { const d = new Date(); setDoy(dayOfYear(d)); setMinutes(d.getHours()*60+d.getMinutes()); }}
              className="shrink-0 rounded-xl border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:bg-stone-50">
              Jetzt
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-400">
                {["Jan","Apr","Jul","Okt","Dez"].map(m => <span key={m}>{m}</span>)}
              </div>
              <input type="range" min={1} max={365} value={doy}
                onChange={e => setDoy(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
            </div>
            <div className="shrink-0 font-mono text-[11px] text-stone-400">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* LOADER */}
      {!ready && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-stone-100/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
            <div className="text-lg font-bold">Urban<span className="text-amber-500">Lens</span></div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-400" />
            </div>
            <p className="text-[11px] text-stone-400">Lade Frankfurt · 8k Gebäude · 22k Bäume</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const co2ByDistrict = [
  { name:"Sachsenhausen", value:118, fill:"#7f1d1d" },
  { name:"Bornheim",      value:112, fill:"#ef4444" },
  { name:"Gallusviertel", value:104, fill:"#f97316" },
  { name:"Rödelheim",     value:89,  fill:"#fbbf24" },
  { name:"Bockenheim",    value:74,  fill:"#fbbf24" },
  { name:"Nordend",       value:52,  fill:"#3b82f6" },
  { name:"Westend",       value:38,  fill:"#1e3a8a" },
];
const heatRisk = [
  { name:"Kühl + Grün nah",    value:1840, fill:"#7FB069" },
  { name:"Kühl + Grün fern",   value:920,  fill:"#F4E1B5" },
  { name:"Heiß + Grün nah",    value:1240, fill:"#5C3A8C" },
  { name:"Heiß + Grün mittel", value:2180, fill:"#B5476B" },
  { name:"Heiß + Grün fern",   value:2220, fill:"#8B0000" },
];
const floodRisk = [
  { name:"Kritisch",    value:140,  fill:"#7f1d1d" },
  { name:"Hoch",        value:320,  fill:"#ef4444" },
  { name:"Mittel",      value:580,  fill:"#f97316" },
  { name:"Gering",      value:960,  fill:"#fbbf24" },
  { name:"Kein Risiko", value:6400, fill:"#e5e7eb" },
];
const TS = { fontSize:11, borderRadius:10, border:"1px solid #e5e7eb", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" };

function DashboardView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between py-8">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">UrbanLens · Frankfurt am Main</div>
            <h1 className="mt-1 text-[22px] font-bold text-stone-900">Klimarisiko-Dashboard</h1>
            <p className="mt-0.5 text-[11px] text-stone-400">8.400 Gebäude · Open Data FFM · Sentinel-3 LST · HWGK Hessen · Stand 2024</p>
          </div>
          <button onClick={onBack} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-[12px] font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition">
            🗺 Zur Karte
          </button>
        </div>

        {/* KPIs */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v:"8.400",    u:"Gebäude",   l:"Analysiert",           s:"Frankfurter Innenstadt",   c:"#6366f1" },
            { v:"62",       u:"kg CO₂/m²", l:"Ø CO₂-Belastung",      s:"Frankfurter Schnitt 2024", c:"#f97316" },
            { v:"340",      u:"/Jahr",     l:"Hitzetote bis 2050",    s:"ohne Klimamaßnahmen",      c:"#ef4444" },
            { v:"€ 2,3Mrd", u:"",          l:"Flutschäden bis 2050",  s:"HQ100-Szenario",           c:"#3b82f6" },
          ].map(({ v,u,l,s,c }) => (
            <div key={l} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{l}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-[30px] font-bold leading-none" style={{ color:c }}>{v}</span>
                {u && <span className="mb-1 text-[11px] text-stone-400">{u}</span>}
              </div>
              <div className="mt-1 text-[10px] text-stone-400">{s}</div>
            </div>
          ))}
        </div>

        {/* CO₂ */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-stone-900">CO₂-Emissionen nach Stadtteil</h2>
          <p className="mt-0.5 mb-5 text-[11px] text-stone-400">Durchschnittliche CO₂-Belastung in kg/m²·Jahr</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={co2ByDistrict} layout="vertical" margin={{ left:80 }}>
              <XAxis type="number" tick={{ fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v} kg`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:10 }} tickLine={false} axisLine={false} width={76} />
              <Tooltip contentStyle={TS} formatter={v => [`${v} kg CO₂/m²`,""]} />
              <Bar dataKey="value" radius={4} maxBarSize={18}>
                {co2ByDistrict.map((d,i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Hitze */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-stone-900">Hitzebelastung × Grünversorgung</h2>
          <p className="mt-0.5 mb-5 text-[11px] text-stone-400">Bivariate Analyse: thermische Belastung × Grünabstand</p>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={heatRisk} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                    {heatRisk.map((d,i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TS} formatter={v => [`${v} Gebäude`,""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              {heatRisk.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-stone-500">
                  <div className="h-3 w-4 shrink-0 rounded-sm" style={{ background:d.fill }} />{d.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Flut */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-stone-900">Überflutungsrisiko (HQ100)</h2>
          <p className="mt-0.5 mb-5 text-[11px] text-stone-400">Gebäude im 100-jährlichen Hochwasserbereich — HWGK Hessen</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={floodRisk}>
              <XAxis dataKey="name" tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TS} formatter={v => [`${v} Gebäude`,""]} />
              <Bar dataKey="value" radius={4} maxBarSize={50}>
                {floodRisk.map((d,i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Callout */}
        <section className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-[28px]">⚠</div>
            <div>
              <div className="text-[13px] font-bold text-red-800">Kosten des Nichtstuns bis 2050</div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-[11px]">
                <div><div className="font-bold text-red-700">+3,8 °C</div><div className="text-red-600">mittlere Temperaturerhöhung Frankfurt</div></div>
                <div><div className="font-bold text-red-700">340 Hitzetote/Jahr</div><div className="text-red-600">ohne Klimaanpassungsmaßnahmen</div></div>
                <div><div className="font-bold text-red-700">NICE-Score −28 Pkt.</div><div className="text-red-600">mehrere Stadtteile nicht mehr sanierbar</div></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<"map"|"dashboard">("map");
  return view === "map"
    ? <MapView onDashboard={() => setView("dashboard")} />
    : <DashboardView onBack={() => setView("map")} />;
}
