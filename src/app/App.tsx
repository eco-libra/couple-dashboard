import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Background } from "./Background";
import { useT } from "../shared/i18n";
import { useSettings, updateSettings, decodeShare } from "../shared/state/settings";
import { HomePage } from "../features/home/HomePage";
import { ClocksPage } from "../features/clocks/ClocksPage";
import { MemoriesPage } from "../features/memories/MemoriesPage";
import { MilestonesPage } from "../features/milestones/MilestonesPage";
import { MorePage } from "../features/more/MorePage";
import { SameMomentPage } from "../features/same-moment/SameMomentPage";
import { MapPage } from "../features/map/MapPage";

export function App() {
  const t = useT();
  const { lang } = useSettings();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Share-link import (#s=payload), kept compatible with v0 links.
  useEffect(() => {
    if (!location.hash.startsWith("#s=")) return;
    try {
      const patch = decodeShare(location.hash.slice(3));
      if (confirm(t.importConfirm)) updateSettings(patch);
    } catch { /* broken link: ignore */ }
    history.replaceState(null, "", location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Background />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clocks" element={<ClocksPage />} />
        <Route path="/moment" element={<SameMomentPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <BottomNav />
    </>
  );
}
