import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeVariant?: "green" | "red" | "amber" | "neutral";
  icon?: ReactNode;
}

export function KpiCard({ label, value, sub, badge, badgeVariant = "neutral", icon }: KpiCardProps) {
  const badgeColors: Record<string, { bg: string; color: string }> = {
    green:   { bg: "var(--green-light)",  color: "var(--green)" },
    red:     { bg: "var(--red-light)",    color: "var(--red)" },
    amber:   { bg: "var(--amber-light)",  color: "var(--amber)" },
    neutral: { bg: "var(--surface-raised)", color: "var(--text-secondary)" },
  };
  const bc = badgeColors[badgeVariant];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </span>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
      </div>

      <div
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontSize: 32,
          color: "var(--text-primary)",
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 20,
              background: bc.bg,
              color: bc.color,
              letterSpacing: "0.02em",
            }}
          >
            {badge}
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</span>
        )}
      </div>
    </div>
  );
}
