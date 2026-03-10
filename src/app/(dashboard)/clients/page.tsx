"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { clients } from "@/lib/clientData";
import type { RiskTier, Status } from "@/lib/clientData";
import { Search, SlidersHorizontal, ChevronRight, Heart, Smile, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currencyContext";

const riskOrder: Record<RiskTier, number> = { Conservative: 1, Moderate: 2, Aggressive: 3 };

type SortKey = "name" | "aum" | "ytdReturn" | "risk" | "status";

function scoreColor(v: number) {
  if (v >= 70) return "var(--green)";
  if (v >= 45) return "var(--amber)";
  return "var(--red)";
}

function reviewColor(lastReview: string): string {
  const s = lastReview.toLowerCase();
  if (/^\d+ days? ago/.test(s) || s === "1 week ago") return "var(--green)";
  if (s === "2 weeks ago" || s === "1 month ago")       return "var(--amber)";
  return "var(--red)";
}

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterRisk, setFilterRisk] = useState<RiskTier | "All">("All");
  const [smartFilter, setSmartFilter] = useState<"churn" | "potential" | "lowSat" | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("aum");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const q = query.toLowerCase();
        const matchQuery = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
        const matchStatus = filterStatus === "All" || c.status === filterStatus;
        const matchRisk = filterRisk === "All" || c.risk === filterRisk;
        const matchSmart = !smartFilter
          || (smartFilter === "churn"     && c.loyalty < 60)
          || (smartFilter === "potential" && c.potential >= 70)
          || (smartFilter === "lowSat"    && c.satisfaction < 60);
        return matchQuery && matchStatus && matchRisk && matchSmart;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name")      cmp = a.name.localeCompare(b.name);
        else if (sortBy === "aum")  cmp = a.aum - b.aum;
        else if (sortBy === "ytdReturn") cmp = a.ytdReturn - b.ytdReturn;
        else if (sortBy === "risk") cmp = riskOrder[a.risk] - riskOrder[b.risk];
        else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [query, filterStatus, filterRisk, smartFilter, sortBy, sortDir]);

  const totalAum = filtered.reduce((s, c) => s + c.aum, 0);
  const { fmtCompact, adjReturn } = useCurrency();
  const fmtAum = fmtCompact;

  const SortArrow = ({ col }: { col: SortKey }) =>
    sortBy === col ? (
      <span style={{ marginLeft: 3, opacity: 0.6 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  const colHead = (label: string, col: SortKey, align: "left" | "right" = "left") => (
    <th
      onClick={() => handleSort(col)}
      style={{
        padding: "10px 20px",
        textAlign: align,
        fontSize: 10.5,
        fontWeight: 600,
        color: sortBy === col ? "var(--accent)" : "var(--text-muted)",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        background: "var(--surface-raised)",
      }}
    >
      {label}<SortArrow col={col} />
    </th>
  );

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
          <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: 20, margin: 0, color: "var(--text-primary)", lineHeight: 1 }}>
            Clientes
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {filtered.length} de {clients.length} clientes · {fmtAum(totalAum)} AUM mostrado
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              fontSize: 12, fontWeight: 500, color: "#fff", background: "var(--accent)",
              border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer",
            }}
          >
            + Agregar cliente
          </button>
        </div>
      </header>

      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Search + filters row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Search */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 7, padding: "8px 12px", flex: 1, minWidth: 200, maxWidth: 320,
            }}
          >
            <Search size={13} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, ID o ciudad…"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: "var(--text-primary)", width: "100%",
              }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <SlidersHorizontal size={13} color="var(--text-muted)" />
            {(["All", "On Track", "Review Due", "Needs Attention"] as const).map((s) => {
              const statusDisplayLabel: Record<string, string> = {
                "All": "Todos", "On Track": "Al día", "Review Due": "Revisión pendiente", "Needs Attention": "Requiere atención",
              };
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 20, border: "1px solid",
                    borderColor: filterStatus === s ? "transparent" : "var(--border)",
                    background: filterStatus === s ? (s === "All" ? "var(--accent)" : s === "On Track" ? "var(--green)" : s === "Review Due" ? "var(--amber)" : "var(--red)") : "var(--surface)",
                    color: filterStatus === s ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {statusDisplayLabel[s]}
                </button>
              );
            })}
          </div>

          {/* Risk filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["All", "Conservative", "Moderate", "Aggressive"] as const).map((r) => {
              const riskDisplayLabel: Record<string, string> = {
                "All": "Todos", "Conservative": "Conservador", "Moderate": "Moderado", "Aggressive": "Agresivo",
              };
              return (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)",
                    background: filterRisk === r ? "var(--accent-light)" : "var(--surface)",
                    color: filterRisk === r ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: filterRisk === r ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {riskDisplayLabel[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Filtros inteligentes
          </span>
          {([
            { id: "churn",     label: "⚠ En riesgo de churn",  activeColor: "var(--red)",   activeBg: "oklch(97% 0.015 25)" },
            { id: "potential", label: "★ Alto potencial",        activeColor: "var(--accent)", activeBg: "var(--accent-light)" },
            { id: "lowSat",    label: "↓ Baja satisfacción",    activeColor: "var(--amber)", activeBg: "oklch(97% 0.02 80)"  },
          ] as const).map(({ id, label, activeColor, activeBg }) => {
            const isActive = smartFilter === id;
            return (
              <button
                key={id}
                onClick={() => setSmartFilter(isActive ? null : id)}
                style={{
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  padding: "5px 13px", borderRadius: 20,
                  border: `1px solid ${isActive ? activeColor : "var(--border)"}`,
                  background: isActive ? activeBg : "var(--surface)",
                  color: isActive ? activeColor : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {label}
              </button>
            );
          })}
          {smartFilter && (
            <button
              onClick={() => setSmartFilter(null)}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer",
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Table */}
        <div
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {colHead("Cliente", "name", "left")}
                {colHead("AUM", "aum", "right")}
                {colHead("Retorno YTD", "ytdReturn", "right")}
                <th style={{ padding: "10px 20px", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)", textAlign: "right" }}>
                  vs Referencia
                </th>
                <th style={{ padding: "10px 20px", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
                  Última revisión
                </th>
                <th style={{ padding: "10px 20px", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)", whiteSpace: "nowrap" }}>
                  Leal · Sat · Pot
                </th>
                <th style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)", width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    Ningún cliente coincide con los filtros.
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const adjYtd   = adjReturn(c.ytdReturn);
                const adjBench = adjReturn(c.benchmark);
                const alpha    = adjYtd - adjBench;
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/clients/${c.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--accent-light)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
                          }}
                        >
                          {c.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.id} · {c.accountType.split("+")[0].trim()}</div>
                        </div>
                      </Link>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 15, color: "var(--text-primary)" }}>
                        {fmtAum(c.aum)}
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: adjYtd >= 0 ? "var(--green)" : "var(--red)" }}>
                        {adjYtd >= 0 ? "+" : ""}{adjYtd.toFixed(1)}%
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: alpha >= 0 ? "var(--green)" : "var(--red)" }}>
                        {alpha >= 0 ? "+" : ""}{alpha.toFixed(1)}%
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: reviewColor(c.lastReview) }}>{c.lastReview}</span>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {([
                          { icon: Heart,      value: c.loyalty,       title: "Lealtad" },
                          { icon: Smile,      value: c.satisfaction,  title: "Satisfacción" },
                          { icon: TrendingUp, value: c.potential,     title: "Potencial" },
                        ] as const).map(({ icon: Icon, value, title }) => (
                          <div key={title} title={`${title}: ${value}%`} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Icon size={11} color={scoreColor(value)} />
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: scoreColor(value), lineHeight: 1 }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: "14px 12px", textAlign: "center" }}>
                      <Link href={`/clients/${c.id}`} style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
