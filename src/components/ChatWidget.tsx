"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, ChevronDown, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center", height: 16 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--text-muted)",
            display: "inline-block",
            animation: `chat-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: 7, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>
          <Sparkles size={11} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "9px 12px",
        borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
        background: isUser ? "var(--accent)" : "var(--surface-raised)",
        color: isUser ? "#fff" : "var(--text-primary)",
        fontSize: 13,
        lineHeight: 1.55,
        border: isUser ? "none" : "1px solid var(--border)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "¿Cuál es el outlook para tasas de la Fed este trimestre?",
  "Resumí el impacto del petróleo alto en bonos emergentes",
  "¿Qué sectores están outperforming hoy?",
  "Análisis del Merval en USD esta semana",
];

export function ChatWidget() {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [streaming, setStreaming]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [pulse, setPulse]             = useState(false);
  const bottomRef                     = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLTextAreaElement>(null);
  const abortRef                      = useRef<AbortController | null>(null);

  // Pulse the button when closed and there's a new message
  useEffect(() => {
    if (!open && messages.length > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [messages.length, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Placeholder for assistant
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Error de API");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + delta,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      setMessages(prev => prev.slice(0, -1)); // remove empty assistant msg
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chat-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes chat-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0;   }
        }
      `}</style>

      {/* Floating button */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 500 }}>
        {pulse && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "var(--accent)", opacity: 0,
            animation: "chat-pulse-ring 1s ease-out",
          }} />
        )}
        <button
          onClick={() => setOpen(v => !v)}
          title="Asistente IA"
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: open ? "var(--text-secondary)" : "var(--accent)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            transition: "background 0.2s, transform 0.15s",
            transform: open ? "rotate(0deg)" : "scale(1)",
            color: "#fff",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {open ? <ChevronDown size={20} color="#fff" /> : <Sparkles size={20} color="#fff" />}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 28, zIndex: 499,
          width: 380, height: 560,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--surface)",
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                Asistente Financiero
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                Sonar Pro · Datos en tiempo real
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 14px",
            display: "flex", flexDirection: "column",
          }}>
            {messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start", paddingTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Sparkles size={11} color="#fff" />
                  </div>
                  <div style={{
                    background: "var(--surface-raised)", border: "1px solid var(--border)",
                    borderRadius: "12px 12px 12px 3px", padding: "9px 12px",
                    fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55,
                  }}>
                    Hola. Soy tu asistente financiero con acceso a datos en tiempo real. ¿En qué te ayudo hoy?
                  </div>
                </div>
                <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      style={{
                        textAlign: "left", fontSize: 11.5, padding: "7px 10px",
                        borderRadius: 8, border: "1px solid var(--border)",
                        background: "var(--surface-raised)", color: "var(--text-secondary)",
                        cursor: "pointer", transition: "border-color 0.12s, color 0.12s",
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === "assistant" && msg.content === "" && streaming ? (
                      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 7, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                          <Sparkles size={11} color="#fff" />
                        </div>
                        <div style={{ padding: "9px 12px", borderRadius: "12px 12px 12px 3px", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                          <TypingDots />
                        </div>
                      </div>
                    ) : (
                      <MessageBubble msg={msg} />
                    )}
                  </div>
                ))}
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, background: "var(--red-light)", color: "var(--red)", fontSize: 12, marginBottom: 8 }}>
                    <AlertCircle size={12} />
                    {error}
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px 12px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--surface)",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              background: "var(--surface-raised)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "8px 10px 8px 12px",
              transition: "border-color 0.15s",
            }}
              onFocus={() => {}}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Preguntá sobre mercados, portafolios…"
                rows={1}
                disabled={streaming}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", resize: "none",
                  fontSize: 13, color: "var(--text-primary)",
                  lineHeight: 1.5, maxHeight: 96, overflowY: "auto",
                  fontFamily: "inherit",
                }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: input.trim() && !streaming ? "var(--accent)" : "var(--border)",
                  color: input.trim() && !streaming ? "#fff" : "var(--text-muted)",
                  cursor: input.trim() && !streaming ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.15s, color 0.15s",
                }}
              >
                <Send size={13} />
              </button>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
              Shift+Enter para nueva línea · Powered by Perplexity Sonar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
