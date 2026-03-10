"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clients } from "@/lib/clientData";
import { NEWS, type NewsItem, type NewsSentiment as Sentiment, type NewsCategory as Category } from "@/lib/newsData";
import { SEARCHABLE_ASSETS, type AssetKind } from "@/lib/assetData";
import {
  Sparkles, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, AlertCircle, Globe, Zap,
  X, Check, Settings2, Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarketStat {
  id: string;
  label: string;
  value: string;
  pct: string;
  positive: boolean;
}

interface MetricItem {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  trend: "positive" | "negative" | "neutral" | "warning";
  category: string;
}

// ─── Market stats ─────────────────────────────────────────────────────────────

const MARKET_STATS: MarketStat[] = [
  { id: "sp500",   label: "S&P 500",      value: "5,842",   pct: "+0.73%",  positive: true  },
  { id: "nasdaq",  label: "NASDAQ",       value: "18,290",  pct: "+1.12%",  positive: true  },
  { id: "dow",     label: "Dow Jones",    value: "43,100",  pct: "−0.18%",  positive: false },
  { id: "vix",     label: "VIX",          value: "17.2",    pct: "−5.3%",   positive: true  },
  { id: "dxy",     label: "DXY",          value: "103.4",   pct: "+0.21%",  positive: false },
  { id: "gold",    label: "Oro",          value: "$2,890",  pct: "+0.40%",  positive: true  },
  { id: "wti",     label: "WTI",          value: "$71.3",   pct: "−0.81%",  positive: false },
  { id: "btc",     label: "Bitcoin",      value: "$86,400", pct: "+2.11%",  positive: true  },
  { id: "merval",  label: "Merval",       value: "2.85M",   pct: "+3.2%",   positive: true  },
  { id: "riesgo",  label: "Riesgo País",  value: "620bps",  pct: "−12.1%",  positive: true  },
];

// ─── Sentiment ────────────────────────────────────────────────────────────────

const SENTIMENT = {
  overall: 62,
  label: "Codicia Moderada",
  updated: "Hace 15 min",
  categories: [
    { name: "Tech Global",   value: 72, label: "Positivo" },
    { name: "Argentina",     value: 45, label: "Neutral"  },
    { name: "Tasas / Bonos", value: 55, label: "Moderado" },
    { name: "Commodities",   value: 48, label: "Neutral"  },
    { name: "Emergentes",    value: 58, label: "Moderado" },
  ],
};

// ─── Metrics library ──────────────────────────────────────────────────────────

const METRICS_LIBRARY: MetricItem[] = [
  { id: "pe_sp500",      label: "P/E S&P 500",             value: "22.4×",    sublabel: "Media 10a: 17.8×",       trend: "warning",  category: "Valuación"   },
  { id: "pe_nasdaq",     label: "P/E NASDAQ",              value: "31.2×",    sublabel: "Elevado vs. histórico",  trend: "warning",  category: "Valuación"   },
  { id: "yield_curve",   label: "Curva 10Y – 2Y",          value: "+0.28%",   sublabel: "En normalización",       trend: "positive", category: "Tasas"       },
  { id: "inflation_10y", label: "Inflación implícita 10Y", value: "2.31%",    sublabel: "Fed target: 2.0%",       trend: "neutral",  category: "Tasas"       },
  { id: "fed_funds_fut", label: "Fed Funds dic-26",        value: "3.75%",    sublabel: "Implica −2 recortes",    trend: "neutral",  category: "Tasas"       },
  { id: "hy_spread",     label: "High Yield Spread",       value: "325bps",   sublabel: "Media 5a: 390bps",       trend: "positive", category: "Crédito"     },
  { id: "ig_spread",     label: "IG Spread",               value: "98bps",    sublabel: "Comprimido",             trend: "positive", category: "Crédito"     },
  { id: "put_call",      label: "Put / Call Ratio",        value: "0.81",     sublabel: "Sesgo alcista",          trend: "positive", category: "Sentimiento" },
  { id: "vix_pct",       label: "VIX Percentil",           value: "32°",      sublabel: "Relativamente bajo",     trend: "positive", category: "Sentimiento" },
  { id: "margin_debt",   label: "Margin Debt",             value: "$812B",    sublabel: "+2.3% MoM",              trend: "neutral",  category: "Sentimiento" },
  { id: "bcra_rate",     label: "Tasa BCRA",               value: "40% TNA",  sublabel: "+300bps hoy",            trend: "negative", category: "Argentina"   },
  { id: "arg_reserves",  label: "Reservas BCRA",           value: "$28.4B",   sublabel: "+$1.2B MoM",             trend: "positive", category: "Argentina"   },
  { id: "usd_ccl",       label: "USD CCL",                 value: "$1,195",   sublabel: "Brecha oficial: 4.2%",   trend: "neutral",  category: "Argentina"   },
  { id: "merval_usd",    label: "Merval en USD",           value: "$2,385",   sublabel: "+3.1% semanal",          trend: "positive", category: "Argentina"   },
  { id: "dxy_1m",        label: "DXY cambio 1M",           value: "−1.8%",    sublabel: "Dólar más débil",        trend: "positive", category: "Macro"       },
  { id: "gold_silver",   label: "Ratio Oro / Plata",       value: "88.4×",    sublabel: "Oro caro vs. plata",     trend: "neutral",  category: "Commodities" },
];

const DEFAULT_METRIC_IDS = ["pe_sp500", "yield_curve", "hy_spread", "put_call", "bcra_rate", "arg_reserves"];
const LS_KEY = "research_active_metrics_v1";

// ─── AI Summary ───────────────────────────────────────────────────────────────

const AI_SUMMARY = {
  date: "Lunes 9 de marzo, 2026",
  headline: "Jornada positiva para tech global; Argentina bajo presión por política monetaria",
  bullets: [
    { icon: "🤖", text: "NVIDIA lidera la jornada con resultados que superan todas las estimaciones. Valentina Rodríguez y Facundo Morales tienen exposición significativa — posible momento de revisar si corresponde capturar ganancias o rebalancear." },
    { icon: "📈", text: "Microsoft y Amazon refuerzan apuestas en IA: contratos y alianzas fortalecen el caso fundamental. Varios clientes con posición en MSFT ven viento a favor." },
    { icon: "🇦🇷", text: "El BCRA subió tasas 300bps a 40% TNA — los portafolios con LECAPs y cauciones se verán favorecidos en el corto plazo, pero hay que monitorear el riesgo de refinanciación. Revisar los perfiles que tienen vencimientos en abril-mayo." },
    { icon: "💵", text: "Fed sin cambios pero señala dos recortes para H2 2026. Esto presiona a la baja el rendimiento de AGG y bonos de larga duración — clientes conservadores con high duration podrían querer revisar la exposición." },
    { icon: "⚠️", text: "Tesla suspende producción 3 semanas: Facundo Morales tiene posición relevante. Revisar si corresponde proteger via opciones o si el perfil agresivo lo tolera sin acción." },
  ],
  sentiment: "mixed" as "positive" | "negative" | "mixed",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClientExposure(tickers: string[]) {
  const result: { id: string; name: string; initials: string; value: number; weight: number }[] = [];
  for (const c of clients) {
    const positions = c.positions.filter((p: { ticker: string }) => tickers.includes(p.ticker));
    if (positions.length === 0) continue;
    const value  = positions.reduce((s: number, p: { value: number })  => s + p.value,  0);
    const weight = positions.reduce((s: number, p: { weight: number }) => s + p.weight, 0);
    result.push({ id: c.id, name: c.name, initials: c.initials, value, weight });
  }
  return result.sort((a, b) => b.value - a.value);
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function sentimentColor(v: number) {
  if (v < 20) return "#ef4444";
  if (v < 40) return "#f97316";
  if (v < 60) return "#eab308";
  if (v < 80) return "#84cc16";
  return "#22c55e";
}

const TREND_COLOR: Record<MetricItem["trend"], string> = {
  positive: "var(--green)",
  negative: "var(--red)",
  neutral:  "var(--text-secondary)",
  warning:  "var(--amber)",
};

const CATEGORY_LABELS: Record<Category, string> = {
  macro: "Macro", earnings: "Resultados", sector: "Sectorial",
  argentina: "Argentina", rates: "Tasas",
};

const CATEGORY_COLORS: Record<Category, { bg: string; color: string }> = {
  macro:     { bg: "var(--accent-light)",         color: "var(--accent)"              },
  earnings:  { bg: "oklch(95% 0.04 145)",          color: "oklch(38% 0.12 145)"        },
  sector:    { bg: "oklch(95% 0.03 280)",          color: "oklch(38% 0.12 280)"        },
  argentina: { bg: "oklch(95% 0.06 30)",           color: "oklch(42% 0.14 30)"         },
  rates:     { bg: "oklch(95% 0.04 200)",          color: "oklch(38% 0.12 200)"        },
};

const SENTIMENT_ICON = {
  positive: <TrendingUp size={13} />,
  negative: <TrendingDown size={13} />,
  neutral:  <Minus size={13} />,
};

const SENTIMENT_COLOR_MAP = {
  positive: "var(--green)",
  negative: "var(--red)",
  neutral:  "var(--text-muted)",
};

// ─── Search Bar ──────────────────────────────────────────────────────────────

const KIND_LABEL: Record<AssetKind, string> = {
  equity: "Acciones", etf: "ETF", bond: "Renta Fija",
  fci: "FCI", fx: "FX", option: "Opción", other: "Otro",
};

function AssetSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.trim().length === 0
    ? []
    : SEARCHABLE_ASSETS.filter(a =>
        a.ticker.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  function navigate(ticker: string) {
    setQuery("");
    setOpen(false);
    router.push(`/assets/${encodeURIComponent(ticker)}`);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: 300 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 9, padding: "7px 12px",
        transition: "border-color 0.15s",
      }}>
        <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Escape") { setQuery(""); setOpen(false); }
            if (e.key === "Enter" && results.length > 0) navigate(results[0].ticker);
          }}
          placeholder="Buscar activo..."
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 13, color: "var(--text-primary)", width: "100%",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-muted)" }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, zIndex: 200,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}>
          {results.map((a, i) => (
            <button
              key={a.ticker}
              onClick={() => navigate(a.ticker)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 14px",
                background: "none", border: "none",
                borderBottom: i < results.length - 1 ? "1px solid var(--border-subtle)" : "none",
                cursor: "pointer", textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontFamily: "monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", background: "var(--surface-raised)", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>
                {a.ticker}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {a.name}
              </span>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", flexShrink: 0 }}>
                {KIND_LABEL[a.kind]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Market Stats Strip ───────────────────────────────────────────────────────

function MarketStatsStrip() {
  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      {MARKET_STATS.map((s, i) => (
        <div
          key={s.id}
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            padding: "12px 18px",
            borderRight: i < MARKET_STATS.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {s.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {s.value}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: s.positive ? "var(--green)" : "var(--red)" }}>
            {s.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {s.pct}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sentiment Gauge (SVG arc) ────────────────────────────────────────────────

function SentimentGauge({ value }: { value: number }) {
  const cx = 100, cy = 96, r = 72;

  function arcPath(startVal: number, endVal: number) {
    const a1 = (1 - startVal / 100) * Math.PI;
    const a2 = (1 - endVal   / 100) * Math.PI;
    const x1 = (cx + r * Math.cos(a1)).toFixed(2);
    const y1 = (cy - r * Math.sin(a1)).toFixed(2);
    const x2 = (cx + r * Math.cos(a2)).toFixed(2);
    const y2 = (cy - r * Math.sin(a2)).toFixed(2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  const zones = [
    { start: 0,  end: 20,  color: "#ef4444" },
    { start: 20, end: 40,  color: "#f97316" },
    { start: 40, end: 60,  color: "#eab308" },
    { start: 60, end: 80,  color: "#84cc16" },
    { start: 80, end: 100, color: "#22c55e" },
  ];

  const na = (1 - value / 100) * Math.PI;
  const nx = (cx + (r - 8) * Math.cos(na)).toFixed(2);
  const ny = (cy - (r - 8) * Math.sin(na)).toFixed(2);
  const activeColor = sentimentColor(value);

  return (
    <svg width="100%" viewBox="0 0 200 108" style={{ display: "block", maxWidth: 220, margin: "0 auto" }}>
      {/* Background track */}
      <path d={arcPath(0, 100)} fill="none" stroke="var(--border)" strokeWidth={13} strokeLinecap="butt" />
      {/* Faded zone colors */}
      {zones.map(z => (
        <path key={z.start} d={arcPath(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={13} opacity={0.18} strokeLinecap="butt" />
      ))}
      {/* Active fill */}
      {value > 0 && (
        <path d={arcPath(0, value)} fill="none" stroke={activeColor} strokeWidth={13} strokeLinecap="round" />
      )}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--text-secondary)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="var(--text-secondary)" />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--surface)" />
      {/* Labels */}
      <text x={24}  y={106} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Miedo</text>
      <text x={100} y={22}  fontSize={8} fill="var(--text-muted)" textAnchor="middle">Neutral</text>
      <text x={176} y={106} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Codicia</text>
    </svg>
  );
}

// ─── Sentiment Card ───────────────────────────────────────────────────────────

function SentimentCard() {
  return (
    <div
      style={{
        flex: "0 0 310px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Sentimiento del Mercado
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: sentimentColor(SENTIMENT.overall) }}>
            {SENTIMENT.label}
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: sentimentColor(SENTIMENT.overall), letterSpacing: "-0.03em" }}>
          {SENTIMENT.overall}
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginLeft: 2 }}>/100</span>
        </div>
      </div>

      <SentimentGauge value={SENTIMENT.overall} />

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {SENTIMENT.categories.map(cat => (
          <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "var(--text-secondary)", width: 100, flexShrink: 0 }}>
              {cat.name}
            </span>
            <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${cat.value}%`,
                  background: sentimentColor(cat.value),
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", width: 52, textAlign: "right", whiteSpace: "nowrap" }}>
              {cat.value} · {cat.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
        <Zap size={9} />
        Actualizado {SENTIMENT.updated} · Índice compuesto basado en flujos, opciones y posicionamiento
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: MetricItem }) {
  return (
    <div
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "13px 14px",
        position: "relative",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
        {metric.label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: TREND_COLOR[metric.trend], letterSpacing: "-0.02em", lineHeight: 1 }}>
        {metric.value}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.3 }}>
        {metric.sublabel}
      </div>
    </div>
  );
}

// ─── Metric Picker Modal ──────────────────────────────────────────────────────

function MetricPickerModal({ activeIds, onToggle, onClose }: {
  activeIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const categories = [...new Set(METRICS_LIBRARY.map(m => m.category))];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 24,
          maxWidth: 560, width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Personalizar métricas</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              Seleccioná las métricas que querés ver en tu panel · {activeIds.length} activas
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>
              {cat}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {METRICS_LIBRARY.filter(m => m.category === cat).map(m => {
                const active = activeIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => onToggle(m.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px",
                      borderRadius: 9,
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-light)" : "var(--surface-raised)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.12s, background 0.12s",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: active ? "var(--accent)" : "var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background 0.12s",
                    }}>
                      {active && <Check size={10} color="#fff" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--accent)" : "var(--text-primary)" }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                        {m.value} · {m.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Metrics Section ───────────────────────────────────────────────────

function CustomMetricsSection() {
  const [activeIds, setActiveIds] = useState<string[]>(DEFAULT_METRIC_IDS);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setActiveIds(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(activeIds)); } catch {}
  }, [activeIds]);

  function toggleMetric(id: string) {
    setActiveIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const activeMetrics = activeIds
    .map(id => METRICS_LIBRARY.find(m => m.id === id))
    .filter(Boolean) as MetricItem[];

  return (
    <>
      <div
        style={{
          flex: 1,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 1 }}>
              Mis Métricas
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              {activeMetrics.length} indicadores seleccionados
            </div>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 11.5, fontWeight: 600,
              padding: "5px 10px", borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            <Settings2 size={12} /> Editar
          </button>
        </div>

        {/* Metrics grid */}
        {activeMetrics.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {activeMetrics.map(m => (
              <MetricCard
                key={m.id}
                metric={m}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "32px 20px", gap: 10,
              border: "1px dashed var(--border)",
              borderRadius: 10, color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 22 }}>📊</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Sin métricas activas</div>
            <div style={{ fontSize: 12, textAlign: "center" }}>Hacé clic en "Editar" para personalizar tu panel</div>
          </div>
        )}


      </div>

      {pickerOpen && (
        <MetricPickerModal
          activeIds={activeIds}
          onToggle={toggleMetric}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}

// ─── News sub-components ──────────────────────────────────────────────────────

function ClientPill({ id, name, initials, value, weight }: { id: string; name: string; initials: string; value: number; weight: number }) {
  return (
    <Link
      href={`/clients/${id}?tab=investments`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px 3px 4px", borderRadius: 20,
        border: "1px solid var(--border)", background: "var(--surface)",
        textDecoration: "none", color: "var(--text-secondary)",
        fontSize: 11.5, fontWeight: 500,
        transition: "background 0.1s, border-color 0.1s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-light)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {initials}
      </span>
      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{name.split(" ")[0]}</span>
      <span style={{ color: "var(--text-muted)" }}>{fmt(value)}</span>
      <span style={{ marginLeft: 2, background: "var(--surface-raised)", borderRadius: 10, padding: "0px 5px", fontSize: 10.5, color: "var(--text-muted)" }}>
        {weight.toFixed(0)}%
      </span>
    </Link>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const exposure = getClientExposure(item.tickers);
  const catStyle = CATEGORY_COLORS[item.category];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: catStyle.bg, color: catStyle.color }}>
          {CATEGORY_LABELS[item.category]}
        </span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: "auto" }}>{item.source}</span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>·</span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{item.time}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3, color: SENTIMENT_COLOR_MAP[item.sentiment], fontSize: 11.5, fontWeight: 600 }}>
          {SENTIMENT_ICON[item.sentiment]}
        </span>
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
        {item.headline}
      </div>

      {expanded && (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {item.summary}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {item.tickers.slice(0, 4).map(t => (
            <Link key={t} href={`/assets/${encodeURIComponent(t)}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 7px", borderRadius: 5, background: "var(--surface-raised)", color: "var(--text-secondary)", fontFamily: "monospace", textDecoration: "none", transition: "background 0.1s, color 0.1s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-light)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-raised)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
            >
              {t}
            </Link>
          ))}
          {item.tickers.length > 4 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{item.tickers.length - 4}</span>
          )}
        </div>

        {exposure.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginLeft: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 2 }}>Clientes:</span>
            {exposure.slice(0, 4).map(c => <ClientPill key={c.id} {...c} />)}
            {exposure.length > 4 && (
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>+{exposure.length - 4} más</span>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11.5, padding: 0 }}
        >
          {expanded ? <><ChevronUp size={13} /> Menos</> : <><ChevronDown size={13} /> Leer más</>}
        </button>
      </div>
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all",       label: "Todas"     },
  { id: "argentina", label: "Argentina" },
  { id: "earnings",  label: "Resultados"},
  { id: "rates",     label: "Tasas"     },
  { id: "sector",    label: "Sectorial" },
  { id: "macro",     label: "Macro"     },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function ResearchPage() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  const filtered = filter === "all" ? NEWS : NEWS.filter(n => n.category === filter);

  return (
    <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: 26, margin: 0, color: "var(--text-primary)" }}>
          Research
        </h1>
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{AI_SUMMARY.date}</span>
        <div style={{ marginLeft: "auto" }}>
          <AssetSearchBar />
        </div>
      </div>

      {/* Market stats strip */}
      <MarketStatsStrip />

      {/* Sentiment + Custom Metrics */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <SentimentCard />
        <CustomMetricsSection />
      </div>

      {/* AI Summary card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: summaryExpanded ? "1px solid var(--border-subtle)" : "none", cursor: "pointer" }}
          onClick={() => setSummaryExpanded(v => !v)}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
              Resumen IA del día
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
              {AI_SUMMARY.headline}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Globe size={11} /> Generado con datos en tiempo real
            </span>
            {summaryExpanded ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
          </div>
        </div>

        {summaryExpanded && (
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {AI_SUMMARY.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{b.icon}</span>
                <span style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{b.text}</span>
              </div>
            ))}
            <div style={{ marginTop: 4, padding: "8px 12px", background: "var(--surface-raised)", borderRadius: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <AlertCircle size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Resumen generado automáticamente a las 09:15 — verificar con fuentes primarias antes de tomar decisiones.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: 4 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Category | "all")}
              style={{
                fontSize: 12, fontWeight: filter === f.id ? 600 : 400,
                padding: "4px 12px", borderRadius: 6, border: "none",
                background: filter === f.id ? "var(--accent)" : "transparent",
                color: filter === f.id ? "#fff" : "var(--text-muted)",
                cursor: "pointer", transition: "background 0.12s, color 0.12s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          {filtered.length} {filtered.length === 1 ? "artículo" : "artículos"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--green)", fontWeight: 500 }}>
          <Zap size={11} /> Live
        </div>
      </div>

      {/* News feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(item => <NewsCard key={item.id} item={item} />)}
      </div>

    </div>
  );
}
