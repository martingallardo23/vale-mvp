"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { Client } from "@/lib/clientData";
import { Send, Sparkles, X, Lock, FileText, Plus } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Sender = "advisor" | "client";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  aiDraftShown?: boolean;
}

interface PrivateNote {
  id: string;
  text: string;
  date: string;
  tags: string[];
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

function seedMessages(client: Client): ChatMessage[] {
  const name = client.name.split(" ")[0];
  return [
    { id: "m1", sender: "advisor", text: `Hola ${name}, espero que estés bien. Te escribo para comentarte sobre los movimientos del mercado de esta semana y cómo impactaron tu cartera.`, time: "10:14" },
    { id: "m2", sender: "client",  text: "Hola, sí vi las noticias. ¿Cuánto afectó al portafolio?", time: "10:31" },
    { id: "m3", sender: "advisor", text: `Tu cartera tuvo un retorno de ${client.ytdReturn >= 0 ? "+" : ""}${client.ytdReturn.toFixed(1)}% en lo que va del año, superando a la referencia. La diversificación que tenemos ayudó a amortiguar la volatilidad reciente.`, time: "10:45" },
    { id: "m4", sender: "client",  text: "Bien, me alegra escuchar eso. ¿Deberíamos hacer algún ajuste?", time: "11:02" },
    { id: "m5", sender: "advisor", text: "Por ahora la posición está bien balanceada. La semana próxima tenemos tu revisión trimestral programada, lo vemos ahí con más detalle.", time: "11:15" },
    { id: "m6", sender: "client",  text: "Perfecto. ¿Podemos incluir el tema de los bonos en dólares? Leí que hay oportunidades interesantes.", time: "11:28", aiDraftShown: false },
  ];
}

function seedNotes(client: Client): PrivateNote[] {
  return [
    {
      id: "n1",
      date: "28 feb 2026",
      text: `${client.name} prefiere comunicarse por WhatsApp antes que por email. Responde rápido en horario de mañana.`,
      tags: ["preferencias", "comunicación"],
    },
    {
      id: "n2",
      date: "15 feb 2026",
      text: `Objetivo prioritario: liquidez para compra de inmueble en los próximos 18–24 meses. Considerar esto al rebalancear.`,
      tags: ["objetivo", "liquidez"],
    },
    {
      id: "n3",
      date: "3 ene 2026",
      text: `Comentó preocupación por inflación en USD. No quiere exposición muy larga en renta fija. Perfil más conservador de lo que indica el cuestionario.`,
      tags: ["riesgo", "contexto"],
    },
  ];
}

// Each entry: [client message, AI draft response]
const DEMO_PAIRS: [string, string][] = [
  [
    "¿Qué tan expuesto estoy al riesgo cambiario actualmente?",
    "Buena pregunta. Hoy tenés aproximadamente un 38% del portafolio en activos dolarizados — entre MEP, CEDEARs y bonos hard dollar. Eso te da una cobertura natural razonable. Si querés aumentar esa cobertura antes del cierre de trimestre, podemos revisar las posiciones en pesos y evaluar algún rebalanceo hacia dólar cable.",
  ],
  [
    "¿Conviene tomar ganancias en alguna posición antes de fin de trimestre?",
    "Hay un par de posiciones que están arriba más de 30% desde el costo promedio y podrían ser candidatas. Te preparo un análisis con el impacto fiscal estimado para que lo veamos juntos en la próxima reunión. ¿Querés que lo tenga listo para el martes?",
  ],
  [
    "Vi que los mercados emergentes tuvieron una semana difícil, ¿afectó mi portafolio?",
    "La semana fue volátil, sí. Tu exposición a emergentes es indirecta, principalmente a través de los CEDEARs. En términos netos el impacto fue moderado — menos de 1% en el valor de la cartera. La diversificación que tenemos amortiguó bastante bien el movimiento.",
  ],
  [
    "¿Podemos hablar esta semana? Quiero revisar mis objetivos para el año.",
    "¡Por supuesto! Tengo disponibilidad el miércoles a las 11 hs o el jueves después de las 15 hs. ¿Alguno de esos horarios te viene bien? Puedo preparar un resumen del estado actual del portafolio y una propuesta de objetivos para que la reunión sea más productiva.",
  ],
  [
    "¿Qué rendimiento tuve este mes comparado con la inflación?",
    "Este mes el portafolio rindió un 3.2% en pesos, mientras que la inflación del período fue estimada en 2.8%. Quedaste por encima en términos reales. En dólares el rendimiento fue de +0.9%. Si querés el detalle mes a mes lo tengo en el informe trimestral.",
  ],
  [
    "¿Hay algo que debería saber sobre los cambios regulatorios recientes?",
    "Sí, hay dos novedades relevantes. La CNV actualizó los límites de tenencia para inversores individuales en ciertos instrumentos, y hubo cambios en el tratamiento impositivo de los FCI de renta fija. Ninguno te impacta de forma directa hoy, pero es bueno tenerlo en cuenta para el rebalanceo de abril. Te mando un resumen más detallado por email.",
  ],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Bubble({ msg, clientName }: { msg: ChatMessage; clientName: string }) {
  const isAdvisor = msg.sender === "advisor";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isAdvisor ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          background: isAdvisor ? "var(--accent)" : "var(--surface-raised)",
          color: isAdvisor ? "#fff" : "var(--text-secondary)",
          border: isAdvisor ? "none" : "1px solid var(--border)",
        }}
      >
        {isAdvisor ? "VA" : clientName.charAt(0)}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isAdvisor ? "flex-end" : "flex-start", gap: 3 }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isAdvisor ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            background: isAdvisor ? "var(--accent)" : "var(--surface)",
            border: isAdvisor ? "none" : "1px solid var(--border)",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: isAdvisor ? "#fff" : "var(--text-primary)",
          }}
        >
          {msg.text}
        </div>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)", paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotesTab({ client }: { client: Client }) {
  const firstName = client.name.split(" ")[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => seedMessages(client));
  const [input, setInput] = useState("");
  const [draftPlaceholder, setDraftPlaceholder] = useState(DEMO_PAIRS[5][1]); // seed: last msg from client

  const [notes, setNotes] = useState<PrivateNote[]>(() => seedNotes(client));
  const [noteInput, setNoteInput] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const demoMsgIdx = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-size textarea to fit placeholder draft text
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const fullPlaceholder = draftPlaceholder
      ? `${draftPlaceholder}\n\n— Apretá ✦ para usar este borrador`
      : "";
    if (!input && fullPlaceholder) {
      ta.value = fullPlaceholder;
      ta.style.height = "auto";
      const h = ta.scrollHeight;
      ta.value = "";
      ta.style.minHeight = `${h}px`;
    } else {
      ta.style.height = "auto";
      ta.style.minHeight = input ? `${ta.scrollHeight}px` : "82px";
    }
  }, [input, draftPlaceholder]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, sender: "advisor", text: text.trim(), time }]);
    setDraftPlaceholder("");
    setInput("");
  }

  function draftWithAI() {
    const text = draftPlaceholder || (() => {
      const lastClientMsg = [...messages].reverse().find((m) => m.sender === "client");
      const pair = lastClientMsg ? DEMO_PAIRS.find(([q]) => q === lastClientMsg.text) : undefined;
      return pair ? pair[1] : `Hola ${firstName}, gracias por tu mensaje. Lo reviso y te respondo a la brevedad.`;
    })();
    setInput(text);
    // keep draftPlaceholder — so if user clears the textarea, the draft reappears
  }

  function simulateClientMessage() {
    const [clientMsg, aiReply] = DEMO_PAIRS[demoMsgIdx.current % DEMO_PAIRS.length];
    demoMsgIdx.current += 1;
    const now = new Date();
    const time = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, sender: "client", text: clientMsg, time }]);
    setDraftPlaceholder(aiReply);
    setInput("");
  }

  function addNote() {
    if (!noteInput.trim()) return;
    const now = new Date();
    const date = now.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
    setNotes((prev) => [
      { id: `n${Date.now()}`, text: noteInput.trim(), date, tags: ["nota"] },
      ...prev,
    ]);
    setNoteInput("");
    setShowNoteForm(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, height: "calc(100vh - 260px)", minHeight: 500 }}>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            onClick={simulateClientMessage}
            title="Demo: simular mensaje del cliente"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent)",
              cursor: "pointer",
            }}
          >
            {client.initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{client.email}</div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--green)",
              background: "var(--green-light)",
              padding: "3px 9px",
              borderRadius: 20,
            }}
          >
            Canal seguro
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} clientName={firstName} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "10px 16px 12px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={draftPlaceholder
              ? `${draftPlaceholder}\n\n— Apretá ✦ para usar este borrador`
              : "Escribe un mensaje… (Enter para enviar)"}
            rows={2}
            style={{
              flex: 1,
              minHeight: 82,
              padding: "9px 12px",
              borderRadius: 9,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              fontSize: 13,
              color: "var(--text-primary)",
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-dm-sans)",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button
              onClick={draftWithAI}
              title="Redactar con IA"
              style={{
                width: 38, height: 38, borderRadius: 9,
                border: "1px solid oklch(38% 0.12 250 / 0.3)",
                background: "oklch(38% 0.12 250 / 0.07)",
                color: "var(--accent)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Sparkles size={15} />
            </button>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 9, border: "none",
                background: input.trim() ? "var(--accent)" : "var(--surface-raised)",
                color: input.trim() ? "#fff" : "var(--text-muted)",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Send size={15} />
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* ── Private notes panel ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Lock size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
            Notas privadas
          </span>
          <button
            onClick={() => setShowNoteForm((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11.5,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <Plus size={11} />
            Nueva
          </button>
        </div>

        {/* Context pill */}
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "oklch(38% 0.12 250 / 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={11} color="var(--accent)" />
            <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>
              Estas notas informan el contexto de la IA
            </span>
          </div>
        </div>

        {/* Add note form */}
        {showNoteForm && (
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Añade contexto sobre este cliente…"
              rows={3}
              autoFocus
              style={{
                width: "100%",
                padding: "9px 11px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-raised)",
                fontSize: 12.5,
                color: "var(--text-primary)",
                resize: "none",
                outline: "none",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: 1.5,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowNoteForm(false); setNoteInput(""); }}
                style={{
                  fontSize: 11.5, padding: "5px 11px", borderRadius: 6,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text-secondary)", cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={addNote}
                style={{
                  fontSize: 11.5, fontWeight: 600, padding: "5px 13px", borderRadius: 6,
                  border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer",
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: "12px 14px",
                borderRadius: 9,
                background: "var(--surface-raised)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                <span style={{ marginTop: 1, flexShrink: 0, display: "flex" }}><FileText size={12} color="var(--text-muted)" /></span>
                <p style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.55, margin: 0, flex: 1 }}>
                  {note.text}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{note.date}</span>
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20,
                      background: "var(--accent-light)", color: "var(--accent)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
