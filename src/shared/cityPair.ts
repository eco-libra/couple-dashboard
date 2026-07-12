// Per-couple city pair (replaces the hardcoded Tokyo/Santiago constants).
import type { Settings } from "./state/settings";

export interface CityInfo {
  city: string;
  tz: string;
  lat: number;
  lon: number;
  cc: string; // ISO country code
}

export interface CityPair { A: CityInfo; B: CityInfo }

export function cityPair(s: Settings): CityPair {
  return {
    A: { city: s.cityA, tz: s.tzA, lat: s.latA, lon: s.lonA, cc: s.ccA },
    B: { city: s.cityB, tz: s.tzB, lat: s.latB, lon: s.lonB, cc: s.ccB },
  };
}

export function flagEmoji(cc: string): string {
  if (!/^[A-Za-z]{2}$/.test(cc)) return "🌐";
  const [a, b] = cc.toUpperCase();
  return String.fromCodePoint(0x1f1e6 + a.charCodeAt(0) - 65, 0x1f1e6 + b.charCodeAt(0) - 65);
}

const CC_CURRENCY: Record<string, string> = {
  JP: "JPY", CL: "CLP", US: "USD", GB: "GBP", KR: "KRW", CN: "CNY", TW: "TWD",
  BR: "BRL", MX: "MXN", AR: "ARS", PE: "PEN", CO: "COP", PH: "PHP", VN: "VND",
  TH: "THB", ID: "IDR", IN: "INR", CA: "CAD", AU: "AUD", NZ: "NZD", HK: "HKD",
  SG: "SGD", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR", IE: "EUR",
  AT: "EUR", BE: "EUR", FI: "EUR", GR: "EUR",
};

export function currencyOf(cc: string): string {
  return CC_CURRENCY[cc.toUpperCase()] ?? "USD";
}
