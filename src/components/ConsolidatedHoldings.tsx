"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { SlidersHorizontal } from "lucide-react";
import { clients, getLiquidityBreakdown } from "@/lib/clientData";
import { useCurrency } from "@/lib/currencyContext";

const TOTAL_AUM = clients.reduce((s, c) => s + c.aum, 0);

interface ClientSlice {
  id: string;
  firstName: string;
  value: number;
  weight: number;
}

interface AggregatedPosition {
  ticker: string;
  name: string;
  type: string;
  clientSlices: ClientSlice[];
  totalValue: number;
  bookWeight: number;
  avgGainLossPct: number;
  maxClientConcentration: number;
  topClientName: string;
}

function buildConsolidated(): AggregatedPosition[] {
  const map = new Map<string, {
    name: string; type: string;
    clientSlices: ClientSlice[];
    totalValue: number;
    weightedGain: number;
    maxClientConcentration: number;
    topClientName: string;
  }>();

  for (const client of clients) {
    for (const pos of client.positions) {
      const existing = map.get(pos.ticker);
      const slice: ClientSlice = {
        id: client.id,
        firstName: client.name.split(" ")[0],
        value: pos.value,
        weight: pos.weight,
      };
      if (existing) {
        existing.totalValue += pos.value;
        existing.weightedGain += pos.value * pos.gainLossPct;
        existing.clientSlices.push(slice);
        if (pos.weight > existing.maxClientConcentration) {
          existing.maxClientConcentration = pos.weight;
          existing.topClientName = client.name.split(" ")[0];
        }
      } else {
        map.set(pos.ticker, {
          name: pos.name,
          type: pos.type,
          clientSlices: [slice],
          totalValue: pos.value,
          weightedGain: pos.value * pos.gainLossPct,
          maxClientConcentration: pos.weight,
          topClientName: client.name.split(" ")[0],
        });
      }
    }
  }

  return Array.from(map.entries()).map(([ticker, d]) => ({
    ticker,
    name: d.name,
    type: d.type,
    clientSlices: d.clientSlices,
    totalValue: d.totalValue,
    bookWeight: (d.totalValue / TOTAL_AUM) * 100,
    avgGainLossPct: d.weightedGain / d.totalValue,
    maxClientConcentration: d.maxClientConcentration,
    topClientName: d.topClientName,
  }));
}

// ── Column system ──────────────────────────────────────────────────────────────

type ColId = "bookValue" | "bookWeight" | "gainLoss" | "numClients" | "maxConc" | "exposure";
type SortKey = "ticker" | "totalValue" | "bookWeight" | "avgGainLossPct" | "clients" | "maxConc";

const ALL_COLS: { id: ColId; label: string; sortKey?: SortKey; align: "left" | "right" }[] = [
  { id: "bookValue",  label: "Valor en libro",   sortKey: "totalValue",     align: "right" },
  { id: "bookWeight", label: "% del libro",       sortKey: "bookWeight",     align: "right" },
  { id: "gainLoss",   label: "Retorno vs costo",  sortKey: "avgGainLossPct", align: "right" },
  { id: "numClients", label: "Nº clientes",       sortKey: "clients",        align: "right" },
  { id: "maxConc",    label: "Retorno",           sortKey: "avgGainLossPct", align: "right" },
  { id: "exposure",   label: "Clientes",          sortKey: undefined,        align: "left"  },
];

const DEFAULT_COLS: ColId[] = ["bookValue", "maxConc", "exposure"];
const LS_KEY = "consolidated_cols_v2";

function loadCols(): ColId[] {
  if (typeof window === "undefined") return DEFAULT_COLS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_COLS;
    const parsed: ColId[] = JSON.parse(raw);
    const valid = parsed.filter(id => ALL_COLS.some(c => c.id === id));
    return valid.length ? valid : DEFAULT_COLS;
  } catch { return DEFAULT_COLS; }
}

// ── Colors ────────────────────────────────────────────────────────────────────

const CLIENT_COLORS = [
  "oklch(50% 0.18 265)",
  "oklch(55% 0.16 195)",
  "oklch(52% 0.14 155)",
  "oklch(58% 0.16 60)",
  "oklch(56% 0.17 320)",
  "oklch(54% 0.15 30)",
  "oklch(60% 0.14 280)",
  "oklch(57% 0.13 100)",
];

const TYPE_COLOR: Record<string, string> = {
  "Renta Variable": "oklch(50% 0.18 265)",
  "Renta Fija":     "oklch(52% 0.14 155)",
  "FCI":            "oklch(58% 0.16 60)",
  "Efectivo":       "oklch(70% 0.05 240)",
  "Opciones":       "oklch(62% 0.18 320)",
  "Otro":           "oklch(62% 0.08 290)",
};

const displayType = (type: string) => type === "Dólar" ? "Efectivo" : type;

function pillStyle(weight: number): { bg: string; color: string; border: string } {
  if (weight >= 40) return { bg: "var(--red-light)",   color: "var(--red)",   border: "var(--red)" };
  if (weight >= 20) return { bg: "var(--amber-light)", color: "var(--amber)", border: "var(--amber)" };
  return              { bg: "var(--accent-light)",  color: "var(--accent)", border: "var(--accent)" };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConsolidatedHoldings() {
  const { fmtCompact, adjReturn } = useCurrency();
  const fmtVal = fmtCompact;

  const [sortBy, setSortBy]               = useState<SortKey>("totalValue");
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("desc");
  const [sectorFilter, setSectorFilter]   = useState<string>("All");
  const [expanded, setExpanded]           = useState<Set<string>>(new Set());
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [hoveredExpand, setHoveredExpand] = useState<string | null>(null);
  const [chartView, setChartView]         = useState<"sector" | "asset" | "client">("sector");
  const [activeSlice, setActiveSlice]     = useState<number | null>(null);
  const [cols, setCols]                   = useState<ColId[]>(loadCols);
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [hoveredTh, setHoveredTh]         = useState<SortKey | null>(null);
  const pickerRef                         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleCol = (id: ColId) => {
    setCols(prev => {
      const next = prev.includes(id)
        ? prev.filter(c => c !== id)
        : ALL_COLS.filter(c => prev.includes(c.id) || c.id === id).map(c => c.id);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleExpand = (ticker: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });

  const allRows = useMemo(() => buildConsolidated(), []);

  const chartData = useMemo(() => {
    if (chartView === "sector") {
      const map = new Map<string, number>();
      for (const row of allRows) {
        const key = displayType(row.type);
        map.set(key, (map.get(key) ?? 0) + row.totalValue);
      }
      return Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          value,
          pct: (value / TOTAL_AUM) * 100,
          color: TYPE_COLOR[name] ?? "oklch(65% 0.05 240)",
        }))
        .sort((a, b) => b.value - a.value);
    } else if (chartView === "asset") {
      const sorted = allRows.slice().sort((a, b) => b.totalValue - a.totalValue);
      const top    = sorted.slice(0, 9);
      const rest   = sorted.slice(9);
      const items  = top.map(r => ({
        name:  r.ticker,
        value: r.totalValue,
        pct:   r.bookWeight,
        color: TYPE_COLOR[r.type] ?? "oklch(60% 0.08 240)",
      }));
      const otherVal = rest.reduce((s, r) => s + r.totalValue, 0);
      if (otherVal > 0) items.push({ name: "Other", value: otherVal, pct: (otherVal / TOTAL_AUM) * 100, color: "oklch(82% 0.005 240)" });
      return items;
    } else {
      return clients
        .slice()
        .sort((a, b) => b.aum - a.aum)
        .map((c, i) => ({
          name:  c.name.split(" ")[0] + " " + c.name.split(" ")[1]?.[0] + ".",
          value: c.aum,
          pct:   (c.aum / TOTAL_AUM) * 100,
          color: CLIENT_COLORS[i % CLIENT_COLORS.length],
        }));
    }
  }, [allRows, chartView]);

  const sectors = useMemo(() => {
    const s = new Set(allRows.map(r => displayType(r.type)));
    return ["All", ...Array.from(s).sort()];
  }, [allRows]);

  const rows = useMemo(() => {
    const filtered = sectorFilter === "All" ? allRows : allRows.filter(r => displayType(r.type) === sectorFilter);
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if      (sortBy === "ticker")         cmp = a.ticker.localeCompare(b.ticker);
      else if (sortBy === "clients")        cmp = a.clientSlices.length - b.clientSlices.length;
      else if (sortBy === "totalValue")     cmp = a.totalValue - b.totalValue;
      else if (sortBy === "bookWeight")     cmp = a.bookWeight - b.bookWeight;
      else if (sortBy === "avgGainLossPct") cmp = a.avgGainLossPct - b.avgGainLossPct;
      else if (sortBy === "maxConc")        cmp = a.maxClientConcentration - b.maxClientConcentration;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [allRows, sortBy, sortDir, sectorFilter]);

  const totalExposure = allRows.reduce((s, r) => s + r.totalValue, 0);
  const uniqueSectors = new Set(allRows.map(r => r.type)).size;

  const handleSort = (col: SortKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const Th = ({ label, col, align = "left" }: { label: string; col?: SortKey; align?: "left" | "right" }) => {
    const isActive  = col && sortBy === col;
    const isHovered = col && hoveredTh === col && !isActive;
    return (
      <th
        onClick={col ? () => handleSort(col) : undefined}
        onMouseEnter={col ? () => setHoveredTh(col) : undefined}
        onMouseLeave={col ? () => setHoveredTh(null) : undefined}
        style={{
          padding: "10px 20px",
          textAlign: align,
          fontSize: 10.5,
          fontWeight: 600,
          color: isActive ? "var(--accent)" : isHovered ? "var(--text-secondary)" : "var(--text-muted)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-raised)",
          cursor: col ? "pointer" : "default",
          userSelect: "none",
          whiteSpace: "nowrap",
          transition: "color 0.12s",
        }}
      >
        {label}
        {col && sortBy === col && (
          <span style={{ marginLeft: 3, opacity: 0.6 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </th>
    );
  };

  // Active column definitions in ALL_COLS order
  const activeCols = ALL_COLS.filter(c => cols.includes(c.id));

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>

      {/* Top section: [title + stats | chart] */}
      {(() => {
        const top5conc  = allRows.slice().sort((a, b) => b.bookWeight - a.bookWeight).slice(0, 5).reduce((s, r) => s + r.bookWeight, 0);
        const tv        = rows.reduce((s, r) => s + r.totalValue, 0);
        const wg        = rows.reduce((s, r) => s + r.avgGainLossPct * r.totalValue, 0);
        const avg       = tv ? wg / tv : 0;
        const liq       = getLiquidityBreakdown(clients.flatMap(c => c.positions));
        const liqPctColor = liq.liquidPct >= 10 ? "var(--green)" : liq.liquidPct >= 5 ? "var(--amber)" : "var(--red)";

        const stats = [
          { label: "Concentración top 5", value: `${top5conc.toFixed(1)}%`,           sub: "del libro en las 5 posiciones más grandes", valueColor: top5conc > 60 ? "var(--red)" : top5conc > 45 ? "var(--amber)" : "var(--text-primary)" },
          { label: "Liquidez disponible", value: fmtVal(liq.liquid),                   sub: `${liq.liquidPct.toFixed(1)}% del AUM · T+0: ${fmtVal(liq.immediate)} · T+1–5: ${fmtVal(liq.near)}`, valueColor: liqPctColor },
          { label: "Retorno vs costo",    value: `${adjReturn(avg) >= 0 ? "+" : ""}${adjReturn(avg).toFixed(1)}%`, sub: "ponderado · vista filtrada", valueColor: adjReturn(avg) >= 0 ? "var(--green)" : "var(--red)" },
        ];

        return (
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

              {/* Title + sector pills + column picker */}
              <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, color: "var(--text-primary)", lineHeight: 1 }}>
                    Posiciones consolidadas
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>
                    {allRows.length} activos únicos · {uniqueSectors} tipos · {fmtCompact(totalExposure)} exposición total
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {sectors.map(s => {
                    const isActive  = sectorFilter === s;
                    const isHov     = hoveredSector === s && !isActive;
                    return (
                      <button
                        key={s}
                        onClick={() => setSectorFilter(s)}
                        onMouseEnter={() => setHoveredSector(s)}
                        onMouseLeave={() => setHoveredSector(null)}
                        style={{
                          fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20, border: "1px solid",
                          borderColor: isActive || isHov ? "var(--accent)" : "var(--border)",
                          background:  isActive || isHov ? "var(--accent-light)" : "transparent",
                          color:       isActive || isHov ? "var(--accent)" : "var(--text-muted)",
                          cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.12s, color 0.12s, border-color 0.12s",
                        }}
                      >{s}</button>
                    );
                  })}

                </div>
              </div>

              {/* 3 stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flex: 1 }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{ padding: "14px 20px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 5 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, lineHeight: 1, color: stat.valueColor ?? "var(--text-primary)" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: chart */}
            <div style={{ width: 380, flexShrink: 0, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 16px", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexShrink: 0 }}>
                {([["sector", "Tipo"], ["asset", "Activo"], ["client", "Cliente"]] as const).map(([v, label]) => {
                  const isAct = chartView === v;
                  const isHov = hoveredSector === ("toggle-" + v);
                  return (
                    <button key={v}
                      onClick={() => { setChartView(v); setActiveSlice(null); }}
                      onMouseEnter={() => setHoveredSector("toggle-" + v)}
                      onMouseLeave={() => setHoveredSector(null)}
                      style={{
                        fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, border: "1px solid",
                        borderColor: isAct || isHov ? "var(--accent)" : "var(--border)",
                        background:  isAct || isHov ? "var(--accent-light)" : "transparent",
                        color:       isAct || isHov ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer", transition: "all 0.12s",
                      }}
                    >{label}</button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 4, height: 148, flexShrink: 0 }}>
                <div style={{ width: 148, height: 148, flexShrink: 0, position: "relative" }}>
                  <ResponsiveContainer width="100%" height={148}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={62}
                        paddingAngle={2} dataKey="value"
                        isAnimationActive={false}
                        onMouseEnter={(_, index) => setActiveSlice(index)}
                        onMouseLeave={() => setActiveSlice(null)}
                        strokeWidth={0}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.color}
                            opacity={activeSlice === null || activeSlice === index ? 1 : 0.3}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{d.name}</div>
                            <div style={{ color: "var(--text-muted)" }}>{fmtVal(d.value)} · <strong style={{ color: "var(--text-primary)" }}>{d.pct.toFixed(1)}%</strong> del AUM</div>
                          </div>
                        );
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: 74, left: 74, transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", width: 70 }}>
                    {activeSlice !== null ? (
                      <>
                        <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 14, color: "var(--text-primary)", lineHeight: 1 }}>{chartData[activeSlice]?.pct.toFixed(1)}%</div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.3 }}>{chartData[activeSlice]?.name}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1 }}>{chartData.length}</div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 2 }}>{chartView === "sector" ? "tipos" : chartView === "asset" ? "activos" : "clientes"}</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, paddingLeft: 4 }}>
                  {chartData.map((d, i) => (
                    <div key={d.name}
                      onMouseEnter={() => setActiveSlice(i)}
                      onMouseLeave={() => setActiveSlice(null)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 5,
                        cursor: "default", flexShrink: 0,
                        background: activeSlice === i ? "var(--surface-raised)" : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", flexShrink: 0 }}>{d.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 220 }} />
            {activeCols.map(c => (
              <col key={c.id} style={{ width: c.id === "exposure" ? undefined : c.id === "maxConc" ? 180 : 150 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <Th label="Activo" col="ticker" align="left" />
              {activeCols.map(c => (
                <Th key={c.id} label={c.label} col={c.sortKey} align={c.align} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const sectorColor = TYPE_COLOR[r.type] ?? "var(--text-muted)";
              return (
                <tr
                  key={r.ticker}
                  className="holdings-row"
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                >
                  {/* Asset — always shown */}
                  <td style={{ padding: "13px 20px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <Link
                        href={`/assets/${encodeURIComponent(r.ticker)}`}
                        style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.02em", whiteSpace: "nowrap", textDecoration: "none" }}
                      >{r.ticker}</Link>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                        background: "var(--surface)",
                        color: sectorColor,
                        border: `1px solid color-mix(in srgb, ${sectorColor} 35%, transparent)`,
                        whiteSpace: "nowrap",
                      }}>{r.type}</span>
                    </div>
                    <Link
                      href={`/assets/${encodeURIComponent(r.ticker)}`}
                      style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", textDecoration: "none" }}
                    >{r.name}</Link>
                  </td>

                  {activeCols.map(col => {
                    if (col.id === "bookValue") return (
                      <td key="bookValue" style={{ padding: "13px 20px", textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1 }}>
                          {fmtVal(r.totalValue)}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginTop: 4 }}>
                          {r.bookWeight.toFixed(1)}% del libro
                        </div>
                      </td>
                    );

                    if (col.id === "bookWeight") return (
                      <td key="bookWeight" style={{ padding: "13px 20px", textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)", lineHeight: 1 }}>
                          {r.bookWeight.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{fmtVal(r.totalValue)}</div>
                      </td>
                    );

                    if (col.id === "gainLoss") return (
                      <td key="gainLoss" style={{ padding: "13px 20px", textAlign: "right" }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: adjReturn(r.avgGainLossPct) >= 0 ? "var(--green)" : "var(--red)",
                        }}>
                          {adjReturn(r.avgGainLossPct) >= 0 ? "+" : ""}{adjReturn(r.avgGainLossPct).toFixed(1)}%
                        </span>
                      </td>
                    );

                    if (col.id === "numClients") return (
                      <td key="numClients" style={{ padding: "13px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 24, height: 24, borderRadius: "50%",
                            background: r.clientSlices.length >= 4 ? "var(--accent)" : r.clientSlices.length >= 2 ? "var(--accent-light)" : "var(--surface-raised)",
                            color: r.clientSlices.length >= 4 ? "#fff" : "var(--accent)",
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {r.clientSlices.length}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
                          de {clients.length} clientes
                        </div>
                      </td>
                    );

                    if (col.id === "maxConc") return (
                      <td key="maxConc" style={{ padding: "13px 20px", textAlign: "right" }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: adjReturn(r.avgGainLossPct) >= 0 ? "var(--green)" : "var(--red)",
                        }}>
                          {adjReturn(r.avgGainLossPct) >= 0 ? "+" : ""}{adjReturn(r.avgGainLossPct).toFixed(1)}%
                        </span>
                      </td>
                    );

                    if (col.id === "exposure") return (
                      <td key="exposure" style={{ padding: "13px 20px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                          {(() => {
                            const sorted  = r.clientSlices.slice().sort((a, b) => b.weight - a.weight);
                            const visible = sorted.slice(0, 3);
                            const hidden  = sorted.length - 3;
                            return (
                              <>
                                {visible.map((s) => {
                                  const ps = pillStyle(s.weight);
                                  return (
                                    <span
                                      key={s.id}
                                      title={`${s.firstName}: ${fmtVal(s.value)} total`}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: 4,
                                        fontSize: 11, padding: "3px 8px", borderRadius: 20,
                                        background: "var(--surface)",
                                        color: ps.color,
                                        border: `1px solid color-mix(in srgb, ${ps.border} 30%, transparent)`,
                                        fontWeight: 500, whiteSpace: "nowrap", cursor: "default",
                                      }}
                                    >
                                      {s.firstName}
                                      <span style={{ opacity: 0.75, fontWeight: 400 }}>·</span>
                                      <span style={{ fontWeight: 700 }}>{s.weight.toFixed(1)}%</span>
                                    </span>
                                  );
                                })}
                                {hidden > 0 && (
                                  <span style={{
                                    display: "inline-flex", alignItems: "center",
                                    fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
                                    background: "var(--surface)", color: "var(--text-muted)",
                                    border: "1px solid var(--border)", whiteSpace: "nowrap", cursor: "default",
                                  }}>
                                    +{hidden} clientes
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    );

                    return null;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 20 }}>
        <span>% del libro = proporción del AUM total del asesor ({fmtVal(TOTAL_AUM)})</span>
        <span>Retorno vs costo = promedio ponderado de ganancia/pérdida no realizada</span>
        <span>% cliente = peso de este activo en el portafolio de cada cliente · <span style={{ color: "var(--red)" }}>rojo ≥ 40%</span> · <span style={{ color: "var(--amber)" }}>naranja ≥ 20%</span> · <span style={{ color: "var(--accent)" }}>azul &lt; 20%</span></span>
      </div>
    </div>
  );
}
