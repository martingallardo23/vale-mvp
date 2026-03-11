"use client";

import { KpiCard } from "@/components/KpiCard";
import { KpiCardToggle } from "@/components/KpiCardToggle";
import { ConsolidatedHoldings } from "@/components/ConsolidatedHoldings";
import { useCurrency } from "@/lib/currencyContext";
import Link from "next/link";
import { Receipt, TrendingUp, DollarSign, Sparkles, ArrowRight, Clock, User, CheckCircle2, Calendar } from "lucide-react";

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
        {/* News brief + Agenda */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, alignItems: "start" }}>

          {/* Noticia del día */}
          <style>{`
            @keyframes ai-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.3; transform: scale(0.7); }
            }
            @keyframes ai-ring {
              0%   { transform: scale(1);   opacity: 0.6; }
              100% { transform: scale(2.2); opacity: 0; }
            }
          `}</style>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={12} color="#fff" />
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Resumen IA
                </div>
                {/* Live pulse indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ position: "relative", width: 8, height: 8 }}>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: "var(--accent)",
                      animation: "ai-ring 1.6s ease-out infinite",
                    }} />
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: "var(--accent)",
                      animation: "ai-pulse 1.6s ease-in-out infinite",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Live
                  </span>
                </div>
              </div>
              <Link
                href="/research"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--accent)", textDecoration: "none", fontWeight: 500, flexShrink: 0 }}
              >
                Ver Research <ArrowRight size={11} />
              </Link>
            </div>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>
                Escalada geopolítica EE.UU.–Irán dispara el petróleo a $100–110 y reaviva temores inflacionarios globales
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  "Bolsas europeas caen ~2%; bonos soberanos se desploman con yields al alza. Dólar se fortalece vs. euro/yen.",
                  "Energéticas (YPF, Pampa) en foco positivo. Bonos emergentes bajo presión — revisar clientes con duration larga.",
                  "Fed y BCE postergan recortes de tasas: operadores descuentan sólo 11% de probabilidad de baja en marzo.",
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{b}</span>
                  </div>
                ))}
              </div>
              {/* Market snapshot */}
              <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                {[
                  { ticker: "S&P 500",  price: "5,614",  chg: "+0.38%",  up: true  },
                  { ticker: "WTI",      price: "$104.2",  chg: "+3.91%",  up: true  },
                  { ticker: "BTC",      price: "$82,410", chg: "-1.24%",  up: false },
                  { ticker: "UST 10Y",  price: "4.71%",  chg: "+8 bps",  up: false },
                  { ticker: "DXY",      price: "105.3",  chg: "+0.52%",  up: true  },
                ].map((m, i, arr) => (
                  <div key={m.ticker} style={{
                    flex: 1,
                    padding: "0 12px",
                    borderRight: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    display: "flex", flexDirection: "column", gap: 3,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{m.ticker}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{m.price}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: m.up ? "var(--green)" : "var(--red)" }}>{m.chg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda del día */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Agenda · Hoy
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { time: "09:30", label: "Revisión semestral", client: "Valentina Rodríguez", type: "meeting", done: false },
                { time: "11:00", label: "Llamada de seguimiento", client: "Facundo Morales", type: "call", done: false },
                { time: "12:00", label: "Enviar reporte T1", client: "Carlos Suárez", type: "task", done: true },
                { time: "15:30", label: "Presentación portafolio", client: "Alejandra Vega", type: "meeting", done: false },
                { time: "17:00", label: "Revisión anual IPS", client: "Matías Herrera", type: "meeting", done: false },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 18px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    opacity: item.done ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, width: 36 }}>
                    <Clock size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1 }}>{item.time}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: item.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.done ? "line-through" : "none", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <User size={9} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.client}</span>
                    </div>
                  </div>
                  {item.done
                    ? <CheckCircle2 size={13} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                    : <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.type === "meeting" ? "var(--accent)" : item.type === "call" ? "var(--green)" : "var(--amber)", flexShrink: 0, marginTop: 4 }} />
                  }
                </div>
              ))}
            </div>
          </div>

        </div>
        <ConsolidatedHoldings />
      </div>
    </>
  );
}
