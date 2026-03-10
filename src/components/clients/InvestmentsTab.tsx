"use client";

import { useState } from "react";
import type { Client } from "@/lib/clientData";
import { PortfolioTab }   from "./PortfolioTab";
import { PerformanceTab } from "./PerformanceTab";
import { TradesTab }      from "./TradesTab";

type SubTab = "positions" | "performance" | "trades";

const subTabs: { id: SubTab; label: string }[] = [
  { id: "positions",   label: "Posiciones" },
  { id: "performance", label: "Rendimiento" },
  { id: "trades",      label: "Operaciones" },
];

export function InvestmentsTab({ client }: { client: Client }) {
  const [sub, setSub] = useState<SubTab>("positions");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 9,
          padding: 4,
          alignSelf: "flex-start",
        }}
      >
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            style={{
              fontSize: 12.5,
              fontWeight: sub === t.id ? 600 : 400,
              padding: "5px 14px",
              borderRadius: 6,
              border: "none",
              background: sub === t.id ? "var(--surface)" : "transparent",
              color: sub === t.id ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
              boxShadow: sub === t.id ? "0 1px 3px oklch(0% 0 0 / 0.08)" : "none",
              transition: "background 0.12s, color 0.12s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "positions"   && <PortfolioTab   client={client} />}
      {sub === "performance" && <PerformanceTab client={client} />}
      {sub === "trades"      && <TradesTab      client={client} />}
    </div>
  );
}
