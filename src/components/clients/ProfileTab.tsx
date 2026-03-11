"use client";

import { useState } from "react";
import type { Client } from "@/lib/clientData";
import { Calendar, CreditCard, MapPin, Phone, Mail, User, Lock, FileText, Plus, Sparkles } from "lucide-react";
import { RiskTab } from "./RiskTab";

interface PrivateNote { id: string; text: string; date: string; tags: string[] }

function seedNotes(client: Client): PrivateNote[] {
  return [
    { id: "n1", date: "28 feb 2026", text: `${client.name} prefiere comunicarse por WhatsApp antes que por email. Responde rápido en horario de mañana.`, tags: ["preferencias", "comunicación"] },
    { id: "n2", date: "15 feb 2026", text: `Objetivo prioritario: liquidez para compra de inmueble en los próximos 18–24 meses. Considerar esto al rebalancear.`, tags: ["objetivo", "liquidez"] },
    { id: "n3", date: "3 ene 2026",  text: `Comentó preocupación por inflación en USD. No quiere exposición muy larga en renta fija. Perfil más conservador de lo que indica el cuestionario.`, tags: ["riesgo", "contexto"] },
  ];
}

export function ProfileTab({ client }: { client: Client }) {
  const [notes, setNotes]           = useState<PrivateNote[]>(() => seedNotes(client));
  const [noteInput, setNoteInput]   = useState("");
  const [showForm, setShowForm]     = useState(false);

  function addNote() {
    if (!noteInput.trim()) return;
    const date = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
    setNotes((prev) => [{ id: `n${Date.now()}`, text: noteInput.trim(), date, tags: ["nota"] }, ...prev]);
    setNoteInput("");
    setShowForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top row: profile info + private notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Client profile */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 16, color: "var(--text-primary)" }}>Perfil del cliente</div>
          </div>
          <div style={{ padding: "4px 0" }}>
            {[
              { icon: User,       label: "Edad",           value: `${client.age} años (FN: ${new Date(client.dob).toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" })})` },
              { icon: MapPin,     label: "Ubicación",      value: client.location },
              { icon: Mail,       label: "Correo",         value: client.email },
              { icon: Phone,      label: "Teléfono",       value: client.phone },
              { icon: Calendar,   label: "Cliente desde",  value: client.since },
              { icon: CreditCard, label: "Tipo de cuenta", value: client.accountType },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <Icon size={14} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Private notes */}
        <div style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>Notas privadas</span>
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <Plus size={11} /> Nueva
            </button>
          </div>
          <div style={{ padding: "8px 18px", borderBottom: "1px solid var(--border-subtle)", background: "oklch(38% 0.12 250 / 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Sparkles size={11} color="var(--accent)" />
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>Estas notas informan el contexto de la IA</span>
            </div>
          </div>
          {showForm && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Añade contexto sobre este cliente…"
                rows={3}
                autoFocus
                style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-raised)", fontSize: 12.5, color: "var(--text-primary)", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowForm(false); setNoteInput(""); }} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>Cancelar</button>
                <button onClick={addNote} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 13px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>Guardar</button>
              </div>
            </div>
          )}
          <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map((note) => (
              <div key={note.id} style={{ padding: "12px 14px", borderRadius: 9, background: "var(--surface-raised)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                  <FileText size={12} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.55, margin: 0, flex: 1 }}>{note.text}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{note.date}</span>
                  {note.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20, background: "var(--accent-light)", color: "var(--accent)", letterSpacing: "0.04em" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk profile */}
      <RiskTab client={client} />
    </div>
  );
}
