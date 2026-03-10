"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCurrency, USD_TO_ARS, FX_CHANGE_YTD } from "@/lib/currencyContext";

const dataUsd = [
  { month: "Ene", aum: 14200000 },
  { month: "Feb", aum: 14580000 },
  { month: "Mar", aum: 14310000 },
  { month: "Abr", aum: 14920000 },
  { month: "May", aum: 15450000 },
  { month: "Jun", aum: 15180000 },
  { month: "Jul", aum: 15870000 },
  { month: "Ago", aum: 16340000 },
  { month: "Sep", aum: 16050000 },
  { month: "Oct", aum: 16720000 },
  { month: "Nov", aum: 17100000 },
  { month: "Dic", aum: 17510000 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  fmtFull: (v: number) => string;
}

function CustomTooltip({ active, payload, label, fmtFull }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px oklch(0% 0 0 / 0.08)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label} 2025</div>
      <div style={{ fontSize: 16, fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
        {fmtFull(payload[0].value)}
      </div>
    </div>
  );
}

export function AumChart() {
  const { currency, fmtCompact } = useCurrency();

  const data = dataUsd.map(d => ({
    ...d,
    aum: currency === "ARS" ? d.aum * USD_TO_ARS : d.aum,
  }));

  const aumGrowthUsd = 23.3;
  const aumGrowthAdj = currency === "ARS"
    ? ((1 + aumGrowthUsd / 100) * (1 + FX_CHANGE_YTD) - 1) * 100
    : aumGrowthUsd;

  const lastAum = data[data.length - 1].aum;
  const fmtY = (v: number) => fmtCompact(currency === "ARS" ? v / USD_TO_ARS : v).replace("$", currency === "ARS" ? "AR$" : "$");
  const fmtFull = (v: number) => fmtCompact(currency === "ARS" ? v / USD_TO_ARS : v);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "24px 24px 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            AUM Total — 2025
          </div>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 28, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.3px" }}>
            {fmtCompact(17_510_000)}
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 20,
            background: "var(--green-light)",
            color: "var(--green)",
          }}
        >
          +{aumGrowthAdj.toFixed(1)}% YTD
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(38% 0.12 250)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="oklch(38% 0.12 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fill: "var(--text-muted)", fontSize: 10.5, fontFamily: "var(--font-dm-sans)" }}
            axisLine={false}
            tickLine={false}
            width={currency === "ARS" ? 72 : 52}
            domain={[lastAum * 0.96, lastAum * 1.03]}
          />
          <Tooltip content={<CustomTooltip fmtFull={fmtFull} />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="aum"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#aumGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
