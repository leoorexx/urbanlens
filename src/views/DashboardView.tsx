import { useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useStore } from "../store";

/* ── Data ────────────────────────────────────────────────────────────────── */
const co2ByDistrict = [
  { name: "Sachsenhausen", value: 118, fill: "#7f1d1d" },
  { name: "Bornheim",      value: 112, fill: "#ef4444" },
  { name: "Gallusviertel", value: 104, fill: "#f97316" },
  { name: "Rödelheim",     value: 89,  fill: "#fbbf24" },
  { name: "Bockenheim",    value: 74,  fill: "#fbbf24" },
  { name: "Nordend",       value: 52,  fill: "#3b82f6" },
  { name: "Westend",       value: 38,  fill: "#1e3a8a" },
];

const co2Classes = [
  { name: "< 30",    count: 680,  fill: "#1e3a8a" },
  { name: "30–60",   count: 2140, fill: "#3b82f6" },
  { name: "60–100",  count: 3180, fill: "#fbbf24" },
  { name: "100–140", count: 1620, fill: "#f97316" },
  { name: "> 140",   count: 780,  fill: "#7f1d1d" },
];

const heatRisk = [
  { name: "Kühl + Grün nah",   value: 1840, fill: "#7FB069" },
  { name: "Kühl + Grün fern",  value: 920,  fill: "#F4E1B5" },
  { name: "Heiß + Grün nah",   value: 1240, fill: "#5C3A8C" },
  { name: "Heiß + Grün mittel",value: 2180, fill: "#B5476B" },
  { name: "Heiß + Grün fern",  value: 2220, fill: "#8B0000" },
];

const floodRisk = [
  { name: "Kritisch",  value: 140, fill: "#7f1d1d" },
  { name: "Hoch",      value: 320, fill: "#ef4444" },
  { name: "Mittel",    value: 580, fill: "#f97316" },
  { name: "Gering",    value: 960, fill: "#fbbf24" },
  { name: "Kein Risiko", value: 6400, fill: "#e5e7eb" },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */
function KpiCard({ value, unit, label, sub, color = "#f97316" }: {
  value: string; unit?: string; label: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-[30px] font-bold leading-none" style={{ color }}>{value}</span>
        {unit && <span className="mb-1 text-[11px] text-stone-400">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[10px] text-stone-400">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5 border-b border-stone-200/80 pb-4">
      <h2 className="text-[15px] font-bold text-stone-900">{title}</h2>
      <p className="mt-0.5 text-[11px] text-stone-400">{desc}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
      <div className="h-3 w-4 shrink-0 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  );
}

const TOOLTIP_STYLE = {
  fontSize: 11, borderRadius: 10,
  border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

/* ── Main component ──────────────────────────────────────────────────────── */
export function DashboardView() {
  const setView  = useStore((s) => s.setView);
  const reportEl = useRef<HTMLDivElement>(null);

  async function exportPDF() {
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);
    const el = reportEl.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
    const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const w      = pdf.internal.pageSize.getWidth();
    const h      = (canvas.height * w) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, w, h);
    pdf.save("UrbanLens_Frankfurt_Risikobericht.pdf");
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-14 pb-16">
      <div ref={reportEl} className="mx-auto max-w-5xl px-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between py-8">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              UrbanLens · Frankfurt am Main
            </div>
            <h1 className="mt-1 text-[22px] font-bold text-stone-900">
              Klimarisiko-Dashboard
            </h1>
            <p className="mt-0.5 text-[11px] text-stone-400">
              8.400 Gebäude · Open Data FFM · Sentinel-3 LST · HWGK Hessen · Stand 2024
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("map")}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-[12px] font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition"
            >
              🗺 Zur Karte
            </button>
            <button
              onClick={exportPDF}
              className="rounded-xl bg-stone-900 px-4 py-2 text-[12px] font-semibold text-amber-400 shadow-sm hover:bg-stone-800 transition"
            >
              PDF Export ↓
            </button>
          </div>
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard value="8.400"   unit="Gebäude"   label="Analysiert"           sub="Frankfurter Innenstadt"     color="#6366f1" />
          <KpiCard value="62"      unit="kg CO₂/m²" label="Ø CO₂-Belastung"      sub="Frankfurter Schnitt 2024"   color="#f97316" />
          <KpiCard value="340"     unit="/Jahr"      label="Hitzetote bis 2050"   sub="ohne Klimamaßnahmen"        color="#ef4444" />
          <KpiCard value="€ 2,3Mrd" unit=""          label="Flutschäden bis 2050" sub="HQ100-Szenario"             color="#3b82f6" />
        </div>

        {/* ── CO₂ ──────────────────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionTitle
            title="CO₂-Emissionen nach Stadtteil"
            desc="Durchschnittliche CO₂-Belastung in kg/m²·Jahr — Wärmebedarf + EPC-Hessen"
          />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={co2ByDistrict} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${v} kg`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={76} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg CO₂/m²`, ""]} />
                  <Bar dataKey="value" radius={4} maxBarSize={18}>
                    {co2ByDistrict.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Legende</div>
              <LegendDot color="#1e3a8a" label="< 30 kg/m² — sehr niedrig" />
              <LegendDot color="#3b82f6" label="30–60 kg/m² — niedrig" />
              <LegendDot color="#fbbf24" label="60–100 kg/m² — mittel" />
              <LegendDot color="#f97316" label="100–140 kg/m² — hoch" />
              <LegendDot color="#7f1d1d" label="> 140 kg/m² — kritisch" />
              <div className="mt-3 rounded-xl bg-amber-50 p-2.5 text-[10px]">
                <div className="font-bold text-amber-700">2.100 Gebäude</div>
                <div className="text-stone-500">über 100 kg/m² — BEG-förderungsfähig</div>
              </div>
            </div>
          </div>

          {/* CO₂ Klassen Verteilung */}
          <div className="mt-6 border-t border-stone-100 pt-5">
            <div className="text-[11px] font-semibold text-stone-600 mb-3">Verteilung CO₂-Klassen (Anzahl Gebäude)</div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={co2Classes} margin={{ top: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} Gebäude`, ""]} />
                <Bar dataKey="count" radius={4} maxBarSize={40}>
                  {co2Classes.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Hitze ────────────────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Hitzebelastung × Grünversorgung"
            desc="Bivariate Analyse: thermische Belastung (Sentinel-3 LST) kombiniert mit Grünabstand"
          />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={heatRisk} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                    {heatRisk.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} Gebäude`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Legende</div>
              {heatRisk.map((d) => <LegendDot key={d.name} color={d.fill} label={d.name} />)}
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-[10px]">
                <div className="font-bold text-red-600">⚠ 2.220 Gebäude</div>
                <div className="text-stone-500">Heiß + Grün fern — höchste Priorität</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Flut ─────────────────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Überflutungsrisiko (HQ100)"
            desc="Gebäude im 100-jährlichen Hochwasserbereich — HWGK Hessen"
          />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={floodRisk} margin={{ top: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} Gebäude`, ""]} />
                  <Bar dataKey="value" radius={4} maxBarSize={50}>
                    {floodRisk.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-[10px]">
                <div className="font-bold text-red-600">460 Gebäude</div>
                <div className="text-stone-500 mt-0.5">kritisch + hohes Risiko · sofortiger Handlungsbedarf</div>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-[10px]">
                <div className="font-bold text-blue-600">€ 2,3 Mrd.</div>
                <div className="text-stone-500 mt-0.5">projizierter Schaden bis 2050 ohne Schutzmaßnahmen</div>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 text-[10px]">
                <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Legende</div>
                {floodRisk.slice(0, 4).map((d) => <LegendDot key={d.name} color={d.fill} label={d.name} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Inaction callout ──────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-[28px]">⚠</div>
            <div>
              <div className="text-[13px] font-bold text-red-800">Kosten des Nichtstuns bis 2050</div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-[11px]">
                <div>
                  <div className="font-bold text-red-700">+3,8 °C</div>
                  <div className="text-red-600">mittlere Temperaturerhöhung Frankfurt</div>
                </div>
                <div>
                  <div className="font-bold text-red-700">340 Hitzetote/Jahr</div>
                  <div className="text-red-600">ohne Klimaanpassungsmaßnahmen</div>
                </div>
                <div>
                  <div className="font-bold text-red-700">NICE-Score −28 Pkt.</div>
                  <div className="text-red-600">mehrere Stadtteile nicht mehr sanierbar</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center text-[9px] text-stone-300 pt-4">
          UrbanLens Frankfurt · Open Data · Sentinel-3 · HWGK Hessen · EPC-Daten · Stand 2024
        </div>
      </div>
    </div>
  );
}
