import { X } from "lucide-react";
import { MapCanvas } from "../components/map/MapCanvas";
import { LayerPanel } from "../components/map/LayerPanel";
import { Timeline } from "../components/map/Timeline";
import { useStore } from "../store";

export function MapView() {
  const selected   = useStore((s) => s.selected);
  const setSelected = useStore((s) => s.setSelected);
  const p = selected?.props ?? {};

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      {/* ── Full-screen map ────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MapCanvas />
      </div>

      {/* ── Left: Layer panel ──────────────────────────────────────────── */}
      <aside className="absolute left-4 top-16 bottom-[108px] z-20 w-[220px] flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white/90 shadow-xl backdrop-blur-md">
        <LayerPanel />
      </aside>

      {/* ── Right: Building detail popup (on click) ────────────────────── */}
      {selected && (
        <aside className="absolute right-4 top-16 z-20 w-[280px] overflow-hidden rounded-2xl border border-black/8 bg-white/90 shadow-xl backdrop-blur-md">
          <div className="flex items-start justify-between border-b border-stone-200/80 px-4 py-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Gebäude</div>
              <div className="mt-0.5 text-[13px] font-bold capitalize text-stone-900">
                {(p.building as string | undefined)?.replace(/_/g, " ") ?? "Unbekannt"}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition">
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {[
              ["CO₂ kg/m²",    p.co2_kg_m2  != null ? `${(p.co2_kg_m2 as number).toFixed(1)} kg/m²` : "—"],
              ["CO₂-Klasse",   p.co2_class  ?? "—"],
              ["Hitzeklasse",  p.heat_class  ?? "—"],
              ["Δ LST",        p.lst_delta   != null ? `${p.lst_delta} K` : "—"],
              ["Grünabstand",  p.green_dist_m != null ? `${p.green_dist_m} m` : "—"],
              ["Flutrisiko",   p.flood_risk  ?? "—"],
              ["Altersklasse", p.age_class   ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b border-stone-100 pb-1.5">
                <span className="text-[10px] text-stone-400">{k}</span>
                <span className="font-mono text-[11px] text-stone-700">{v}</span>
              </div>
            ))}
          </div>

          {/* Risk callout */}
          {p.co2_kg_m2 > 100 && (
            <div className="mx-4 mb-4 rounded-xl bg-red-50 p-3 text-[10px]">
              <div className="font-bold text-red-600 mb-0.5">⚠ Hoher Sanierungsbedarf</div>
              <div className="text-stone-500">Über dem Frankfurter Schnitt (62 kg/m²). BEG-Förderung verfügbar.</div>
            </div>
          )}
        </aside>
      )}

      {/* ── Bottom: Timeline ───────────────────────────────────────────── */}
      <footer className="absolute bottom-4 z-20 rounded-2xl border border-black/8 bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300"
        style={{ left: "240px", right: "16px" }}>
        <Timeline />
      </footer>
    </div>
  );
}
