"use client";

import { useState, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type Period = "30D" | "MTD" | "QTD" | "YTD";

interface PeriodData {
  value: string;
  badge: string;
  badgeVariant: "green" | "red" | "amber" | "neutral";
  sub: string;
}

interface KpiCardToggleProps {
  label: string;
  icon?: ReactNode;
  periods: Record<Period, PeriodData>;
  defaultPeriod?: Period;
}

const PERIODS: Period[] = ["30D", "MTD", "QTD", "YTD"];

const badgeColors: Record<string, { bg: string; color: string }> = {
  green:   { bg: "var(--green-light)",    color: "var(--green)" },
  red:     { bg: "var(--red-light)",      color: "var(--red)" },
  amber:   { bg: "var(--amber-light)",    color: "var(--amber)" },
  neutral: { bg: "var(--surface-raised)", color: "var(--text-secondary)" },
};

export function KpiCardToggle({ label, periods, defaultPeriod = "MTD" }: KpiCardToggleProps) {
  const [activeIdx, setActiveIdx] = useState(PERIODS.indexOf(defaultPeriod));
  const active = PERIODS[activeIdx];
  const data = periods[active];
  const bc = badgeColors[data.badgeVariant];

  const cycle = () => setActiveIdx((i) => (i + 1) % PERIODS.length);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Label row — identical structure to KpiCard */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {label}
        </span>

        {/* Period chip — sits in icon slot, cycles on click */}
        <button
          onClick={cycle}
          title="Click to change period"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          {active}
          <ChevronRight size={10} strokeWidth={2.5} style={{ opacity: 0.5 }} />
        </button>
      </div>

      {/* Value */}
      <div style={{
        fontFamily: "var(--font-dm-serif)",
        fontSize: 32,
        color: "var(--text-primary)",
        lineHeight: 1,
        letterSpacing: "-0.5px",
      }}>
        {data.value}
      </div>

      {/* Badge + sub */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          padding: "3px 8px", borderRadius: 20,
          background: bc.bg, color: bc.color,
          letterSpacing: "0.02em", whiteSpace: "nowrap",
        }}>
          {data.badge}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{data.sub}</span>
      </div>
    </div>
  );
}
