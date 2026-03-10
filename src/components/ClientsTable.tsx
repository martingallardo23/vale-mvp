import Link from "next/link";

type RiskTier = "Conservative" | "Moderate" | "Aggressive";
type Status = "On Track" | "Review Due" | "Needs Attention";

interface Client {
  id: string;
  name: string;
  aum: number;
  ytdReturn: number;
  benchmark: number;
  risk: RiskTier;
  lastReview: string;
  status: Status;
}

const clients: Client[] = [
  { id: "TC001", name: "Thomas Lee",        aum: 4100000, ytdReturn: 15.6, benchmark: 12.1, risk: "Moderate",     lastReview: "3 days ago",   status: "On Track" },
  { id: "ER002", name: "Elena Rodriguez",   aum: 3200000, ytdReturn: 22.7, benchmark: 18.4, risk: "Aggressive",   lastReview: "1 week ago",   status: "On Track" },
  { id: "MA003", name: "Marcus Allen",      aum: 2900000, ytdReturn: 19.8, benchmark: 18.4, risk: "Aggressive",   lastReview: "5 days ago",   status: "On Track" },
  { id: "SC004", name: "Sarah Chen",        aum: 2400000, ytdReturn: 18.3, benchmark: 18.4, risk: "Aggressive",   lastReview: "2 weeks ago",  status: "Review Due" },
  { id: "JW005", name: "James Whitmore",    aum: 1800000, ytdReturn: 12.1, benchmark: 12.1, risk: "Moderate",     lastReview: "1 month ago",  status: "Review Due" },
  { id: "PW006", name: "Patricia Walsh",    aum: 1500000, ytdReturn:  8.9, benchmark:  7.2, risk: "Moderate",     lastReview: "6 weeks ago",  status: "Review Due" },
  { id: "RK007", name: "Robert Kim",        aum:  890000, ytdReturn: -2.4, benchmark:  6.1, risk: "Conservative", lastReview: "3 months ago", status: "Needs Attention" },
  { id: "DP008", name: "Diana Park",        aum:  720000, ytdReturn:  5.2, benchmark:  6.1, risk: "Conservative", lastReview: "2 months ago", status: "Review Due" },
];

const fmtAum = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${(n / 1_000).toFixed(0)}k`;

const statusStyles: Record<Status, { bg: string; color: string; dot: string }> = {
  "On Track":        { bg: "var(--green-light)",  color: "var(--green)",  dot: "var(--green)" },
  "Review Due":      { bg: "var(--amber-light)",  color: "var(--amber)",  dot: "var(--amber)" },
  "Needs Attention": { bg: "var(--red-light)",    color: "var(--red)",    dot: "var(--red)" },
};

const riskColor: Record<RiskTier, string> = {
  Conservative: "var(--text-muted)",
  Moderate:     "var(--accent)",
  Aggressive:   "var(--red)",
};

const riskLabel: Record<RiskTier, string> = { Conservative: "Conservador", Moderate: "Moderado", Aggressive: "Agresivo" };
const statusLabelMap: Record<Status, string> = { "On Track": "Al día", "Review Due": "Revisión pendiente", "Needs Attention": "Requiere atención" };

export function ClientsTable() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 18, color: "var(--text-primary)", lineHeight: 1 }}>
            Cartera de clientes
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            8 clientes activos · $17.51M AUM total
          </div>
        </div>
        <button
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--accent)",
            background: "var(--accent-light)",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          + Agregar cliente
        </button>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-raised)" }}>
            {[
              { label: "Cliente", align: "left" },
              { label: "AUM", align: "right" },
              { label: "Retorno YTD", align: "right" },
              { label: "vs Referencia", align: "right" },
              { label: "Riesgo", align: "left" },
              { label: "Última revisión", align: "left" },
              { label: "Estado", align: "left" },
            ].map(({ label, align }) => (
              <th
                key={label}
                style={{
                  padding: "10px 20px",
                  textAlign: align as "left" | "right",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid var(--border)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => {
            const alpha = c.ytdReturn - c.benchmark;
            const ss = statusStyles[c.status];
            return (
              <tr
                key={c.id}
                style={{
                  borderBottom: i < clients.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  cursor: "pointer",
                }}
              >
                {/* Client */}
                <td style={{ padding: "14px 20px" }}>
                  <Link href={`/clients/${c.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "var(--accent-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--accent)",
                        flexShrink: 0,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.id}</div>
                    </div>
                  </Link>
                </td>

                {/* AUM */}
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 15, color: "var(--text-primary)" }}>
                    {fmtAum(c.aum)}
                  </span>
                </td>

                {/* YTD Return */}
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: c.ytdReturn >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {c.ytdReturn >= 0 ? "+" : ""}{c.ytdReturn.toFixed(1)}%
                  </span>
                </td>

                {/* vs Benchmark */}
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: alpha >= 0 ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {alpha >= 0 ? "+" : ""}{alpha.toFixed(1)}%
                    </span>
                    {/* Mini bar showing alpha */}
                    <div style={{ width: 48, height: 3, borderRadius: 2, background: "var(--border)", position: "relative", overflow: "hidden" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: alpha >= 0 ? "50%" : `${50 + Math.max(alpha / 0.3, -50)}%`,
                          width: `${Math.min(Math.abs(alpha) / 0.3, 50)}%`,
                          height: "100%",
                          background: alpha >= 0 ? "var(--green)" : "var(--red)",
                          borderRadius: 2,
                        }}
                      />
                      <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "var(--border)" }} />
                    </div>
                  </div>
                </td>

                {/* Risk */}
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: riskColor[c.risk],
                    }}
                  >
                    {riskLabel[c.risk]}
                  </span>
                </td>

                {/* Last Review */}
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{c.lastReview}</span>
                </td>

                {/* Status */}
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: ss.bg,
                      color: ss.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: ss.dot,
                        flexShrink: 0,
                      }}
                    />
                    {statusLabelMap[c.status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
