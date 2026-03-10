"use client";

import { useMemo } from "react";
import { getLiquidityBreakdown, type Position, type LiquidityItem } from "@/lib/clientData";
import { useCurrency } from "@/lib/currencyContext";

// ─── Colour helpers ──────────────────────────────────────────────────────────

const TIER_COLORS = {
  inmediata: { bar: "oklch(55% 0.18 155)", label: "var(--green)",  bg: "var(--green-light)"  },
  alta:      { bar: "oklch(58% 0.16 200)", label: "var(--accent)", bg: "var(--accent-light)" },
} as const;

const TYPE_LABEL: Record<string, string> = {
  "Efectivo":       "Cash",
  "FCI":            "FCI MM",
  "Renta Fija":     "Letra / Caución",
  "Dólar":          "Dólar MEP",
};

const TIER_LABEL: Record<string, string> = {
  inmediata: "T+0",
  alta:      "T+1–5",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "inmediata" | "alta" | "resto" }) {
  if (tier === "resto") return null;
  const c = TIER_COLORS[tier];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      padding: "2px 7px", borderRadius: 20,
      background: c.bg, color: c.label,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {TIER_LABEL[tier]}
    </span>
  );
}

function StackedBar({ immediatePct, nearPct }: { immediatePct: number; nearPct: number }) {
  const totalPct = immediatePct + nearPct;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Bar */}
      <div style={{ height: 8, borderRadius: 4, background: "var(--surface-raised)", overflow: "hidden", display: "flex" }}>
        {immediatePct > 0 && (
          <div style={{ width: `${Math.min(immediatePct, 100)}%`, background: TIER_COLORS.inmediata.bar, transition: "width 0.3s" }} />
        )}
        {nearPct > 0 && (
          <div style={{ width: `${Math.min(nearPct, 100)}%`, background: TIER_COLORS.alta.bar, transition: "width 0.3s" }} />
        )}
      </div>
      {/* Labels */}
      <div style={{ display: "flex", gap: 12 }}>
        {immediatePct > 0 && (
          <span style={{ fontSize: 10.5, color: TIER_COLORS.inmediata.label, fontWeight: 600 }}>
            <span style={{ opacity: 0.7, fontWeight: 400 }}>T+0 </span>{immediatePct.toFixed(1)}%
          </span>
        )}
        {nearPct > 0 && (
          <span style={{ fontSize: 10.5, color: TIER_COLORS.alta.label, fontWeight: 600 }}>
            <span style={{ opacity: 0.7, fontWeight: 400 }}>T+1–5 </span>{nearPct.toFixed(1)}%
          </span>
        )}
        <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginLeft: "auto" }}>
          {(100 - totalPct).toFixed(1)}% ilíquido
        </span>
      </div>
    </div>
  );
}

function ItemRow({ item, fmtCompact }: { item: LiquidityItem; fmtCompact: (v: number) => string }) {
  return (
    <tr>
      <td style={{ padding: "8px 16px 8px 0", verticalAlign: "middle" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>{item.ticker}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.name}
        </div>
      </td>
      <td style={{ padding: "8px 12px 8px 0", verticalAlign: "middle" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
          {TYPE_LABEL[item.type] ?? item.type}
        </span>
      </td>
      <td style={{ padding: "8px 12px 8px 0", textAlign: "right", verticalAlign: "middle" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-dm-serif)" }}>
          {fmtCompact(item.value)}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1 }}>{item.pct.toFixed(1)}%</div>
      </td>
      {item.tna !== undefined ? (
        <td style={{ padding: "8px 0 8px 0", textAlign: "right", verticalAlign: "middle" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
            {item.tna.toFixed(1)}% TNA
          </span>
        </td>
      ) : (
        <td style={{ padding: "8px 0 8px 0", textAlign: "right", verticalAlign: "middle" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>—</span>
        </td>
      )}
      <td style={{ padding: "8px 0 8px 16px", textAlign: "right", verticalAlign: "middle" }}>
        <TierBadge tier={item.tier} />
      </td>
    </tr>
  );
}

// ─── Main widget ─────────────────────────────────────────────────────────────

interface Props {
  /** Pass individual client positions OR aggregated list from all clients */
  positions: Position[];
  /** Optional: total AUM to use for % calculation (defaults to sum of positions) */
  aum?: number;
  title?: string;
}

export function LiquidityWidget({ positions, aum, title = "Liquidez disponible" }: Props) {
  const { fmtCompact } = useCurrency();

  const bd = useMemo(() => {
    const base = getLiquidityBreakdown(positions);
    if (aum && aum > 0 && aum !== base.total) {
      const scale = base.total / aum;
      return {
        ...base,
        total:         aum,
        liquidPct:     base.liquid / aum * 100,
        immediatePct:  base.immediate / aum * 100,
        nearPct:       base.near / aum * 100,
        items: base.items.map(it => ({ ...it, pct: it.value / aum * 100 })),
        _scale: scale,
      };
    }
    return base;
  }, [positions, aum]);

  const liquidPctColor =
    bd.liquidPct >= 10 ? "var(--green)" :
    bd.liquidPct >= 5  ? "var(--amber)" : "var(--red)";

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 10 }}>
            Efectivo · FCI MM · Letras · Cauciones · Dólar MEP
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "var(--text-primary)" }}>
            {fmtCompact(bd.liquid)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: liquidPctColor }}>
            {bd.liquidPct.toFixed(1)}%
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>del portafolio</span>
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Summary cards + bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "center" }}>
          {/* T+0 card */}
          <div style={{ padding: "10px 14px", background: "var(--green-light)", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--green) 25%, transparent)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--green)", textTransform: "uppercase", marginBottom: 4 }}>
              T+0 · Inmediata
            </div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, color: "var(--text-primary)", lineHeight: 1 }}>
              {fmtCompact(bd.immediate)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              Efectivo &amp; FCI MM · {bd.immediatePct.toFixed(1)}%
            </div>
          </div>

          {/* T+1–5 card */}
          <div style={{ padding: "10px 14px", background: "var(--accent-light)", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 4 }}>
              T+1–5 · Alta liquidez
            </div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, color: "var(--text-primary)", lineHeight: 1 }}>
              {fmtCompact(bd.near)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              Letras · Cauciones · Dólar · {bd.nearPct.toFixed(1)}%
            </div>
          </div>

          {/* Total liquid */}
          <div style={{ padding: "10px 14px", background: "var(--surface-raised)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Total disponible
            </div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, color: liquidPctColor, lineHeight: 1 }}>
              {fmtCompact(bd.liquid)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              {bd.liquidPct.toFixed(1)}% del portafolio
            </div>
          </div>

          {/* Mini visual bar (vertical) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, height: 72, justifyContent: "flex-end" }}>
            <div style={{ width: 28, borderRadius: "3px 3px 0 0", background: TIER_COLORS.alta.bar, height: `${Math.min(bd.nearPct * 3, 40)}%`, minHeight: bd.near > 0 ? 4 : 0 }} />
            <div style={{ width: 28, borderRadius: bd.near > 0 ? 0 : "3px 3px 0 0", background: TIER_COLORS.inmediata.bar, height: `${Math.min(bd.immediatePct * 3, 60)}%`, minHeight: bd.immediate > 0 ? 4 : 0 }} />
            <div style={{ width: 28, height: 6, background: "var(--surface-raised)", borderRadius: "0 0 3px 3px" }} />
          </div>
        </div>

        {/* Stacked percentage bar */}
        <StackedBar immediatePct={bd.immediatePct} nearPct={bd.nearPct} />

        {/* Instrument table */}
        {bd.items.length > 0 ? (
          <div style={{ overflow: "hidden", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-raised)" }}>
                  {["Instrumento", "Tipo", "Valor", "TNA", "Plazo"].map((h, i) => (
                    <th key={h} style={{
                      padding: "7px 0 7px " + (i === 0 ? "16px" : i === 4 ? "0" : "12px"),
                      paddingRight: i === 4 ? "16px" : 0,
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "var(--text-muted)",
                      textAlign: i >= 2 ? "right" : "left",
                      borderBottom: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bd.items.map((item, i) => (
                  <tr key={item.ticker + i} style={{ borderBottom: i < bd.items.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <td style={{ padding: "8px 0 8px 16px", verticalAlign: "middle" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>{item.ticker}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
                        {TYPE_LABEL[item.type] ?? item.type}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", verticalAlign: "middle" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-dm-serif)" }}>
                        {fmtCompact(item.value)}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1 }}>{item.pct.toFixed(1)}%</div>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", verticalAlign: "middle" }}>
                      {item.tna !== undefined
                        ? <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{item.tna.toFixed(1)}%</span>
                        : <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "8px 16px 8px 12px", textAlign: "right", verticalAlign: "middle" }}>
                      {item.tier !== "resto" && <TierBadge tier={item.tier} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
            Sin posiciones líquidas identificadas
          </div>
        )}
      </div>
    </div>
  );
}
