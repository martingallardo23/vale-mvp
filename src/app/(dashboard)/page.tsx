"use client";

import { KpiCard } from "@/components/KpiCard";
import { KpiCardToggle } from "@/components/KpiCardToggle";
import { AumChart } from "@/components/AumChart";
import { ConsolidatedHoldings } from "@/components/ConsolidatedHoldings";
import { useCurrency } from "@/lib/currencyContext";
import { Receipt, TrendingUp, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const { fmtCompact, adjReturnPeriod } = useCurrency();

  const aumUsd     = 17_510_000;
  const billingMtd = 21_888;
  const billingQtd = 63_420;

  const aumLabel        = fmtCompact(aumUsd);
  const billingMtdLabel = fmtCompact(billingMtd);
  const billingQtdLabel = fmtCompact(billingQtd);

  // Base USD returns (portfolio-level weighted averages)
  const retBase = { "30D": 2.1, "MTD": 2.1, "QTD": 4.8, "YTD": 12.5 };
  const refBase = { "30D": 1.3, "MTD": 1.3, "QTD": 2.9, "YTD":  7.3 };
  const aumBadgeBase = 23.3; // YTD AUM growth in USD

  const r = (p: keyof typeof retBase) => {
    const adj = adjReturnPeriod(retBase[p], p);
    return `${adj >= 0 ? "+" : ""}${adj.toFixed(1)}%`;
  };
  const alpha = (p: keyof typeof retBase) => {
    const adjRet = adjReturnPeriod(retBase[p], p);
    const adjRef = adjReturnPeriod(refBase[p], p);
    const a = adjRet - adjRef;
    return `${a >= 0 ? "+" : ""}${a.toFixed(1)}% vs referencia`;
  };
  const aumBadge = () => {
    const adj = adjReturnPeriod(aumBadgeBase, "YTD");
    return `+${adj.toFixed(1)}% YTD`;
  };
  return (
    <>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: 20,
              margin: 0,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            Panel
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            8 de marzo de 2026 · T1 2026 · 8 clientes activos
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "7px 12px",
              cursor: "text",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6.5" cy="6.5" r="5" />
              <path d="M10.5 10.5L14 14" strokeLinecap="round" />
            </svg>
            Buscar clientes…
          </div>
          <button
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#fff",
              background: "var(--accent)",
              border: "none",
              borderRadius: 6,
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            + Nuevo informe
          </button>
        </div>
      </header>

      {/* Page body */}
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

          <KpiCard
            label="AUM Total"
            value={aumLabel}
            badge={aumBadge()}
            badgeVariant="green"
            sub="en 8 clientes"
            icon={<DollarSign size={14} />}
          />

          <KpiCardToggle
            label="Facturación cobrada"
            icon={<Receipt size={14} />}
            defaultPeriod="MTD"
            periods={{
              "30D":  { value: billingMtdLabel, badge: "+8.4% vs 30D ant.", badgeVariant: "green",   sub: "~1.5% comisión anual" },
              "MTD":  { value: billingMtdLabel, badge: "+8.4% vs feb.",     badgeVariant: "green",   sub: "Marzo 2026, mes completo" },
              "QTD":  { value: billingQtdLabel, badge: "+11.2% vs T4 2025", badgeVariant: "green",   sub: "Ene – Mar 2026" },
              "YTD":  { value: billingQtdLabel, badge: "+11.2% vs YTD 2025",badgeVariant: "green",   sub: "Ene – Mar 2026" },
            }}
          />

          <KpiCardToggle
            label="Retorno promedio"
            icon={<TrendingUp size={14} />}
            defaultPeriod="YTD"
            periods={{
              "30D": { value: r("30D"), badge: alpha("30D"), badgeVariant: "green", sub: "ponderado, últimos 30D" },
              "MTD": { value: r("MTD"), badge: alpha("MTD"), badgeVariant: "green", sub: "ponderado, marzo 2026" },
              "QTD": { value: r("QTD"), badge: alpha("QTD"), badgeVariant: "green", sub: "ponderado, T1 2026" },
              "YTD": { value: r("YTD"), badge: alpha("YTD"), badgeVariant: "green", sub: "ponderado, ene – mar 2026" },
            }}
          />

        </div>
        <AumChart />
        <ConsolidatedHoldings />
      </div>
    </>
  );
}
