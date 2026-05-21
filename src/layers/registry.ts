import type { LayerId } from "../store";

export type LayerKind =
  | "fill-extrusion"
  | "circle"
  | "line"
  | "fill"
  | "heatmap";

export interface LayerDef {
  id: LayerId;
  label: string;
  emoji: string;
  kind: LayerKind;
  dataUrl: string;
  description: string;
  group: "klima" | "wasser" | "gruen" | "mobil" | "sozial";
  paint?: Record<string, any>;   // MapLibre paint overrides
  deckLayer?: boolean;           // rendered via deck.gl instead
}

export const LAYER_REGISTRY: Record<LayerId, LayerDef> = {
  "buildings-co2": {
    id: "buildings-co2",
    label: "CO₂-Gebäude",
    emoji: "🏗",
    kind: "fill-extrusion",
    dataUrl: "/data/co2_buildings_ffm.geojson",
    description: "Gebäude eingefärbt nach CO₂-Emissionen (kg/m²·yr)",
    group: "klima",
    deckLayer: true,
  },
  "heat-exposure": {
    id: "heat-exposure",
    label: "Hitzebelastung",
    emoji: "🌡",
    kind: "fill",
    dataUrl: "/data/heat_exposure_ffm.geojson",
    description: "Thermische Belastungszonen aus Sentinel-3 LST",
    group: "klima",
  },
  "buildings-flood": {
    id: "buildings-flood",
    label: "Flutgefährdete Gebäude",
    emoji: "🏚",
    kind: "fill-extrusion",
    dataUrl: "/data/flood_exposure_ffm.geojson",
    description: "Gebäude im HQ100-Überflutungsbereich",
    group: "wasser",
    deckLayer: true,
  },
  "flood-zones": {
    id: "flood-zones",
    label: "Überflutungszonen",
    emoji: "💧",
    kind: "fill",
    dataUrl: "/data/flood_exposure_ffm.geojson",
    description: "HWGK-Hessen HQ100-Gebiete",
    group: "wasser",
  },
  trees: {
    id: "trees",
    label: "Straßenbäume",
    emoji: "🌳",
    kind: "circle",
    dataUrl: "/data/trees_ffm.geojson",
    description: "22.353 Straßenbäume · OSM + Stadtbaumliste FFM",
    group: "gruen",
  },
  parks: {
    id: "parks",
    label: "Parks & Grünflächen",
    emoji: "🌿",
    kind: "fill",
    dataUrl: "/data/heat_exposure_ffm.geojson",
    description: "Öffentliche Grünflächen · OSM landuse=grass/park",
    group: "gruen",
  },
  "bike-lanes": {
    id: "bike-lanes",
    label: "Radwege",
    emoji: "🚲",
    kind: "line",
    dataUrl: "/data/heat_exposure_ffm.geojson",
    description: "Radwege mit Qualitätsstufen · 7-Klassen-System",
    group: "mobil",
  },
  sidewalks: {
    id: "sidewalks",
    label: "Gehwegqualität",
    emoji: "🚶",
    kind: "line",
    dataUrl: "/data/heat_exposure_ffm.geojson",
    description: "Oberflächenqualität · OSM surface-Tags",
    group: "mobil",
  },
  noise: {
    id: "noise",
    label: "Lärmbelastung",
    emoji: "🔊",
    kind: "line",
    dataUrl: "/data/heat_exposure_ffm.geojson",
    description: "Straßenlärm Motorway / Trunk / Primary",
    group: "sozial",
  },
};

export const LAYER_LIST = Object.values(LAYER_REGISTRY);

export const LAYER_GROUPS: Record<string, { label: string; emoji: string }> = {
  klima:  { label: "Klima & Wärme",    emoji: "🌡" },
  wasser: { label: "Wasser & Flut",    emoji: "🌊" },
  gruen:  { label: "Grün & Natur",     emoji: "🌿" },
  mobil:  { label: "Mobilität",        emoji: "🚲" },
  sozial: { label: "Sozial & Lärm",    emoji: "👥" },
};
