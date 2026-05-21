import { Nav } from "./components/ui/Nav";
import { MapView } from "./views/MapView";
import { DashboardView } from "./views/DashboardView";
import { useStore } from "./store";

export default function App() {
  const view = useStore((s) => s.view);

  return (
    <>
      <Nav />
      {view === "map"       && <MapView />}
      {view === "dashboard" && <DashboardView />}
    </>
  );
}
