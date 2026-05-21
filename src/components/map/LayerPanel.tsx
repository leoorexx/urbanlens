import { clsx } from "clsx";
import { useStore } from "../../store";
import type { ColorMode } from "../../store";

/* ── Color mode tabs ─────────────────────────────────────────────────────── */
const COLOR_MODES: {
  id: ColorMode;
  label: string;
  emoji: string;
  desc: string;
  legend: { color: string; label: string }[];
}[] = [
  {
    id: "co2", label: "CO₂", emoji: "🏗",
    desc: "Gebäude nach CO₂-Emissionen eingefärbt",
    legend: [
      { color: "#1e3a8a", label: "< 30 kg/m²" },
      { color: "#3b82f6", label: "30–60" },
      { color: "#fbbf24", label: "60–100" },
      { color: "#f97316", label: "100–140" },
      { color: "#7f1d1d", label: "> 140 kg/m²" },
    ],
  },
  {
    id: "heat", label: "Hitze", emoji: "🌡",
    desc: "Thermische Belastung × Grünabstand (bivariate Karte)",
    legend: [
      { color: "#7FB069", label: "Kühl + Grün nah" },
      { color: "#D97757", label: "Mittel + Grün fern" },
      { color: "#5C3A8C", label: "Heiß + Grün nah" },
      { color: "#8B0000", label: "Heiß + Grün fern" },
    ],
  },
  {
    id: "flood", label: "Flut", emoji: "🌊",
    desc: "HQ100-Überflutungsrisiko nach Gebäude",
    legend: [
      { color: "#7f1d1d", label: "Kritisch (HQ50)" },
      { color: "#ef4444", label: "Hoch (HQ100)" },
      { color: "#f97316", label: "Mittel" },
      { color: "#fbbf24", label: "Gering" },
    ],
  },
  {
    id: "green", label: "Straße", emoji: "👁",
    desc: "Straßenebene — 72° Neigung, Zoom 17",
    legend: [],
  },
];

/* ── Layer checkboxes ─────────────────────────────────────────────────────── */
const LAYER_LIST: { id: string; emoji: string; label: string }[] = [
  { id: "buildings", emoji: "🏗", label: "Gebäude (3D)" },
  { id: "trees",     emoji: "🌳", label: "Straßenbäume (22k)" },
  { id: "heat",      emoji: "🌡", label: "Hitze-Zonen" },
  { id: "flood",     emoji: "💧", label: "Überflutungszonen" },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export function LayerPanel() {
  const colorMode  = useStore((s) => s.colorMode);
  const layers     = useStore((s) => s.layers);
  const setColorMode = useStore((s) => s.setColorMode);
  const toggleLayer  = useStore((s) => s.toggleLayer);

  const active = COLOR_MODES.find((m) => m.id === colorMode)!;

  return (
    <div className="flex h-full flex-col overflow-hidden text-stone-800">

      {/* Color mode tabs */}
      <div className="shrink-0 border-b border-stone-200/80 p-3">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-stone-400">
          Gebäudefarbe
        </p>
        <div className="grid grid-cols-2 gap-1">
          {COLOR_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setColorMode(m.id)}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                colorMode === m.id
                  ? "bg-stone-900 text-amber-400"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200",
              )}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active legend */}
      {active.legend.length > 0 && (
        <div className="shrink-0 border-b border-stone-200/80 p-3">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-400">
            Legende
          </p>
          <p className="mb-2 text-[10px] text-stone-400">{active.desc}</p>
          <div className="space-y-1">
            {active.legend.map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[10px] text-stone-600">
                <div className="h-3 w-5 shrink-0 rounded-sm" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer toggles */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-stone-400">
          Layer ein/aus
        </p>
        <div className="space-y-1">
          {LAYER_LIST.map((layer) => {
            const on = layers.has(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={clsx(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all",
                  on ? "bg-stone-50 text-stone-700" : "text-stone-400 hover:text-stone-600",
                )}
              >
                <div className={clsx(
                  "h-2 w-2 shrink-0 rounded-full transition-all",
                  on ? "bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "bg-stone-300",
                )} />
                <span className="text-[11px] font-medium">{layer.emoji} {layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-stone-200/80 px-3 py-2.5">
        <p className="text-[9px] text-stone-400">Frankfurt · Open Data · NICE Score</p>
      </div>
    </div>
  );
}
