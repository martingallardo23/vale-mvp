"use client";

import { useState } from "react";
import type { Client } from "@/lib/clientData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useCurrency, MONTHLY_FX } from "@/lib/currencyContext";

interface TipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  fmtVal: (n: number) => string;
}

function CustomTip({ active, payload, label, fmtVal }: TipProps) {
  if (!active || !payload?.length) return null;
  const portfolio = payload.find(p => p.name === "Portfolio");
  const benchmark = payload.find(p => p.name === "Benchmark");
  if (!portfolio || !benchmark) return null;
  const diff = portfolio.value - benchmark.value;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", minWidth: 180 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{label} 2025</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Portafolio</span>
          <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 15, color: "var(--accent)" }}>{fmtVal(portfolio.value)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Referencia</span>
          <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 15, color: "var(--text-muted)" }}>{fmtVal(benchmark.value)}</span>
        </div>
        <div style={{ paddingTop: 6, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Alpha</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: diff >= 0 ? "var(--green)" : "var(--red)" }}>
            {diff >= 0 ? "+" : ""}{fmtVal(diff)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PerformanceTab({ client }: { client: Client }) {
  const { fmtCompact, currency, adjReturn } = useCurrency();
  const fmtVal = fmtCompact;
  const [range, setRange] = useState<"6M" | "YTD" | "1Y">("1Y");

  const rawData = range === "6M"
    ? client.monthlyData.slice(-6)
    : client.monthlyData;

  // In ARS mode: revalue each month's USD portfolio value using that month's FX rate
  const data = rawData.map(d => ({
    ...d,
    value:     currency === "ARS" ? d.value     * (MONTHLY_FX[d.month] ?? 1_180) : d.value,
    benchmark: currency === "ARS" ? d.benchmark * (MONTHLY_FX[d.month] ?? 1_180) : d.benchmark,
  }));

  const startVal = data[0].value;
  const endVal = data[data.length - 1].value;
  const totalReturn = ((endVal - startVal) / startVal) * 100;
  const startBench = data[0].benchmark;
  const endBench = data[data.length - 1].benchmark;
  const benchReturn = ((endBench - startBench) / startBench) * 100;
  const alpha = totalReturn - benchReturn;

  const adjVolatility = adjReturn(client.volatility);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats strip */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        }}
      >
        {[
          { label: "Retorno del período", value: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(1)}%`,  color: totalReturn >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Referencia",          value: `${benchReturn >= 0 ? "+" : ""}${benchReturn.toFixed(1)}%`,  color: "var(--text-secondary)" },
          { label: "Alpha",               value: `${alpha >= 0 ? "+" : ""}${alpha.toFixed(1)}%`,              color: alpha >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Volatilidad",         value: `${adjVolatility.toFixed(1)}%`,                               color: "var(--text-primary)" },
          { label: "Caída máxima",        value: `${adjReturn(client.maxDrawdown).toFixed(1)}%`,               color: "var(--red)" },
        ].map((m, i) => (
          <div key={m.label} style={{ padding: "20px 20px", borderRight: i < 4 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: m.color, lineHeight: 1 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              <div style={{ width: 24, height: 2, background: "var(--accent)", borderRadius: 1 }} />
              Portafolio
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              <div style={{ width: 24, height: 2, background: "var(--border)", borderRadius: 1, borderTop: "2px dashed var(--text-muted)" }} />
              Referencia
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["6M", "YTD", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 5, border: "1px solid",
                  borderColor: range === r ? "transparent" : "var(--border)",
                  background: range === r ? "var(--accent)" : "transparent",
                  color: range === r ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="oklch(38% 0.12 250)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="oklch(38% 0.12 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtVal} tick={{ fill: "var(--text-muted)", fontSize: 10.5 }} axisLine={false} tickLine={false} width={62} domain={["dataMin - 50000", "dataMax + 50000"]} />
            <Tooltip content={<CustomTip fmtVal={fmtVal} />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
            <ReferenceLine y={startVal} stroke="var(--border-subtle)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="var(--text-muted)" strokeWidth={1.5} fill="none" strokeDasharray="5 4" dot={false} />
            <Area type="monotone" dataKey="value" name="Portfolio" stroke="var(--accent)" strokeWidth={2} fill="url(#pGrad)" dot={false} activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk-adjusted metrics */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        }}
      >
        {[
          { label: "Ratio de Sharpe", value: client.sharpe.toFixed(2), desc: "Retorno ajustado por riesgo (mayor es mejor)" },
          { label: "Beta",            value: client.beta.toFixed(2),   desc: "Sensibilidad a movimientos del mercado (1.0 = mercado)" },
        ].map((m, i) => (
          <div key={m.label} style={{ padding: "20px 24px", borderRight: i === 0 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 28, color: "var(--text-primary)", marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
