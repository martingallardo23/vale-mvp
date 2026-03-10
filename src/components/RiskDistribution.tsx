"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/lib/currencyContext";

const tiersBase = [
  { name: "Moderado",     clients: 3, aum: 7400000,  hex: "oklch(38% 0.12 250)" },
  { name: "Agresivo",     clients: 3, aum: 6600000,  hex: "oklch(52% 0.16 25)" },
  { name: "Conservador",  clients: 2, aum: 1610000,  hex: "oklch(60% 0.010 240)" },
];

interface TipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { clients: number } }>;
  fmtC: (v: number) => string;
}

function CustomTooltip({ active, payload, fmtC }: TipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 16px oklch(0% 0 0 / 0.08)",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{p.name}</div>
      <div style={{ color: "var(--text-muted)" }}>{p.payload.clients} clientes</div>
      <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-serif)", fontSize: 14, marginTop: 2 }}>
        {fmtC(p.value)}
      </div>
    </div>
  );
}

export function RiskDistribution() {
  const { fmtCompact } = useCurrency();
  const tiers = tiersBase;
  const total = tiers.reduce((s, t) => s + t.aum, 0);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
        AUM por nivel de riesgo
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <PieChart>
          <Pie
            data={tiers}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            paddingAngle={3}
            dataKey="aum"
            nameKey="name"
            strokeWidth={0}
          >
            {tiers.map((t) => (
              <Cell key={t.name} fill={t.hex} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip fmtC={fmtCompact} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {tiers.map((t) => {
          const pct = ((t.aum / total) * 100).toFixed(1);
          return (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: t.hex,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{t.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-dm-serif)" }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                  {t.clients} clientes · {fmtCompact(t.aum)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
