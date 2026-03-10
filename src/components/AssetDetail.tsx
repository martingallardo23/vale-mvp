"use client";

import { useState } from "react";
import Link from "next/link";
import { clients } from "@/lib/clientData";
import { getAssetInfo, AssetInfo, AssetKind } from "@/lib/assetData";
import { NEWS } from "@/lib/newsData";
import {
  ChevronLeft, TrendingUp, TrendingDown, Minus,
  ExternalLink, Users, BarChart2, Info, Sparkles, ArrowRight,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
}

function fmtPrice(v: number, currency: "USD" | "ARS") {
  const prefix = currency === "ARS" ? "$" : "$";
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000)    return `${prefix}${v.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  if (v >= 100)       return `${prefix}${v.toFixed(2)}`;
  return `${prefix}${v.toFixed(3)}`;
}

const KIND_LABEL: Record<AssetKind, string> = {
  equity: "Renta Variable",
  etf:    "ETF",
  bond:   "Renta Fija",
  fci:    "FCI",
  fx:     "Tipo de Cambio",
  option: "Opción",
  other:  "Otro",
};

const KIND_COLOR: Record<AssetKind, { bg: string; color: string }> = {
  equity: { bg: "var(--accent-light)", color: "var(--accent)" },
  etf:    { bg: "oklch(95% 0.03 280)", color: "oklch(38% 0.12 280)" },
  bond:   { bg: "oklch(95% 0.04 200)", color: "oklch(38% 0.12 200)" },
  fci:    { bg: "oklch(95% 0.04 145)", color: "oklch(38% 0.12 145)" },
  fx:     { bg: "oklch(95% 0.06 30)",  color: "oklch(42% 0.14 30)"  },
  option: { bg: "var(--amber-light)",  color: "var(--amber)"        },
  other:  { bg: "var(--surface-raised)", color: "var(--text-muted)" },
};

// ─── Price Chart ─────────────────────────────────────────────────────────────

function PriceChart({ data, positive, currency }: { data: number[]; positive: boolean; currency: "USD" | "ARS" }) {
  const W = 600, H = 160;
  const pad = { top: 12, right: 8, bottom: 28, left: 56 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((p, i) => ({
    x: pad.left + (i / (data.length - 1)) * pw,
    y: pad.top  + ph - ((p - min) / range) * ph,
  }));

  const line  = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area  = `${line} L ${pts[pts.length-1].x.toFixed(1)} ${(pad.top + ph).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.top + ph).toFixed(1)} Z`;
  const color = positive ? "var(--green)" : "var(--red)";
  const gid   = `cg-${positive ? "g" : "r"}`;

  // Y-axis labels (3 levels)
  const yLevels = [min, min + range * 0.5, max].map(v => ({
    v,
    y: pad.top + ph - ((v - min) / range) * ph,
  }));

  // X-axis labels (simplified months for 3M)
  const xLabels = ["Dic", "Ene", "Feb", "Mar"];
  const xStep   = pw / (xLabels.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0}    />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLevels.map(({ y }, i) => (
        <line key={i} x1={pad.left} y1={y.toFixed(1)} x2={W - pad.right} y2={y.toFixed(1)}
          stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 4" />
      ))}

      {/* Y labels */}
      {yLevels.map(({ v, y }, i) => (
        <text key={i} x={pad.left - 6} y={(y + 4).toFixed(1)} textAnchor="end"
          fontSize={10} fill="var(--text-muted)">
          {currency === "ARS" && v > 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v.toFixed(v < 10 ? 2 : 0)}`}
        </text>
      ))}

      {/* X labels */}
      {xLabels.map((label, i) => (
        <text key={i} x={(pad.left + i * xStep).toFixed(1)} y={H - 6}
          textAnchor="middle" fontSize={10} fill="var(--text-muted)">
          {label}
        </text>
      ))}

      {/* Area fill */}
      <path d={area} fill={`url(#${gid})`} />

      {/* Line */}
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* Last point dot */}
      <circle cx={pts[pts.length-1].x.toFixed(1)} cy={pts[pts.length-1].y.toFixed(1)}
        r={4} fill={color} stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}

// ─── Analyst Bar ─────────────────────────────────────────────────────────────

function AnalystBar({ buy, hold, sell }: { buy: number; hold: number; sell: number }) {
  const total = buy + hold + sell;
  if (!total) return null;
  const bPct  = (buy  / total) * 100;
  const hPct  = (hold / total) * 100;
  const sPct  = (sell / total) * 100;
  const consensus = bPct > 60 ? "Comprar" : bPct > 40 ? "Neutral" : "Vender";
  const consensusColor = bPct > 60 ? "var(--green)" : bPct > 40 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
          Consenso analistas
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: consensusColor }}>{consensus}</span>
      </div>

      {/* Bar */}
      <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 8 }}>
        <div style={{ width: `${bPct}%`, background: "var(--green)" }} />
        <div style={{ width: `${hPct}%`, background: "var(--amber)" }} />
        <div style={{ width: `${sPct}%`, background: "var(--red)"   }} />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)" }} />
          <span style={{ color: "var(--text-muted)" }}>Comprar</span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{buy}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--amber)" }} />
          <span style={{ color: "var(--text-muted)" }}>Neutral</span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{hold}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)" }} />
          <span style={{ color: "var(--text-muted)" }}>Vender</span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{sell}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 52W Range Bar ────────────────────────────────────────────────────────────

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = ((current - low) / (high - low)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 3 }}>
        <div style={{
          position: "absolute", top: -2, left: `${pct}%`,
          width: 10, height: 10, borderRadius: "50%",
          background: "var(--accent)", border: "2px solid var(--surface)",
          transform: "translateX(-50%)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
        <span>${low.toFixed(2)}</span>
        <span>52 semanas</span>
        <span>${high.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Metric Pill ─────────────────────────────────────────────────────────────

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 3,
      padding: "10px 16px",
      background: "var(--surface-raised)",
      border: "1px solid var(--border)",
      borderRadius: 9,
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Client Exposure Table ────────────────────────────────────────────────────

function ClientExposureSection({ ticker }: { ticker: string }) {
  const rows = clients
    .flatMap(c => {
      const positions = c.positions.filter(p => p.ticker === ticker);
      return positions.map(p => ({
        clientId: c.id,
        clientName: c.name,
        initials: c.initials,
        shares: p.shares,
        avgCost: p.avgCost,
        currentPrice: p.currentPrice,
        value: p.value,
        weight: p.weight,
        gainLossPct: p.gainLossPct,
        positionName: p.name,
      }));
    })
    .sort((a, b) => b.value - a.value);

  if (rows.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "28px 20px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        color: "var(--text-muted)",
      }}>
        <Users size={24} strokeWidth={1.5} />
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Ningún cliente tiene esta posición</div>
        <div style={{ fontSize: 12 }}>Este activo no está en ningún portafolio actualmente.</div>
      </div>
    );
  }

  const totalValue = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <Users size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Exposición en clientes
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: 11, fontWeight: 600,
          background: "var(--accent-light)",
          color: "var(--accent)",
          padding: "2px 8px", borderRadius: 12,
        }}>
          {rows.length} {rows.length === 1 ? "cliente" : "clientes"} · {fmt(totalValue)} total
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-raised)" }}>
            {["Cliente", "Shares", "Costo Prom.", "Valor", "Peso", "G/P"].map(h => (
              <th key={h} style={{
                padding: "8px 14px", fontSize: 10.5, fontWeight: 600,
                color: "var(--text-muted)", textAlign: h === "Cliente" ? "left" : "right",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                {h}
              </th>
            ))}
            <th style={{ padding: "8px 14px", borderBottom: "1px solid var(--border-subtle)", width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.clientId + i} className="holdings-row">
              <td style={{ padding: "10px 14px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent)", color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {r.initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.clientName}</span>
                </div>
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                {r.shares.toLocaleString("es-AR")}
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                ${r.avgCost.toFixed(2)}
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                {fmt(r.value)}
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                {r.weight.toFixed(1)}%
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12.5, fontWeight: 600, borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none", color: r.gainLossPct >= 0 ? "var(--green)" : "var(--red)" }}>
                {r.gainLossPct >= 0 ? "+" : ""}{r.gainLossPct.toFixed(1)}%
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <Link href={`/clients/${r.clientId}?tab=investments`} style={{ color: "var(--text-muted)", display: "flex", justifyContent: "flex-end" }}>
                  <ExternalLink size={13} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Related News ─────────────────────────────────────────────────────────────

function RelatedNews({ ticker }: { ticker: string }) {
  const items = NEWS.filter(n => n.tickers.includes(ticker));
  if (items.length === 0) return null;

  const CATEGORY_LABELS: Record<string, string> = {
    macro: "Macro", earnings: "Resultados", sector: "Sectorial",
    argentina: "Argentina", rates: "Tasas",
  };
  const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
    macro:    { bg: "var(--accent-light)", color: "var(--accent)" },
    earnings: { bg: "oklch(95% 0.04 145)", color: "oklch(38% 0.12 145)" },
    sector:   { bg: "oklch(95% 0.03 280)", color: "oklch(38% 0.12 280)" },
    argentina:{ bg: "oklch(95% 0.06 30)", color: "oklch(42% 0.14 30)" },
    rates:    { bg: "oklch(95% 0.04 200)", color: "oklch(38% 0.12 200)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Noticias relacionadas
      </div>
      {items.map(item => {
        const cat = CATEGORY_COLORS[item.category] ?? { bg: "var(--surface-raised)", color: "var(--text-muted)" };
        const sentColor = item.sentiment === "positive" ? "var(--green)" : item.sentiment === "negative" ? "var(--red)" : "var(--text-muted)";
        const SentIcon = item.sentiment === "positive" ? TrendingUp : item.sentiment === "negative" ? TrendingDown : Minus;
        return (
          <div key={item.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color }}>
                {CATEGORY_LABELS[item.category]}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: "auto" }}>{item.source}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>·</span>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{item.time}</span>
              <span style={{ display: "flex", alignItems: "center", color: sentColor }}><SentIcon size={13} /></span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{item.headline}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.summary}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Suggested Clients ────────────────────────────────────────────────────────

function getSuggestedRationale(
  client: { name: string; risk: string; potential: number; satisfaction: number },
  kind: AssetKind,
  ticker: string,
  assetTypeWeight: number,
): string {
  const first = client.name.split(" ")[0];
  const isEquity = kind === "equity" || kind === "etf";
  const isBond   = kind === "bond"   || kind === "fci";
  const isFx     = kind === "fx";

  if (isEquity && client.risk === "Aggressive")
    return `${first} tiene perfil agresivo con ${assetTypeWeight.toFixed(0)}% en renta variable. ${ticker} es coherente con sus objetivos de crecimiento acelerado.`;
  if (isEquity && client.risk === "Moderate")
    return `Exposición actual a renta variable: ${assetTypeWeight.toFixed(0)}%. Incorporar ${ticker} mejoraría la diversificación sectorial de ${first}.`;
  if (isEquity)
    return `A pesar de su perfil conservador, ${first} tiene potencial de crecimiento (${client.potential}/100) que podría justificar una posición acotada en ${ticker}.`;
  if (isBond && client.risk === "Conservative")
    return `${first} prioriza preservación de capital. ${ticker} encaja en su estrategia con solo ${assetTypeWeight.toFixed(0)}% actual en renta fija.`;
  if (isBond)
    return `Diversificar en renta fija via ${ticker} mejoraría el perfil riesgo/retorno actual de ${first} (${assetTypeWeight.toFixed(0)}% en RF).`;
  if (isFx)
    return `Con ${assetTypeWeight.toFixed(0)}% en dólares, ${first} podría optimizar su cobertura cambiaria incorporando ${ticker}.`;
  if (client.potential > 70)
    return `Alto potencial de crecimiento (${client.potential}/100). ${ticker} se alinea con los objetivos financieros declarados de ${first}.`;
  return `El portafolio de ${first} tiene espacio para diversificar con ${ticker} según su perfil y objetivos actuales.`;
}

function SuggestedClientsSection({ ticker, info }: { ticker: string; info: AssetInfo }) {
  const holdersSet = new Set(
    clients.filter(c => c.positions.some(p => p.ticker === ticker)).map(c => c.id)
  );

  const isEquity = info.kind === "equity" || info.kind === "etf";
  const isBond   = info.kind === "bond"   || info.kind === "fci";
  const isFx     = info.kind === "fx";

  const candidates = clients
    .filter(c => !holdersSet.has(c.id))
    .map(c => {
      // Current exposure to this asset class
      const assetTypeWeight = c.positions.reduce((sum, p) => {
        if (isEquity && p.type === "Renta Variable") return sum + p.weight;
        if (isBond   && (p.type === "Renta Fija" || p.type === "FCI")) return sum + p.weight;
        if (isFx     && (p.type === "Dólar" || p.type === "Efectivo")) return sum + p.weight;
        return sum;
      }, 0);

      let score = c.potential * 0.4;

      // Risk × asset kind fit
      if (isEquity) {
        score += c.risk === "Aggressive" ? 35 : c.risk === "Moderate" ? 15 : 0;
      } else if (isBond) {
        score += c.risk === "Conservative" ? 35 : c.risk === "Moderate" ? 20 : 5;
      } else {
        score += c.risk === "Moderate" ? 20 : 10;
      }

      // Diversification opportunity: less current exposure → more upside
      if (assetTypeWeight < 10) score += 25;
      else if (assetTypeWeight < 30) score += 10;

      // Clients with lower satisfaction may be more open to new ideas
      if (c.satisfaction < 60) score += 8;

      return { client: c, score, assetTypeWeight };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (candidates.length === 0) return null;

  const fitLabel = (score: number) =>
    score >= 65 ? { label: "Alta afinidad", bg: "var(--green-light)", color: "var(--green)" }
    : score >= 45 ? { label: "Afinidad media", bg: "var(--amber-light)", color: "var(--amber)" }
    : { label: "Baja afinidad", bg: "var(--surface-raised)", color: "var(--text-muted)" };

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "var(--accent)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Sparkles size={13} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 1 }}>
            Clientes sugeridos · IA
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
            Clientes sin esta posición que podrían estar interesados
          </div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
          Vale IA · Actualizado ahora
        </span>
      </div>

      {/* Rows */}
      {candidates.map(({ client: c, score, assetTypeWeight }, i) => {
        const fit = fitLabel(score);
        const rationale = getSuggestedRationale(c, info.kind, ticker, assetTypeWeight);
        return (
          <div
            key={c.id}
            style={{
              padding: "14px 18px",
              borderBottom: i < candidates.length - 1 ? "1px solid var(--border-subtle)" : "none",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--accent)", color: "#fff",
              fontSize: 10.5, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {c.initials}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{c.risk} · {c.accountType}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10.5, fontWeight: 600,
                  padding: "2px 8px", borderRadius: 12,
                  background: fit.bg, color: fit.color,
                }}>
                  {fit.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px", lineHeight: 1.55 }}>
                {rationale}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>AUM <strong style={{ color: "var(--text-secondary)" }}>
                    {c.aum >= 1_000_000 ? `$${(c.aum / 1_000_000).toFixed(1)}M` : `$${(c.aum / 1_000).toFixed(0)}k`}
                  </strong></span>
                  <span>Potencial <strong style={{ color: "var(--text-secondary)" }}>{c.potential}/100</strong></span>
                </div>
                <Link
                  href={`/clients/${c.id}?tab=investments`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11.5, fontWeight: 500, color: "var(--accent)",
                    textDecoration: "none",
                    padding: "4px 10px", borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  Ver cliente <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Fallback for unknown tickers ─────────────────────────────────────────────

function buildFallback(ticker: string): AssetInfo | null {
  for (const c of clients) {
    const pos = c.positions.find(p => p.ticker === ticker);
    if (pos) {
      return {
        ticker,
        name: pos.name,
        kind: pos.type === "Renta Variable" ? "equity"
            : pos.type === "Renta Fija"     ? "bond"
            : pos.type === "FCI"            ? "fci"
            : pos.type === "Dólar"          ? "fx"
            : pos.type === "Opciones"       ? "option"
            : "other",
        sector: pos.sector,
        currency: "USD",
        price: pos.currentPrice,
        priceChange: 0,
        priceChangePct: 0,
        tna: pos.tna,
        tea: pos.tea,
        maturityDate: pos.maturityDate,
        duration: pos.duration,
        fciType: pos.fciType,
        return7d: pos.return7d,
        return30d: pos.return30d,
        priceHistory: Array(60).fill(pos.currentPrice),
      };
    }
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AssetDetail({ ticker }: { ticker: string }) {
  const [timeframe, setTimeframe] = useState<"1M" | "3M">("3M");

  const info: AssetInfo | null = getAssetInfo(ticker) ?? buildFallback(ticker);

  if (!info) {
    return (
      <div style={{ padding: 32, maxWidth: 960 }}>
        <Link href="/research" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 24 }}>
          <ChevronLeft size={14} /> Research
        </Link>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-secondary)" }}>
          Activo no encontrado: <code style={{ fontFamily: "monospace", background: "var(--surface-raised)", padding: "2px 6px", borderRadius: 4 }}>{ticker}</code>
        </div>
      </div>
    );
  }

  const positive = info.priceChangePct >= 0;
  const priceColor = info.priceChangePct > 0 ? "var(--green)" : info.priceChangePct < 0 ? "var(--red)" : "var(--text-muted)";
  const PriceIcon = info.priceChangePct > 0 ? TrendingUp : info.priceChangePct < 0 ? TrendingDown : Minus;
  const kindStyle = KIND_COLOR[info.kind];

  const chartData = timeframe === "1M"
    ? info.priceHistory.slice(-22)
    : info.priceHistory;

  // Build metrics pills
  const pills: { label: string; value: string }[] = [];
  if (info.marketCap)       pills.push({ label: "Mkt Cap",    value: info.marketCap });
  if (info.pe)              pills.push({ label: "P/E",        value: `${info.pe}×`  });
  if (info.forwardPE)       pills.push({ label: "P/E Fwd",   value: `${info.forwardPE}×` });
  if (info.eps)             pills.push({ label: "EPS",        value: `$${info.eps}` });
  if (info.beta)            pills.push({ label: "Beta",       value: info.beta.toFixed(2) });
  if (info.dividendYield)   pills.push({ label: "Dividendo",  value: `${info.dividendYield}%` });
  if (info.expenseRatio)    pills.push({ label: "Gasto anual",value: `${info.expenseRatio}%` });
  if (info.aum)             pills.push({ label: "AUM",        value: info.aum });
  if (info.ytdReturn)       pills.push({ label: "YTD",        value: `${info.ytdReturn > 0 ? "+" : ""}${info.ytdReturn}%` });
  if (info.tna)             pills.push({ label: "TNA",        value: `${info.tna}%` });
  if (info.tea)             pills.push({ label: "TEA",        value: `${info.tea}%` });
  if (info.duration)        pills.push({ label: "Duration",   value: `${info.duration.toFixed(2)}a` });
  if (info.maturityDate)    pills.push({ label: "Vencimiento",value: info.maturityDate });
  if (info.yieldToMaturity) pills.push({ label: "TIR",        value: `${info.yieldToMaturity}%` });
  if (info.return7d)        pills.push({ label: "Rend. 7d",   value: `${info.return7d}% TNA` });
  if (info.return30d)       pills.push({ label: "Rend. 30d",  value: `${info.return30d}% TNA` });
  if (info.return1y)        pills.push({ label: "Rend. 1a",   value: `${info.return1y}%` });

  const hasAnalyst = info.analystBuy !== undefined;

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>

      {/* Breadcrumb */}
      <Link
        href="/research"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: 12.5, textDecoration: "none", width: "fit-content" }}
      >
        <ChevronLeft size={13} /> Research
      </Link>

      {/* Asset header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Ticker + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, background: "var(--surface-raised)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 6, color: "var(--text-secondary)" }}>
              {info.ticker}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: kindStyle.bg, color: kindStyle.color }}>
              {KIND_LABEL[info.kind]}
            </span>
            {info.exchange && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{info.exchange}</span>
            )}
            {info.sector && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {info.sector}</span>
            )}
          </div>
          {/* Name */}
          <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: 24, margin: 0, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {info.name}
          </h1>
        </div>

        {/* Price */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {fmtPrice(info.price, info.currency)}
            {info.currency === "ARS" && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginLeft: 4 }}>ARS</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: priceColor, fontWeight: 600, fontSize: 13 }}>
            <PriceIcon size={14} />
            {info.priceChange > 0 ? "+" : ""}{info.priceChange.toFixed(2)} ({info.priceChangePct > 0 ? "+" : ""}{info.priceChangePct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Price chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Evolución del precio
          </span>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 7, padding: 3 }}>
            {(["1M", "3M"] as const).map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)} style={{
                fontSize: 11.5, fontWeight: timeframe === tf ? 700 : 400,
                padding: "3px 10px", borderRadius: 5, border: "none",
                background: timeframe === tf ? "var(--accent)" : "transparent",
                color: timeframe === tf ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
              }}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PriceChart data={chartData} positive={positive} currency={info.currency} />
        {info.high52w && info.low52w && (
          <div style={{ paddingTop: 4 }}>
            <RangeBar low={info.low52w} high={info.high52w} current={info.price} />
          </div>
        )}
      </div>

      {/* Key metrics pills */}
      {pills.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
          {pills.map(p => <MetricPill key={p.label} label={p.label} value={p.value} />)}
        </div>
      )}

      {/* Two-column: analyst + description | (nothing extra for now, keeps it clean) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Description */}
        {info.description && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Descripción</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {info.description}
            </p>
          </div>
        )}

        {/* Analyst + Price target */}
        {hasAnalyst && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart2 size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Analistas de Wall Street</span>
            </div>

            <AnalystBar buy={info.analystBuy!} hold={info.analystHold!} sell={info.analystSell!} />

            {info.priceTargetAvg && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Precio objetivo
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                    ${info.priceTargetAvg}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    promedio · rango ${info.priceTargetLow}–${info.priceTargetHigh}
                  </span>
                </div>
                {/* Visual range bar for price target */}
                <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 3 }}>
                  {/* Current price marker */}
                  <div style={{
                    position: "absolute", top: -2,
                    left: `${Math.max(0, Math.min(100, ((info.price - info.priceTargetLow!) / (info.priceTargetHigh! - info.priceTargetLow!)) * 100))}%`,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "var(--text-secondary)", border: "2px solid var(--surface)",
                    transform: "translateX(-50%)",
                  }} title="Precio actual" />
                  {/* Target marker */}
                  <div style={{
                    position: "absolute", top: -2,
                    left: `${((info.priceTargetAvg - info.priceTargetLow!) / (info.priceTargetHigh! - info.priceTargetLow!)) * 100}%`,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "var(--accent)", border: "2px solid var(--surface)",
                    transform: "translateX(-50%)",
                  }} title="Precio objetivo" />
                  <div style={{ height: "100%", background: "var(--accent-light)", borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                  <span>Mínimo ${info.priceTargetLow}</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    ● actual  ● objetivo promedio
                  </span>
                  <span>Máximo ${info.priceTargetHigh}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client exposure */}
        <ClientExposureSection ticker={ticker} />

        {/* Suggested clients */}
        <SuggestedClientsSection ticker={ticker} info={info} />

        {/* Related news */}
        <RelatedNews ticker={ticker} />
      </div>

    </div>
  );
}
