"use client";

import type { Client } from "@/lib/clientData";
import { Calendar, Target, CreditCard, MapPin, Phone, Mail, User, Heart, Smile, TrendingUp } from "lucide-react";
import { AiInsights } from "./AiInsights";

const statusColors: Record<string, { bg: string; color: string }> = {
  "On Track":        { bg: "var(--green-light)",  color: "var(--green)" },
  "Review Due":      { bg: "var(--amber-light)",  color: "var(--amber)" },
  "Needs Attention": { bg: "var(--red-light)",    color: "var(--red)" },
};

const statusLabels: Record<string, string> = {
  "On Track":        "Al día",
  "Review Due":      "Revisión pendiente",
  "Needs Attention": "Requiere atención",
};

function scoreColor(v: number) {
  if (v >= 70) return "var(--green)";
  if (v >= 45) return "var(--amber)";
  return "var(--red)";
}

function ScoreBar({ value }: { value: number }) {
  const color = scoreColor(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: 24, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/100</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}


export function OverviewTab({ client }: { client: Client }) {
  const sc = statusColors[client.status];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Client health metrics */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Salud del cliente</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Indicadores predictivos de relación</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {[
            { icon: Heart,      label: "Lealtad",       sub: "Probabilidad de retención",   value: client.loyalty },
            { icon: Smile,      label: "Satisfacción",  sub: "Satisfacción con el rendimiento", value: client.satisfaction },
            { icon: TrendingUp, label: "Potencial",     sub: "Potencial de crecimiento AUM", value: client.potential },
          ].map(({ icon: Icon, label, sub, value }, i) => (
            <div
              key={label}
              style={{
                padding: "20px 24px",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon size={13} color={scoreColor(value)} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1 }}>{sub}</div>
                </div>
              </div>
              <ScoreBar value={value} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Client profile */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Perfil del cliente</div>
          </div>
          <div style={{ padding: "4px 0" }}>
            {[
              { icon: User,     label: "Edad",          value: `${client.age} años (FN: ${new Date(client.dob).toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" })})` },
              { icon: MapPin,   label: "Ubicación",     value: client.location },
              { icon: Mail,     label: "Correo",        value: client.email },
              { icon: Phone,    label: "Teléfono",      value: client.phone },
              { icon: Calendar, label: "Cliente desde", value: client.since },
              { icon: CreditCard, label: "Tipo de cuenta", value: client.accountType },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={14} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Goals */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              flex: 1,
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={14} color="var(--text-muted)" />
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Objetivos financieros</div>
            </div>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {client.goals.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%", background: "var(--accent-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "var(--accent)", flexShrink: 0, marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review info */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Programación de revisión</div>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Última revisión</span>
                <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{client.lastReview}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Próxima revisión</span>
                <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{client.nextReview}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Estado</span>
                <span
                  style={{
                    fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                    background: sc.bg, color: sc.color,
                  }}
                >
                  {statusLabels[client.status] ?? client.status}
                </span>
              </div>
              <button
                style={{
                  marginTop: 4, width: "100%", padding: "9px", borderRadius: 7,
                  border: "1px solid var(--border)", background: "transparent",
                  fontSize: 13, fontWeight: 500, color: "var(--accent)", cursor: "pointer",
                }}
              >
                Agendar revisión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AiInsights client={client} />

    </div>
  );
}
