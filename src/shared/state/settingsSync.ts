// Keeps the shared slice of settings in sync with couple_settings (v2).
// On pairing: pull cloud state; afterwards: debounced push on every change.
import { useEffect } from "react";
import { useCoupleScope } from "./scope";
import { updateSettings, subscribeSettings, sharedSlice, type Settings } from "./settings";
import { loadCoupleSettings, saveCoupleSettings } from "../services/couple-data";

export function useCoupleSettingsSync(): void {
  const scope = useCoupleScope();
  const coupleId = scope?.coupleId;

  useEffect(() => {
    if (!scope) return;
    let stopped = false;
    let lastSynced = "";
    let timer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const cloud = await loadCoupleSettings(scope);
      if (stopped) return;
      if (cloud && Object.keys(cloud).length) {
        updateSettings(cloud as Partial<Settings>);
      } else {
        // first pairing: seed the cloud with this device's shared settings
        await saveCoupleSettings(scope, sharedSlice());
      }
      lastSynced = JSON.stringify(sharedSlice());
    })();

    const unsub = subscribeSettings(() => {
      const now = JSON.stringify(sharedSlice());
      if (now === lastSynced) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastSynced = now;
        void saveCoupleSettings(scope, sharedSlice());
      }, 2500);
    });

    return () => { stopped = true; unsub(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);
}
