"use client";

import { useCurrency, USD_TO_ARS } from "@/lib/currencyContext";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 7,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {(["USD", "ARS"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            style={{
              flex: 1,
              fontSize: 11.5,
              fontWeight: 600,
              padding: "5px 11px",
              border: "none",
              background: currency === c ? "var(--accent)" : "transparent",
              color: currency === c ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "background 0.13s, color 0.13s",
              lineHeight: 1,
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          paddingLeft: 2,
          whiteSpace: "nowrap",
        }}
      >
        1 USD = AR${USD_TO_ARS.toLocaleString("es-AR")}
      </div>
    </div>
  );
}
