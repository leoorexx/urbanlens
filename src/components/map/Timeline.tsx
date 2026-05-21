import { useEffect, useMemo, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useStore } from "../../store";

const pad = (n: number) => n.toString().padStart(2, "0");

const SCENARIOS = [
  { label: "Jetzt",      doy: -1,  mins: -1       },
  { label: "Hitzewelle", doy: 195, mins: 14 * 60  },
  { label: "HQ100",      doy: 52,  mins: 9 * 60   },
  { label: "Winter",     doy: 355, mins: 10 * 60  },
];

export function Timeline() {
  const doy      = useStore((s) => s.doy);
  const minutes  = useStore((s) => s.minutes);
  const playing  = useStore((s) => s.playing);
  const setDoy     = useStore((s) => s.setDoy);
  const setMinutes = useStore((s) => s.setMinutes);
  const setPlaying = useStore((s) => s.setPlaying);

  const now  = new Date();
  const year = now.getFullYear();
  const [sunAlt, setSunAlt] = useState<number | null>(null);

  const currentDate = useMemo(() => {
    const d = new Date(year, 0, 1);
    d.setDate(doy);
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return d;
  }, [year, doy, minutes]);

  const timeStr  = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  const monthLbl = currentDate.toLocaleDateString("de-DE", { day: "2-digit", month: "long" });
  const isDay    = (sunAlt ?? 0) > 0;

  useEffect(() => {
    import("suncalc").then((m) => {
      const sc  = (m as any).default ?? m;
      const pos = sc.getPosition(currentDate, 50.1109, 8.6821);
      setSunAlt((pos.altitude * 180) / Math.PI);
    });
  }, [currentDate]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setMinutes((useStore.getState().minutes + 15) % (24 * 60));
    }, 80);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  function resetToNow() {
    const n = new Date();
    setDoy(Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86_400_000));
    setMinutes(n.getHours() * 60 + n.getMinutes());
    setPlaying(false);
  }

  return (
    <div className="px-4 py-3">
      {/* Top row */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{isDay ? "☀️" : "🌙"}</span>
          <span className="font-mono text-[13px] font-semibold text-stone-800">{timeStr}</span>
          <span className="text-[10px] text-stone-300">·</span>
          <span className="text-[11px] text-stone-500">{monthLbl}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            {SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  if (s.doy === -1) { resetToNow(); return; }
                  setDoy(s.doy); setMinutes(s.mins); setPlaying(false);
                }}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[9px] font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPlaying(!playing)}
            className="grid h-7 w-7 place-items-center rounded-lg bg-stone-900 text-amber-400 hover:bg-stone-700 transition"
          >
            {playing ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Hour */}
      <div className="mb-1.5">
        <div className="mb-1 flex justify-between text-[8px] uppercase tracking-widest text-stone-300">
          {["00:00", "06:00", "12:00", "18:00", "24:00"].map(t => <span key={t}>{t}</span>)}
        </div>
        <input type="range" min={0} max={24 * 60 - 1} step={15} value={minutes}
          onChange={e => setMinutes(+e.target.value)}
          className="w-full accent-amber-500 cursor-pointer" style={{ height: "4px" }} />
      </div>

      {/* Date */}
      <div>
        <div className="mb-1 flex justify-between text-[8px] uppercase tracking-widest text-stone-300">
          {["Jan", "Apr", "Jul", "Okt", "Dez"].map(m => <span key={m}>{m}</span>)}
        </div>
        <input type="range" min={1} max={365} step={1} value={doy}
          onChange={e => setDoy(+e.target.value)}
          className="w-full accent-emerald-500 cursor-pointer" style={{ height: "4px" }} />
      </div>
    </div>
  );
}
