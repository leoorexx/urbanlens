import { LayoutDashboard, Map } from "lucide-react";
import { clsx } from "clsx";
import { useStore } from "../../store";
import type { View } from "../../store";

const TABS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "map",       label: "Karte",     icon: <Map size={14} /> },
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
];

export function Nav() {
  const view    = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  return (
    <nav className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl border border-black/8 bg-white/90 px-1.5 py-1.5 shadow-lg backdrop-blur-md">
        {/* Logo */}
        <div className="px-3 text-[13px] font-bold tracking-tight text-stone-900">
          Urban<span className="text-amber-500">Lens</span>
        </div>
        <div className="h-4 w-px bg-stone-200" />

        {/* View tabs */}
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={clsx(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all",
              view === t.id
                ? "bg-stone-900 text-amber-400"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
