import { create } from "zustand";

export type View      = "dashboard" | "map";
export type ColorMode = "co2" | "heat" | "flood" | "green";
export type MapMode   = "2d" | "3d" | "street";
export type LayerId   = string;

export interface SelectedBuilding {
  props: Record<string, any>;
  lngLat: [number, number];
}

interface State {
  view:      View;
  colorMode: ColorMode;
  mapMode:   MapMode;
  layers:    Set<LayerId>;
  mapReady:  boolean;
  selected:  SelectedBuilding | null;
  doy:       number;
  minutes:   number;
  playing:   boolean;
}

interface Actions {
  setView:      (v: View)      => void;
  setColorMode: (c: ColorMode) => void;
  setMapMode:   (m: MapMode)   => void;
  toggleLayer:  (id: LayerId)  => void;
  setMapReady:  (r: boolean)   => void;
  setSelected:  (b: SelectedBuilding | null) => void;
  setDoy:       (d: number)    => void;
  setMinutes:   (m: number)    => void;
  setPlaying:   (p: boolean)   => void;
}

const now = new Date();
const startDoy = Math.floor(
  (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
);

export const useStore = create<State & Actions>((set) => ({
  view:      "map",
  colorMode: "co2",
  mapMode:   "3d",
  layers:    new Set(["buildings", "trees"]),
  mapReady:  false,
  selected:  null,
  doy:       startDoy,
  minutes:   now.getHours() * 60 + now.getMinutes(),
  playing:   false,

  setView:      (v) => set({ view: v }),
  setColorMode: (c) => set({ colorMode: c, mapMode: c === "green" ? "street" : "3d" }),
  setMapMode:   (m) => set({ mapMode: m }),
  toggleLayer:  (id) => set((s) => {
    const next = new Set(s.layers);
    next.has(id) ? next.delete(id) : next.add(id);
    return { layers: next };
  }),
  setMapReady:  (r) => set({ mapReady: r }),
  setSelected:  (b) => set({ selected: b }),
  setDoy:       (d) => set({ doy: d }),
  setMinutes:   (m) => set({ minutes: m }),
  setPlaying:   (p) => set({ playing: p }),
}));
