"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Client } from "@/lib/clientData";
import { useCurrency } from "@/lib/currencyContext";
import { Printer, ArrowUpRight, ArrowDownLeft, ArrowDown, ArrowUp, Receipt, CalendarRange, X, Check } from "lucide-react";

type Period = "1M" | "3M" | "YTD" | "12M";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function sign(v: number) { return v > 0 ? "+" : ""; }

function toInputDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function periodStartDate(p: Period, today: Date): Date {
  const d = new Date(today);
  if (p === "1M")  { d.setMonth(d.getMonth() - 1);     return d; }
  if (p === "3M")  { d.setMonth(d.getMonth() - 3);     return d; }
  if (p === "YTD") { return new Date(d.getFullYear(), 0, 1); }
  /* 12M */          d.setFullYear(d.getFullYear() - 1); return d;
}

/** Parse trade date strings like "Dec 12, 2025" → Date */
function parseTradeDate(s: string): Date { return new Date(s); }

// ── monthlyData slice — responds to both period presets and custom date ranges ─

function getSlice(data: Client["monthlyData"], period: Period | null, startDate: string, endDate: string) {
  if (period === "1M") return data.slice(-2);
  if (period === "3M") return data.slice(-4);
  if (period === "YTD" || period === "12M") return data;
  // Custom: estimate from date range
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate   + "T12:00:00");
  const months = Math.round((e.getTime() - s.getTime()) / (30 * 24 * 60 * 60 * 1000)) + 1;
  return data.slice(-Math.max(2, Math.min(months, data.length)));
}

// ── SVG performance chart ─────────────────────────────────────────────────────

function PerformanceChart({ data }: { data: Client["monthlyData"] }) {
  const W = 580, H = 220;
  const pad = { top: 20, right: 16, bottom: 36, left: 52 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;

  const portfolioPcts = data.map(d => ((d.value - data[0].value) / data[0].value) * 100);
  const benchPcts     = data.map(d => ((d.benchmark - data[0].benchmark) / data[0].benchmark) * 100);
  const allPcts       = [...portfolioPcts, ...benchPcts];
  const minPct        = Math.min(...allPcts);
  const maxPct        = Math.max(...allPcts);
  const range         = maxPct - minPct || 1;

  const toY = (pct: number) => pad.top + ph - ((pct - minPct) / range) * ph;
  const toX = (i: number)   => pad.left + (i / Math.max(data.length - 1, 1)) * pw;

  const portfolioPath = data.map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(portfolioPcts[i]).toFixed(1)}`).join(" ");
  const benchPath     = data.map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(benchPcts[i]).toFixed(1)}`).join(" ");
  const areaPath      = `${portfolioPath} L ${toX(data.length - 1).toFixed(1)} ${toY(minPct).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(minPct).toFixed(1)} Z`;

  const gridLevels = [minPct, minPct + range * 0.5, maxPct].map(v => ({ v, y: toY(v) }));
  const positive   = portfolioPcts[portfolioPcts.length - 1] >= 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="rg-port" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={positive ? "var(--green)" : "var(--red)"} stopOpacity={0.15} />
          <stop offset="100%" stopColor={positive ? "var(--green)" : "var(--red)"} stopOpacity={0} />
        </linearGradient>
      </defs>

      {gridLevels.map(({ y }, i) => (
        <line key={i} x1={pad.left} y1={y.toFixed(1)} x2={W - pad.right} y2={y.toFixed(1)}
          stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 3" />
      ))}
      {gridLevels.map(({ v, y }, i) => (
        <text key={i} x={pad.left - 6} y={(y + 4).toFixed(1)} textAnchor="end" fontSize={10} fill="var(--text-muted)">
          {v > 0 ? "+" : ""}{v.toFixed(1)}%
        </text>
      ))}
      {minPct < 0 && maxPct > 0 && (
        <line x1={pad.left} y1={toY(0).toFixed(1)} x2={W - pad.right} y2={toY(0).toFixed(1)}
          stroke="var(--border)" strokeWidth={1} />
      )}
      {data.map((d, i) => {
        if (data.length > 6 && i % 2 !== 0) return null;
        return (
          <text key={i} x={toX(i).toFixed(1)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
            {d.month}
          </text>
        );
      })}
      <path d={areaPath} fill="url(#rg-port)" />
      <path d={benchPath} fill="none" stroke="var(--border)" strokeWidth={1.5}
        strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
      <path d={portfolioPath} fill="none"
        stroke={positive ? "var(--green)" : "var(--red)"}
        strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={toX(data.length - 1).toFixed(1)} cy={toY(portfolioPcts[portfolioPcts.length - 1]).toFixed(1)}
        r={4} fill={positive ? "var(--green)" : "var(--red)"} stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}

// ── Performance breakdown ─────────────────────────────────────────────────────

function computePeriod(client: Client, period: Period | null, startDate: string, endDate: string, start: Date, end: Date) {
  const slice        = getSlice(client.monthlyData, period, startDate, endDate);
  const valorInicial = slice[0].value;
  const valorFinal   = client.aum;

  const inRange = (t: Client["trades"][number]) => {
    const d = parseTradeDate(t.date);
    return d >= start && d <= end;
  };
  const depositos  = client.trades.filter(t => t.type === "Buy"  && inRange(t)).reduce((s, t) => s + t.total, 0);
  const extracciones = client.trades.filter(t => t.type === "Sell" && inRange(t)).reduce((s, t) => s + t.total, 0);
  // Derive months from the actual date range
  const months     = Math.max(1, Math.round((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  const cupones    = client.positions.filter(p => p.type === "Renta Fija").reduce((s, p) => s + p.value * 0.004, 0) * months;
  const gastos     = -(valorFinal * 0.0008 * months);
  const resultadoTenencia = valorFinal - valorInicial - depositos + extracciones - cupones - gastos;

  return { valorInicial, depositos, extracciones: -extracciones, dividendos: 0, cupones, gastos, resultadoTenencia, valorFinal };
}

// ── Donut mini-chart ──────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  "Renta Variable": "oklch(52% 0.18 265)",
  "Renta Fija":     "oklch(55% 0.14 150)",
  "FCI":            "oklch(58% 0.16 60)",
  "Efectivo":       "oklch(70% 0.04 240)",
  "Dólar":          "oklch(62% 0.14 60)",
  "Opciones":       "oklch(62% 0.18 320)",
  "Otro":           "oklch(62% 0.08 290)",
};

function DonutSlices({ positions }: { positions: Client["positions"] }) {
  const typeMap: Record<string, number> = {};
  for (const p of positions) typeMap[p.type] = (typeMap[p.type] ?? 0) + p.weight;
  const entries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  const R = 44, r = 26, cx = 50, cy = 50;
  let angle = -90;
  const slices = entries.map(([type, pct]) => {
    const sweep  = (pct / total) * 360;
    const startA = (angle * Math.PI) / 180;
    const endA   = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + R * Math.cos(startA), y1 = cy + R * Math.sin(startA);
    const x2 = cx + R * Math.cos(endA),   y2 = cy + R * Math.sin(endA);
    const xi1 = cx + r * Math.cos(startA), yi1 = cy + r * Math.sin(startA);
    const xi2 = cx + r * Math.cos(endA),   yi2 = cy + r * Math.sin(endA);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${xi2.toFixed(2)} ${yi2.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${xi1.toFixed(2)} ${yi1.toFixed(2)} Z`;
    angle += sweep;
    return { type, d };
  });
  return (
    <svg viewBox="0 0 100 100" width={96} height={96}>
      {slices.map(s => <path key={s.type} d={s.d} fill={TYPE_COLORS[s.type] ?? "oklch(55% 0.10 240)"} />)}
    </svg>
  );
}

// ── Custom date range modal ───────────────────────────────────────────────────

function DateRangeModal({
  initialStart, initialEnd, today,
  onApply, onClose,
}: {
  initialStart: string; initialEnd: string; today: string;
  onApply: (start: string, end: string) => void;
  onClose: () => void;
}) {
  const [start, setStart] = useState(initialStart);
  const [end,   setEnd]   = useState(initialEnd);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  function handleOverlay(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const valid = start && end && start <= end;

  const fmtDisplay = (s: string) => {
    if (!s) return "—";
    const d = new Date(s + "T12:00:00");
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div
      onClick={handleOverlay}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0% 0 0 / 0.35)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        ref={cardRef}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "28px 28px 24px",
          width: 380,
          boxShadow: "0 20px 60px oklch(0% 0 0 / 0.18)",
          display: "flex", flexDirection: "column", gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarRange size={15} color="var(--accent)" />
            <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 17, color: "var(--text-primary)" }}>
              Período personalizado
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2, display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Date inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {([
            { label: "Desde", value: start, max: end || today, setter: setStart },
            { label: "Hasta", value: end,   min: start, max: today, setter: setEnd },
          ] as const).map(({ label, value, setter, ...rest }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {label}
              </label>
              <input
                type="date"
                value={value}
                {...rest}
                onChange={e => setter(e.target.value)}
                style={{
                  fontSize: 13, padding: "9px 12px", borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  outline: "none", fontFamily: "inherit", width: "100%",
                  boxSizing: "border-box",
                }}
              />
              {value && (
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", paddingLeft: 2 }}>
                  {fmtDisplay(value)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        {valid && (
          <div style={{
            background: "var(--accent-light)", borderRadius: 8, padding: "10px 14px",
            fontSize: 12, color: "var(--accent)", fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Check size={12} strokeWidth={2.5} />
            {fmtDisplay(start)} — {fmtDisplay(end)}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "9px", borderRadius: 8,
              border: "1px solid var(--border)", background: "transparent",
              fontSize: 13, color: "var(--text-secondary)", cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => valid && onApply(start, end)}
            disabled={!valid}
            style={{
              flex: 1, padding: "9px", borderRadius: 8, border: "none",
              background: valid ? "var(--accent)" : "var(--border)",
              fontSize: 13, fontWeight: 600,
              color: valid ? "#fff" : "var(--text-muted)",
              cursor: valid ? "pointer" : "not-allowed",
              transition: "background 0.12s",
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main report component ─────────────────────────────────────────────────────

const TODAY = new Date();

export function ClientReport({ client }: { client: Client }) {
  const { fmtCompact } = useCurrency();
  const [period, setPeriod]       = useState<Period | null>("12M");
  const [startDate, setStartDate] = useState(() => toInputDate(periodStartDate("12M", TODAY)));
  const [endDate, setEndDate]     = useState(() => toInputDate(TODAY));
  const [modalOpen, setModalOpen] = useState(false);

  function handlePeriod(p: Period) {
    setPeriod(p);
    setStartDate(toInputDate(periodStartDate(p, TODAY)));
    setEndDate(toInputDate(TODAY));
  }

  function handleCustomApply(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
    setPeriod(null);
    setModalOpen(false);
  }

  const start = useMemo(() => { const d = new Date(startDate + "T00:00:00"); return d; }, [startDate]);
  const end   = useMemo(() => { const d = new Date(endDate   + "T23:59:59"); return d; }, [endDate]);

  const slice    = useMemo(() => getSlice(client.monthlyData, period, startDate, endDate), [period, startDate, endDate]);
  const pd       = useMemo(() => computePeriod(client, period, startDate, endDate, start, end), [period, startDate, endDate, start, end]);
  const positive = slice[slice.length - 1].value >= slice[0].value;

  const typeMap: Record<string, number> = {};
  for (const p of client.positions) typeMap[p.type] = (typeMap[p.type] ?? 0) + p.weight;
  const typeEntries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  const tableRows: { label: string; value: number; bold?: boolean; separator?: boolean; muted?: boolean }[] = [
    { label: "Valor Inicial",             value: pd.valorInicial,       bold: true },
    { label: "Depósitos / Suscripciones", value: pd.depositos },
    { label: "Extracciones / Rescates",   value: pd.extracciones },
    { label: "Dividendos",                value: pd.dividendos,         muted: true },
    { label: "Cupones",                   value: pd.cupones },
    { label: "Gastos",                    value: pd.gastos },
    { label: "Resultado por Tenencia",    value: pd.resultadoTenencia,  bold: true },
    { label: "Valor Final",               value: pd.valorFinal,         bold: true, separator: true },
  ];

  const cambio    = pd.valorFinal - pd.valorInicial;
  const cambioPct = ((pd.valorFinal - pd.valorInicial) / pd.valorInicial) * 100;

  const periodLabel: Record<Period, string> = {
    "1M": "Último mes", "3M": "Últimos 3 meses", "YTD": "Año en curso (YTD)", "12M": "Últimos 12 meses",
  };

  const rangeLabel = period
    ? periodLabel[period]
    : `${new Date(startDate).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(endDate).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`;

  // Filter trades by date range
  const filteredTrades = useMemo(() =>
    client.trades
      .filter(t => { const d = parseTradeDate(t.date); return d >= start && d <= end; })
      .sort((a, b) => parseTradeDate(b.date).getTime() - parseTradeDate(a.date).getTime()),
    [client.trades, start, end]
  );

  const buyTotal  = filteredTrades.filter(t => t.type === "Buy").reduce((s, t) => s + t.total, 0);
  const sellTotal = filteredTrades.filter(t => t.type === "Sell").reduce((s, t) => s + t.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* Date range modal */}
      {modalOpen && (
        <DateRangeModal
          initialStart={startDate}
          initialEnd={endDate}
          today={toInputDate(TODAY)}
          onApply={handleCustomApply}
          onClose={() => setModalOpen(false)}
        />
      )}

      <div style={{ padding: "0 0 28px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 1100, width: "100%" }}>

        {/* Toolbar: period selector + print */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 3, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 3 }}>
            {/* Custom option */}
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontSize: 12, fontWeight: period === null ? 700 : 400,
                padding: "6px 14px", borderRadius: 6, border: "none",
                background: period === null ? "var(--accent)" : "transparent",
                color: period === null ? "#fff" : "var(--text-muted)",
                cursor: "pointer", transition: "background 0.12s, color 0.12s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <CalendarRange size={11} />
              {period === null
                ? `${new Date(startDate + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${new Date(endDate + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`
                : "Personalizado"
              }
            </button>

            {/* Divider */}
            <div style={{ width: 1, background: "var(--border)", margin: "4px 0" }} />

            {/* Standard periods */}
            {(["1M", "3M", "YTD", "12M"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => handlePeriod(p)}
                style={{
                  fontSize: 12, fontWeight: period === p ? 700 : 400,
                  padding: "6px 14px", borderRadius: 6, border: "none",
                  background: period === p ? "var(--accent)" : "transparent",
                  color: period === p ? "#fff" : "var(--text-muted)",
                  cursor: "pointer", transition: "background 0.12s, color 0.12s",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Print button */}
          <button
            onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <Printer size={13} /> Imprimir / Exportar PDF
          </button>
        </div>

        {/* Main body: breakdown table + chart */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

          {/* Performance breakdown */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>
                Cambio en el valor de la cartera
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{rangeLabel}</div>
            </div>
            {tableRows.map((row, i) => (
              <div key={row.label}>
                {row.separator && <div style={{ height: 1, background: "var(--border)" }} />}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 20px",
                  borderBottom: i < tableRows.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  background: row.bold && row.separator ? "var(--surface-raised)" : "transparent",
                }}>
                  <span style={{ fontSize: 12.5, color: row.muted ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: row.bold ? 700 : 500,
                    fontFamily: row.bold ? "var(--font-dm-serif)" : "inherit",
                    color: row.bold ? "var(--text-primary)" : row.value > 0 ? "var(--green)" : row.value < 0 ? "var(--red)" : "var(--text-muted)",
                  }}>
                    {row.value === 0 ? "—" : `${row.value > 0 && !row.bold ? "+" : ""}${fmtMoney(row.value)}`}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 20px", background: "var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 2 }}>Variación neta</div>
                <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "#fff" }}>{sign(cambio)}{fmtMoney(cambio)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 2 }}>Rendimiento</div>
                <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "#fff" }}>{sign(cambioPct)}{cambioPct.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Chart + allocation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 18px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Rendimiento %</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{rangeLabel} · vs referencia</div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 20, height: 2.5, borderRadius: 2, background: positive ? "var(--green)" : "var(--red)" }} />
                    <span style={{ color: "var(--text-muted)" }}>Cartera</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                    <span style={{ color: "var(--text-muted)" }}>Referencia</span>
                  </div>
                </div>
              </div>
              <PerformanceChart data={slice} />
            </div>

          </div>
        </div>

        {/* Trades table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Operaciones</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{rangeLabel}</div>
            </div>
            {filteredTrades.length > 0 && (
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
                  <span style={{ color: "var(--text-muted)" }}>Compras</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmtMoney(buyTotal)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />
                  <span style={{ color: "var(--text-muted)" }}>Ventas</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmtMoney(sellTotal)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--text-muted)" }}>Total neto</span>
                  <span style={{ fontWeight: 700, color: (buyTotal - sellTotal) >= 0 ? "var(--green)" : "var(--red)" }}>
                    {sign(buyTotal - sellTotal)}{fmtMoney(buyTotal - sellTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {filteredTrades.length === 0 ? (
            <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
              <Receipt size={28} strokeWidth={1.5} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Sin operaciones en este período</div>
              <div style={{ fontSize: 12 }}>Ajustá el rango de fechas para ver las operaciones.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-raised)" }}>
                  {["Fecha", "Tipo", "Ticker", "Instrumento", "Cantidad", "Precio", "Total", "Nota"].map((h, i) => (
                    <th key={h} style={{
                      padding: "9px 18px",
                      textAlign: i >= 4 && i <= 6 ? "right" : "left",
                      fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((t, i) => {
                  const isBuy        = t.type === "Buy";
                  const isDeposit    = t.type === "Deposit";
                  const isWithdrawal = t.type === "Withdrawal";
                  const isCash       = isDeposit || isWithdrawal;

                  const badgeConfig = {
                    Buy:        { bg: "var(--green-light)",  color: "var(--green)",  icon: <ArrowDownLeft size={10} />, label: "Compra" },
                    Sell:       { bg: "var(--red-light)",    color: "var(--red)",    icon: <ArrowUpRight size={10} />,  label: "Venta" },
                    Deposit:    { bg: "var(--accent-light)", color: "var(--accent)", icon: <ArrowDown size={10} />,     label: "Depósito" },
                    Withdrawal: { bg: "oklch(97% 0.01 60)",  color: "var(--amber)",  icon: <ArrowUp size={10} />,       label: "Extracción" },
                  }[t.type];

                  const totalColor = isDeposit ? "var(--accent)" : isWithdrawal ? "var(--amber)" : isBuy ? "var(--green)" : "var(--red)";
                  const totalSign  = isWithdrawal ? "-" : "+";

                  return (
                    <tr key={t.id} style={{ borderBottom: i < filteredTrades.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                      <td style={{ padding: "11px 18px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {t.date}
                      </td>
                      <td style={{ padding: "11px 18px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 700,
                          padding: "3px 9px", borderRadius: 20,
                          background: badgeConfig.bg,
                          color: badgeConfig.color,
                        }}>
                          {badgeConfig.icon}
                          {badgeConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: "11px 18px" }}>
                        {isCash
                          ? <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>—</span>
                          : <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace" }}>{t.ticker}</span>
                        }
                      </td>
                      <td style={{ padding: "11px 18px", fontSize: 12.5, color: "var(--text-primary)", maxWidth: 220 }}>
                        {t.name}
                      </td>
                      <td style={{ padding: "11px 18px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)" }}>
                        {isCash ? <span style={{ color: "var(--text-muted)" }}>—</span> : t.shares.toLocaleString("es-AR")}
                      </td>
                      <td style={{ padding: "11px 18px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)" }}>
                        {isCash ? <span style={{ color: "var(--text-muted)" }}>—</span> : `$${t.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td style={{ padding: "11px 18px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontFamily: "var(--font-dm-serif)", fontWeight: 700, color: totalColor }}>
                          {totalSign}{fmtMoney(t.total)}
                        </span>
                      </td>
                      <td style={{ padding: "11px 18px", fontSize: 11.5, color: "var(--text-muted)", maxWidth: 200 }}>
                        {t.note
                          ? <span title={t.note}>{t.note.length > 60 ? t.note.slice(0, 58) + "…" : t.note}</span>
                          : <span style={{ color: "var(--border)" }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
          <span>Vale Financial Advisory · Reporte generado automáticamente</span>
          <span>Los rendimientos pasados no garantizan resultados futuros.</span>
        </div>

      </div>
    </div>
  );
}
