import type { Client } from "@/lib/clientData";

const riskLabels: Record<number, string> = {
  1: "Muy conservador",
  2: "Conservador",
  3: "Conservador–Moderado",
  4: "Moderado",
  5: "Moderado",
  6: "Moderado–Agresivo",
  7: "Agresivo",
  8: "Agresivo",
  9: "Muy agresivo",
  10: "Especulativo",
};

const riskColors: Record<number, string> = {
  1: "oklch(52% 0.14 155)",
  2: "oklch(56% 0.13 155)",
  3: "oklch(62% 0.13 130)",
  4: "oklch(68% 0.14 90)",
  5: "oklch(68% 0.14 80)",
  6: "oklch(68% 0.14 65)",
  7: "oklch(62% 0.14 35)",
  8: "oklch(58% 0.15 25)",
  9: "oklch(52% 0.16 20)",
  10: "oklch(45% 0.18 15)",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{score}/5</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <div
          style={{
            width: `${(score / 5) * 100}%`,
            height: "100%",
            background: riskColors[Math.round((score / 5) * 10)] ?? "var(--accent)",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

export function RiskTab({ client }: { client: Client }) {
  const avgScore = client.riskAnswers.reduce((s, a) => s + a.score, 0) / client.riskAnswers.length;
  const scoreColor = riskColors[client.riskScore] ?? "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Overall risk score */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* Gauge card */}
        <div
          style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Puntuación de riesgo</div>
          {/* Visual gauge */}
          <div style={{ position: "relative", width: 140, height: 72 }}>
            <svg width="140" height="72" viewBox="0 0 140 72">
              {/* Background arc */}
              <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round" />
              {/* Score arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(client.riskScore / 10) * 188} 188`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              {/* Center text */}
              <text x="70" y="60" textAnchor="middle" style={{ fontFamily: "var(--font-dm-serif)", fontSize: 28, fill: "var(--text-primary)" }}>
                {client.riskScore}
              </text>
            </svg>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>de 10</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: scoreColor, marginBottom: 4 }}>
              {riskLabels[client.riskScore]}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Prom. cuestionario: {avgScore.toFixed(1)}/5
            </div>
          </div>
          <div
            style={{
              width: "100%", padding: "10px", borderRadius: 7,
              background: "var(--surface-raised)", border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Nivel asignado</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: scoreColor }}>{client.risk}</div>
          </div>
        </div>

        {/* Questionnaire */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Cuestionario de riesgo</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Respuestas de la última revisión IPS</div>
          </div>
          <div style={{ padding: "0" }}>
            {client.riskAnswers.map((q, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 24px",
                  borderBottom: i < client.riskAnswers.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Q{i + 1}. {q.question}</div>
                  <div style={{ fontSize: 13.5, color: "var(--text-primary)", fontStyle: "italic" }}>"{q.answer}"</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
                  <div style={{ fontSize: 18, fontFamily: "var(--font-dm-serif)", color: riskColors[q.score * 2] ?? "var(--accent)" }}>{q.score}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>/ 5</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volatility metrics */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Métricas de riesgo</div>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <ScoreBar label={`Volatilidad anualizada — ${client.volatility.toFixed(1)}%`}  score={Math.min(Math.round(client.volatility / 6), 5)} />
          <ScoreBar label={`Caída máxima — ${client.maxDrawdown.toFixed(1)}%`}           score={Math.min(Math.round(Math.abs(client.maxDrawdown) / 4), 5)} />
          <ScoreBar label={`Beta — ${client.beta.toFixed(2)} (sensibilidad al mercado)`} score={Math.min(Math.round(client.beta * 3), 5)} />
          <ScoreBar label={`Ratio de Sharpe — ${client.sharpe.toFixed(2)} (retorno ajustado por riesgo)`} score={Math.min(Math.round(Math.max(client.sharpe, 0) * 2), 5)} />
        </div>
      </div>
    </div>
  );
}
