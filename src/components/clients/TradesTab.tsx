"use client";

import type { Client } from "@/lib/clientData";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCurrency } from "@/lib/currencyContext";

const tradeTypeLabel: Record<string, string> = { Buy: "Compra", Sell: "Venta" };

export function TradesTab({ client }: { client: Client }) {
  const { fmtCompact } = useCurrency();
  const buys = client.trades.filter(t => t.type === "Buy").reduce((s, t) => s + t.total, 0);
  const sells = client.trades.filter(t => t.type === "Sell").reduce((s, t) => s + t.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        }}
      >
        {[
          { label: "Total de operaciones", value: `${client.trades.length}`, sub: "en el historial" },
          { label: "Total comprado",        value: fmtCompact(buys), sub: `${client.trades.filter(t => t.type === "Buy").length} órdenes de compra` },
          { label: "Total vendido",         value: fmtCompact(sells), sub: `${client.trades.filter(t => t.type === "Sell").length} órdenes de venta` },
        ].map((m, i) => (
          <div key={m.label} style={{ padding: "20px 24px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, color: "var(--text-primary)", marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Trade list */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Historial de transacciones</div>
          <button
            style={{
              fontSize: 12, padding: "5px 12px", borderRadius: 6,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", cursor: "pointer",
            }}
          >
            Exportar CSV
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-raised)" }}>
              {["Fecha", "Tipo", "Activo", "Acciones", "Precio", "Total", "Nota"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: i >= 3 && i <= 5 ? "right" : "left",
                    fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {client.trades.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < client.trades.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {t.date}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                      background: t.type === "Buy" ? "var(--green-light)" : "var(--red-light)",
                      color: t.type === "Buy" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {t.type === "Buy" ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                    {tradeTypeLabel[t.type] ?? t.type}
                  </span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{t.ticker}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{t.name}</div>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, color: "var(--text-primary)" }}>
                  {t.shares.toLocaleString()}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, color: "var(--text-primary)" }}>
                  ${t.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 14, color: t.type === "Buy" ? "var(--green)" : "var(--red)" }}>
                    {t.type === "Buy" ? "−" : "+"}{fmtCompact(t.total)}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", maxWidth: 260 }}>
                  {t.note ? (
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>{t.note}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
