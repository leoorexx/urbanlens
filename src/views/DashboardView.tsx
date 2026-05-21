import { useStore } from "../store";

/* ── KPI card ────────────────────────────────────────────────────────────── */
function KpiCard({
  value, unit, label, sub, color = "#f97316",
}: {
  value: string; unit?: string; label: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-[32px] font-bold leading-none" style={{ color }}>{value}</span>
        {unit && <span className="mb-1 text-[12px] text-stone-400">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[10px] text-stone-400">{sub}</div>}
    </div>
  );
}

/* ── Legend strip ────────────────────────────────────────────────────────── */
function LegendStrip({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((l) => (
        <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-stone-500">
          <div className="h-3 w-5 rounded-sm shrink-0" style={{ background: l.color }} />
          {l.label}
        </div>
      ))}
    </div>
  );
}

/* ── Chart placeholder ───────────────────────────────────────────────────── */
function ChartPlaceholder({ label, height = 120 }: { label: string; height?: number }) {
  return (
    <div
      className="w-full rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-[11px] text-stone-300 mt-3"
      style={{ height }}
    >
      {label}
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[16px] font-bold text-stone-900">{title}</h2>
      <p className="mt-0.5 text-[11px] text-stone-400">{desc}</p>
    </div>
  );
}

/* ── DashboardView ───────────────────────────────────────────────────────── */
export function DashboardView() {
  const setView = useStore((s) => s.setView);

  return (
    <div className="min-h-screen bg-stone-50 pt-14 pb-12">
      <div className="mx-auto max-w-5xl px-6">

        {/* Page header */}
        <div className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-[24px] font-bold text-stone-900">
              Frankfurt Klimarisiko-Dashboard
            </h1>
            <p className="mt-1 text-[12px] text-stone-400">
              Datenstand: Open Data FFM · Sentinel-3 LST · HWGK Hessen · Stand 2024
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("map")}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-[12px] font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition"
            >
              🗺 Zur Karte
            </button>
            <button className="rounded-xl bg-stone-900 px-4 py-2 text-[12px] font-semibold text-amber-400 shadow-sm hover:bg-stone-800 transition">
              PDF Export ↓
            </button>
          </div>
        </div>

        {/* ── SECTION 1: Überblick ─────────────────────────────────────── */}
        <section className="mb-10">
          <SectionHeader
            title="Gesamtüberblick"
            desc="Schlüsselindikatoren für Frankfurt am Main — alle 8.400 analysierten Gebäude"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard value="8.400"  unit="Gebäude"      label="Analysiert"           sub="Gesamtbestand Innenstadt"   color="#6366f1" />
            <KpiCard value="62"     unit="kg CO₂/m²"    label="Ø CO₂-Belastung"      sub="Frankfurter Schnitt"        color="#f97316" />
            <KpiCard value="340"    unit="Tote/Jahr"    label="Hitzetote bis 2050"   sub="ohne Klimamaßnahmen"        color="#ef4444" />
            <KpiCard value="€2,3Mrd" unit=""            label="Flutschäden bis 2050" sub="HQ100-Szenario"             color="#3b82f6" />
          </div>
        </section>

        {/* ── SECTION 2: CO₂ ───────────────────────────────────────────── */}
        <section className="mb-10 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionHeader
            title="CO₂-Emissionen nach Gebäude"
            desc="Wärme- und Strombedarf hochgerechnet auf kg CO₂ pro m² und Jahr (Baujahr + EPC-Hessen)"
          />
          <LegendStrip items={[
            { color: "#1e3a8a", label: "< 30 kg/m²" },
            { color: "#3b82f6", label: "30–60" },
            { color: "#fbbf24", label: "60–100" },
            { color: "#f97316", label: "100–140" },
            { color: "#7f1d1d", label: "> 140 kg/m²" },
          ]} />
          <ChartPlaceholder label="Balkendiagramm: CO₂ nach Stadtteil (Daten folgen)" />
          <ChartPlaceholder label="Histogramm: Verteilung CO₂-Klassen" height={80} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-[10px]">
              <div className="font-bold text-red-600">Höchste Belastung</div>
              <div className="mt-0.5 text-stone-500">Sachsenhausen, Bornheim — Ø 118 kg/m²</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-[10px]">
              <div className="font-bold text-emerald-600">Niedrigste Belastung</div>
              <div className="mt-0.5 text-stone-500">Nordend, Westend — Ø 38 kg/m²</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-[10px]">
              <div className="font-bold text-amber-600">Sanierungspotenzial</div>
              <div className="mt-0.5 text-stone-500">2.100 Gebäude über 100 kg/m² — BEG-förderungsfähig</div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Hitze ─────────────────────────────────────────── */}
        <section className="mb-10 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Hitzebelastung × Grünversorgung"
            desc="Bivariate Analyse: thermische Hotspots kombiniert mit Abstand zum nächsten Baum/Park"
          />
          <LegendStrip items={[
            { color: "#7FB069", label: "Kühl + Grün nah" },
            { color: "#C9D6B5", label: "Kühl + Grün mittel" },
            { color: "#F4E1B5", label: "Kühl + Grün fern" },
            { color: "#5C3A8C", label: "Heiß + Grün nah" },
            { color: "#B5476B", label: "Heiß + Grün mittel" },
            { color: "#8B0000", label: "Heiß + Grün fern ⚠" },
          ]} />
          <ChartPlaceholder label="Choropleth: Hitzeklassen nach Stadtteil" />
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-[10px]">
            <div className="font-bold text-orange-600">⚠ Kritische Zonen</div>
            <div className="mt-0.5 text-stone-500">
              68 % der Straßen haben weniger Baumabdeckung als WHO-Empfehlung.
              Gebäude in Hitze-Hoch + Grün-Fern: 1.240 Einheiten — dreifach belastet.
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Flut ──────────────────────────────────────────── */}
        <section className="mb-10 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Überflutungsrisiko (HQ100)"
            desc="Gebäude und Flächen im 100-jährlichen Hochwasserbereich — HWGK Hessen"
          />
          <LegendStrip items={[
            { color: "#7f1d1d", label: "Kritisch (HQ50)" },
            { color: "#ef4444", label: "Hoch (HQ100)" },
            { color: "#f97316", label: "Mittel (Extremregen)" },
            { color: "#fbbf24", label: "Gering (Randzone)" },
          ]} />
          <ChartPlaceholder label="Karte: Flutgefährdete Gebäude nach Risikoklasse" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[10px]">
              <div className="font-bold text-blue-600">Gefährdete Gebäude</div>
              <div className="mt-0.5 text-stone-500">860 Gebäude im HQ100-Bereich · davon 140 kritisch</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-[10px]">
              <div className="font-bold text-blue-600">Schadenpotenzial</div>
              <div className="mt-0.5 text-stone-500">€2,3 Mrd. bis 2050 ohne Schutzmaßnahmen</div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center text-[10px] text-stone-300">
          UrbanLens · Frankfurt Klimaintelligenz · Open Data · Daten und Methodik auf Anfrage
        </div>
      </div>
    </div>
  );
}
