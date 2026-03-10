"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { AssetType } from "./clientData";

export type Currency = "USD" | "ARS";

/** Current dólar MEP rate */
export const USD_TO_ARS = 1_180;

/**
 * FX rate at the start of the year (Jan 1, 2025).
 * Used to compute how much the peso depreciated YTD.
 * 1 USD = 900 ARS at year-start → +31.1% FX change YTD.
 */
export const USD_TO_ARS_SOY = 900;

/** YTD FX appreciation of USD vs ARS: how much more ARS you get per USD vs Jan 1 */
export const FX_CHANGE_YTD = USD_TO_ARS / USD_TO_ARS_SOY - 1; // ≈ 0.311

/**
 * Monthly FX rates for 2025 (linear interpolation from 900 → 1,180).
 * Used to revalue historical monthly portfolio values in ARS.
 */
export const MONTHLY_FX: Record<string, number> = {
  Ene: 900, Feb: 925, Mar: 952, Abr: 978, May: 1005,
  Jun: 1032, Jul: 1058, Ago: 1085, Sep: 1112, Oct: 1138,
  Nov: 1165, Dic: 1180,
};

/**
 * Approximate FX change per reporting period.
 * These are used to adjust % return KPIs shown in the dashboard.
 */
export const PERIOD_FX_CHANGE: Record<string, number> = {
  "30D": USD_TO_ARS / 1_145 - 1,  // last ~30 days: 1145 → 1180 ≈ +3.1%
  "MTD": USD_TO_ARS / 1_145 - 1,
  "QTD": USD_TO_ARS / 1_085 - 1,  // last ~90 days: 1085 → 1180 ≈ +8.8%
  "YTD": FX_CHANGE_YTD,            // full year: 900 → 1180 ≈ +31.1%
  "1Y":  FX_CHANGE_YTD,
};

/** Asset types that are ARS-denominated — FX adjustment does NOT apply to their % returns */
const ARS_DENOMINATED_TYPES: AssetType[] = ["FCI", "Efectivo"];

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format a USD monetary value for display in the active currency */
  fmt: (usdValue: number) => string;
  /** Format compact (M/k shorthand) */
  fmtCompact: (usdValue: number) => string;
  /**
   * Adjust a % return using the YTD FX change.
   * In USD mode: returns unchanged.
   * In ARS mode for a USD-denominated asset: ARS_return = (1 + usd%) × (1 + FX) − 1
   * For ARS-denominated assets (FCI, Efectivo): no change.
   */
  adjReturn: (pct: number, assetType?: AssetType) => number;
  /**
   * Adjust a % return using the FX change for a specific period (30D, MTD, QTD, YTD).
   * Handles different FX rates per reporting window.
   */
  adjReturnPeriod: (pct: number, period: string) => number;
  /** Format an adjusted return with sign and % symbol */
  fmtReturn: (pct: number, assetType?: AssetType) => string;
  /** Symbol prefix: "$" or "AR$" */
  symbol: string;
  rate: number;
}

function formatCompact(usdValue: number, currency: Currency): string {
  const value = currency === "ARS" ? usdValue * USD_TO_ARS : usdValue;
  const sym = currency === "ARS" ? "AR$" : "$";
  if (value >= 1_000_000_000) return `${sym}${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000)     return `${sym}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)         return `${sym}${(value / 1_000).toFixed(0)}k`;
  return `${sym}${Math.round(value)}`;
}

function adjustReturn(pct: number, currency: Currency, assetType?: AssetType): number {
  if (currency === "USD") return pct;
  // ARS-denominated assets: TNA/TEA etc. are already in ARS, no FX adjustment
  if (assetType && ARS_DENOMINATED_TYPES.includes(assetType)) return pct;
  // USD-denominated → compound with FX change
  return ((1 + pct / 100) * (1 + FX_CHANGE_YTD) - 1) * 100;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  fmt: (v) => formatCompact(v, "USD"),
  fmtCompact: (v) => formatCompact(v, "USD"),
  adjReturn: (p) => p,
  adjReturnPeriod: (p) => p,
  fmtReturn: (p) => `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`,
  symbol: "$",
  rate: 1,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    fmt:        (v) => formatCompact(v, currency),
    fmtCompact: (v) => formatCompact(v, currency),
    adjReturn:  (p, t) => adjustReturn(p, currency, t),
    adjReturnPeriod: (p, period) => {
      if (currency === "USD") return p;
      const fx = PERIOD_FX_CHANGE[period] ?? FX_CHANGE_YTD;
      return ((1 + p / 100) * (1 + fx) - 1) * 100;
    },
    fmtReturn:  (p, t) => {
      const adj = adjustReturn(p, currency, t);
      return `${adj >= 0 ? "+" : ""}${adj.toFixed(1)}%`;
    },
    symbol: currency === "ARS" ? "AR$" : "$",
    rate: currency === "ARS" ? USD_TO_ARS : 1,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
