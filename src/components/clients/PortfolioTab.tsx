"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Client } from "@/lib/clientData";
import { getLiquidityBreakdown } from "@/lib/clientData";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/lib/currencyContext";
import { SlidersHorizontal, Check } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  "Renta Variable": "oklch(52% 0.18 265)",
  "Renta Fija":     "oklch(55% 0.14 150)",
  "FCI":            "oklch(58% 0.16 60)",
  "Efectivo":       "oklch(70% 0.04 240)",
  "Opciones":       "oklch(62% 0.18 320)",
  "Otro":           "oklch(62% 0.08 290)",
};

// Treat "Dólar" (MEP/CCL/Cable) as cash for grouping purposes
const displayType = (type: string) => type === "Dólar" ? "Efectivo" : type;
const isCash = (type: string) => type === "Efectivo" || type === "Dólar";

const DEFAULT_COLOR = "oklch(55% 0.10 240)";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { weight: number } }>;
}

function CustomTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ color: "var(--text-muted)" }}>{payload[0].payload.weight.toFixed(1)}% del portafolio</div>
    </div>
  );
}

/** Contextual rate / return metric for Argentine taxonomy */
function RateCell({ p, adjReturn }: { p: Client["positions"][number]; adjReturn: (pct: number, type?: import("@/lib/clientData").AssetType) => number }) {
  if (p.type === "Renta Fija") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
        {p.tna !== undefined && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>
            TNA {p.tna.toFixed(2)}%
          </span>
        )}
        {p.tea !== undefined && (
          <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
            TEA {p.tea.toFixed(2)}%
          </span>
        )}
      </div>
    );
  }
  if (p.type === "FCI") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
        {p.return7d !== undefined && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>
            7D {p.return7d.toFixed(1)}%
          </span>
        )}
        {p.return30d !== undefined && (
          <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
            30D {p.return30d.toFixed(1)}%
          </span>
        )}
      </div>
    );
  }
  if (p.type === "Efectivo") {
    return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  }
  if (p.type === "Dólar") {
    const adj = adjReturn(p.gainLossPct, p.type);
    return (
      <span style={{ fontSize: 12.5, fontWeight: 500, color: adj >= 0 ? "var(--green)" : "var(--red)" }}>
        {adj >= 0 ? "+" : ""}{adj.toFixed(1)}%
      </span>
    );
  }
  const adj = adjReturn(p.gainLossPct, p.type);
  return (
    <span style={{ fontSize: 12.5, fontWeight: 500, color: adj >= 0 ? "var(--green)" : "var(--red)" }}>
      {adj >= 0 ? "+" : ""}{adj.toFixed(1)}%
    </span>
  );
}

/** Sub-text for name cell depending on type */
function NameSub({ p }: { p: Client["positions"][number] }) {
  if (p.type === "Renta Fija") {
    const parts: string[] = [p.sector];
    if (p.duration !== undefined) parts.push(`Dur. ${p.duration.toFixed(1)}a`);
    if (p.maturityDate) parts.push(`Venc. ${p.maturityDate}`);
    return <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{parts.join(" · ")}</div>;
  }
  if (p.type === "FCI") {
    const fciLabels = { MM: "Money Market", RF: "Renta Fija", RV: "Renta Variable", Mixto: "Mixto" };
    const label = p.fciType ? fciLabels[p.fciType] : p.sector;
    return <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>FCI · {label}</div>;
  }
  if (p.type === "Dólar" && p.dollarType) {
    return <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Dólar {p.dollarType}</div>;
  }
  return <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{p.sector}</div>;
}

// ── Column definitions ──────────────────────────────────────────────────────
type ColId = "ticker" | "activo" | "acciones" | "precio" | "valor" | "tasa" | "peso";

const ALL_COLS: { id: ColId; label: string }[] = [
  { id: "ticker",   label: "Ticker" },
  { id: "activo",   label: "Activo" },
  { id: "acciones", label: "Acciones" },
  { id: "precio",   label: "Precio" },
  { id: "valor",    label: "Valor" },
  { id: "tasa",     label: "Tasa / Retorno" },
  { id: "peso",     label: "Peso" },
];

const DEFAULT_COLS: ColId[] = ["ticker", "activo", "acciones", "valor", "tasa"];
const LS_KEY = "portfolio_columns_v1";

function loadCols(): ColId[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ColId[];
      // Validate: only known ids, keep order from ALL_COLS
      const valid = ALL_COLS.map(c => c.id).filter(id => parsed.includes(id));
      if (valid.length > 0) return valid;
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS;
}

export function PortfolioTab({ client }: { client: Client }) {
  const { fmtCompact, adjReturn } = useCurrency();
  const [visibleCols, setVisibleCols] = useState<ColId[]>(DEFAULT_COLS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setVisibleCols(loadCols());
  }, []);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  function toggleCol(id: ColId) {
    setVisibleCols(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      // Preserve ALL_COLS order
      const ordered = ALL_COLS.map(c => c.id).filter(c => next.includes(c));
      localStorage.setItem(LS_KEY, JSON.stringify(ordered));
      return ordered;
    });
  }

  const typeMap = client.positions.reduce((acc, p) => {
    const key = displayType(p.type);
    acc[key] = (acc[key] ?? 0) + p.value;
    return acc;
  }, {} as Record<string, number>);
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const liq = getLiquidityBreakdown(client.positions);

  // Ordered visible columns for rendering
  const cols = ALL_COLS.filter(c => visibleCols.includes(c.id));
  const isRight = (id: ColId) => !["ticker", "activo"].includes(id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary bar + donut side by side */}
      <div
        style={{
          display: "flex",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        }}
      >
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flex: 1 }}>
          <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Valor total</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "var(--text-primary)" }}>{fmtCompact(client.aum)}</div>
          </div>
          <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Posiciones</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "var(--text-primary)" }}>{client.positions.filter(p => !isCash(p.type)).length} activos</div>
          </div>
          <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Liquidez disponible</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6 }}>
              {fmtCompact(liq.liquid)}
              <span style={{ fontFamily: "inherit", fontSize: 14, color: liq.liquidPct >= 10 ? "var(--green)" : liq.liquidPct >= 5 ? "var(--amber)" : "var(--red)", marginLeft: 8 }}>
                {liq.liquidPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: "oklch(55% 0.18 155)", marginRight: 4, verticalAlign: "middle" }} />
                T+0 <strong style={{ color: "var(--text-secondary)" }}>{fmtCompact(liq.immediate)}</strong>
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: "oklch(58% 0.16 200)", marginRight: 4, verticalAlign: "middle" }} />
                T+1–5 <strong style={{ color: "var(--text-secondary)" }}>{fmtCompact(liq.near)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value" nameKey="name" strokeWidth={0} isAnimationActive={false}>
                {typeData.map((s) => (
                  <Cell key={s.name} fill={TYPE_COLORS[s.name] ?? DEFAULT_COLOR} />
                ))}
              </Pie>
              <Tooltip content={<CustomTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {typeData.sort((a, b) => b.value - a.value).map((s) => {
              const pct = ((s.value / client.aum) * 100).toFixed(1);
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: TYPE_COLORS[s.name] ?? DEFAULT_COLOR, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{s.name}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-primary)", marginLeft: 4 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings table — full width */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {/* Table header row */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Posiciones</div>

          {/* Column picker */}
          <div style={{ position: "relative" }} ref={pickerRef}>
            <button
              onClick={() => setPickerOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 500, color: pickerOpen ? "var(--accent)" : "var(--text-muted)",
                background: pickerOpen ? "var(--accent-light)" : "transparent",
                border: "1px solid", borderColor: pickerOpen ? "var(--accent)" : "var(--border)",
                borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                transition: "color 0.12s, background 0.12s, border-color 0.12s",
              }}
            >
              <SlidersHorizontal size={12} />
              Columnas
            </button>

            {pickerOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 9, padding: "6px", minWidth: 170,
                  boxShadow: "0 4px 16px oklch(0% 0 0 / 0.10)",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px 8px" }}>
                  Mostrar columnas
                </div>
                {ALL_COLS.map(col => {
                  const active = visibleCols.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleCol(col.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "7px 8px", borderRadius: 6,
                        border: "none", background: "transparent", cursor: "pointer",
                        fontSize: 12.5, color: active ? "var(--text-primary)" : "var(--text-muted)",
                        fontWeight: active ? 500 : 400,
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-raised)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {col.label}
                      {active && <Check size={11} color="var(--accent)" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-raised)" }}>
              {cols.map(col => (
                <th
                  key={col.id}
                  style={{
                    padding: "9px 16px",
                    textAlign: isRight(col.id) ? "right" : "left",
                    fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    borderBottom: "1px solid var(--border)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {client.positions.map((p, i) => (
              <tr key={p.ticker} style={{ borderBottom: i < client.positions.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                {visibleCols.includes("ticker") && (
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Link
                        href={`/assets/${encodeURIComponent(p.ticker)}`}
                        style={{ fontSize: 12.5, fontWeight: 700, color: isCash(p.type) ? "var(--text-muted)" : "var(--accent)", textDecoration: "none" }}
                      >
                        {p.ticker}
                      </Link>
                      <span style={{ fontSize: 10, fontWeight: 600, color: TYPE_COLORS[p.type] ?? DEFAULT_COLOR, letterSpacing: "0.04em" }}>
                        {p.type}
                      </span>
                    </div>
                  </td>
                )}
                {visibleCols.includes("activo") && (
                  <td style={{ padding: "12px 16px" }}>
                    <Link
                      href={`/assets/${encodeURIComponent(p.ticker)}`}
                      style={{ fontSize: 12.5, color: "var(--text-primary)", textDecoration: "none", display: "block" }}
                    >
                      {p.name}
                    </Link>
                    <NameSub p={p} />
                  </td>
                )}
                {visibleCols.includes("acciones") && (
                  <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {isCash(p.type) || p.type === "FCI" ? "—" : p.shares.toLocaleString()}
                  </td>
                )}
                {visibleCols.includes("precio") && (
                  <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {isCash(p.type) || p.type === "FCI" ? "—" : `$${fmt(p.currentPrice)}`}
                  </td>
                )}
                {visibleCols.includes("valor") && (
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 14, color: "var(--text-primary)" }}>
                      {fmtCompact(p.value)}
                    </span>
                  </td>
                )}
                {visibleCols.includes("tasa") && (
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <RateCell p={p} adjReturn={adjReturn} />
                  </td>
                )}
                {visibleCols.includes("peso") && (
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <div style={{ width: 48, height: 3, borderRadius: 2, background: "var(--border)" }}>
                        <div style={{ width: `${Math.min((p.weight / 50) * 100, 100)}%`, height: "100%", background: TYPE_COLORS[p.type] ?? DEFAULT_COLOR, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11.5, color: "var(--text-secondary)", minWidth: 32, textAlign: "right" }}>{p.weight.toFixed(1)}%</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
