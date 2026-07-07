import { DICTS, type Dict, type Lang } from "./dict";
import { useSettings, updateSettings } from "../state/settings";

export type { Dict, Lang };
export { DICTS };

export function useT(): Dict {
  return DICTS[useSettings().lang];
}

export function setLang(lang: Lang): void {
  updateSettings({ lang });
  document.documentElement.lang = lang;
}
