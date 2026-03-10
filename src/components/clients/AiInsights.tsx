"use client";

import { useState } from "react";
import { Sparkles, Share2, CheckCheck, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { Client } from "@/lib/clientData";
import { aiInsights, type AIAction, type AINewsItem, type ActionUrgency, type NewsSentiment } from "@/lib/aiMockData";

const urgencyDot: Record<ActionUrgency, string> = {
  high:   "var(--red)",
  medium: "var(--amber)",
  low:    "var(--accent)",
};

const urgencyPill: Record<ActionUrgency, { bg: string; color: string }> = {
  high:   { bg: "var(--red-light)",   color: "var(--red)"   },
  medium: { bg: "var(--amber-light)", color: "var(--amber)" },
  low:    { bg: "var(--accent-light)",color: "var(--accent)" },
};

const urgencyLabel: Record<ActionUrgency, string> = {
  high: "Urgente", medium: "Medio", low: "Bajo",
};

const sentimentColor: Record<NewsSentiment, string> = {
  positive: "var(--green)",
  negative: "var(--red)",
  neutral:  "var(--text-muted)",
};

function ActionRow({ action, last }: { action: AIAction; last: boolean }) {
  const [sent, setSent] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pill = urgencyPill[action.urgency];

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--border-subtle)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: urgencyDot[action.urgency],
          flexShrink: 0, marginTop: 5,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {action.title}
          </span>
          <span
            style={{
              fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
              background: pill.bg, color: pill.color,
              letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
            }}
          >
            {urgencyLabel[action.urgency]}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.55 }}>
          {action.rationale}
        </p>
        {action.tradeDetails && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <code
              style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 5,
                background: "var(--bg)", color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)", fontFamily: "monospace",
              }}
            >
              {action.tradeDetails}
            </code>
            <button
              onClick={() => setSent(true)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 500, padding: "5px 11px", borderRadius: 7,
                border: sent ? "none" : "1px solid var(--border)",
                background: sent
                  ? "var(--green-light)"
                  : hovered
                    ? "var(--accent-light)"
                    : "transparent",
                color: sent ? "var(--green)" : "var(--accent)",
                cursor: sent ? "default" : "pointer",
                transition: "background 0.13s, border-color 0.13s",
              }}
            >
            {sent
              ? <><CheckCheck size={11} /> Enviado para aprobación</>
              : <><ArrowRight size={11} /> Solicitar aprobación</>
            }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsRow({ item, last }: { item: AINewsItem; last: boolean }) {
  const [shared, setShared] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--border-subtle)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: sentimentColor[item.sentiment],
          flexShrink: 0, marginTop: 5,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, marginBottom: 3 }}>
          {item.headline}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
          {item.source} · {item.date}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.55 }}>
          {item.summary}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {item.tickers.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                  background: "var(--accent-light)", color: "var(--accent)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShared(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 11.5, fontWeight: 500, padding: "4px 10px", borderRadius: 7,
              border: "1px solid var(--border)",
              background: shared
                ? "var(--green-light)"
                : hovered
                  ? "var(--accent-light)"
                  : "transparent",
              color: shared ? "var(--green)" : "var(--text-secondary)",
              cursor: shared ? "default" : "pointer",
              transition: "background 0.13s",
              flexShrink: 0,
            }}
          >
            {shared
              ? <><CheckCheck size={11} /> Compartido</>
              : <><Share2 size={11} /> Compartir con cliente</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export function AiInsights({ client }: { client: Client }) {
  const insights = aiInsights[client.id];
  const [expanded, setExpanded] = useState(false);
  const [hoverToggle, setHoverToggle] = useState(false);

  if (!insights) return null;

  const preview = insights.summary.slice(0, 220) + (insights.summary.length > 220 ? "…" : "");
  const truncated = insights.summary.length > 220;

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
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Sparkles size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 1 }}>
            Perspectivas IA
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Análisis personalizado para {client.name.split(" ")[0]}
          </div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
          Vale IA · Actualizado ahora
        </span>
      </div>

      {/* Summary */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{
          fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
          letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8,
        }}
      >
        Análisis
      </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>
          {expanded ? insights.summary : preview}
        </p>
        {truncated && (
          <button
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={() => setHoverToggle(true)}
            onMouseLeave={() => setHoverToggle(false)}
            style={{
              marginTop: 8, display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 500,
              color: hoverToggle ? "var(--accent)" : "var(--text-muted)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              transition: "color 0.13s",
            }}
          >
            {expanded
              ? <><ChevronUp size={12} /> Ver menos</>
              : <><ChevronDown size={12} /> Leer análisis completo</>
            }
          </button>
        )}
      </div>

      {/* Actions + News — two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* Suggested Actions */}
        <div style={{ borderRight: "1px solid var(--border)" }}>
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
              letterSpacing: "0.07em", textTransform: "uppercase",
            }}
          >
            Acciones sugeridas · {insights.actions.length}
          </div>
          {insights.actions.map((action, i) => (
            <ActionRow key={action.id} action={action} last={i === insights.actions.length - 1} />
          ))}
        </div>

        {/* Relevant News */}
        <div>
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)",
              letterSpacing: "0.07em", textTransform: "uppercase",
            }}
          >
            Noticias relevantes · {insights.news.length}
          </div>
          {insights.news.map((item, i) => (
            <NewsRow key={item.id} item={item} last={i === insights.news.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
