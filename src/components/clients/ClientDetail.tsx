"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/lib/clientData";
import { OverviewTab }  from "./OverviewTab";
import { ProfileTab }   from "./ProfileTab";
import { ClientReport } from "./ClientReport";
import { NotesTab }     from "./NotesTab";
import { useCurrency }  from "@/lib/currencyContext";
import {
  ChevronLeft, CalendarDays,
  LayoutDashboard, User, TrendingUp, MessageSquare,
} from "lucide-react";

type Tab = "overview" | "profile" | "performance" | "notes";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "Resumen",                icon: <LayoutDashboard size={13} /> },
  { id: "performance",  label: "Rendimiento",            icon: <TrendingUp size={13} /> },
  { id: "notes",        label: "Notas y Conversaciones", icon: <MessageSquare size={13} /> },
  { id: "profile",      label: "Perfil del cliente",     icon: <User size={13} /> },
];

const riskColors: Record<string, string> = {
  Conservative: "var(--text-muted)",
  Moderate:     "var(--accent)",
  Aggressive:   "var(--red)",
};

const riskLabel: Record<string, string> = { Conservative: "Conservador", Moderate: "Moderado", Aggressive: "Agresivo" };

export function ClientDetail({ client }: { client: Client }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { fmtCompact, adjReturn } = useCurrency();

  const activeTab = (searchParams.get("tab") as Tab | null) ?? "overview";

  const setActiveTab = useCallback((tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <>
      {/* Back bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 32px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface)",
        }}
      >
        <Link
          href="/clients"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none",
          }}
        >
          <ChevronLeft size={14} />
          Todos los clientes
        </Link>
      </div>

      {/* Client header */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 32px 0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Identity row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "var(--accent-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            {client.initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: 22, margin: 0, color: "var(--text-primary)", lineHeight: 1 }}>
              {client.name}
            </h1>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span>{client.id}</span>
              <span>·</span>
              <span style={{ color: riskColors[client.risk], fontWeight: 500 }}>{riskLabel[client.risk] ?? client.risk}</span>
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", paddingLeft: 24, borderLeft: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>AUM</div>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 20, color: "var(--text-primary)", lineHeight: 1 }}>{fmtCompact(client.aum)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Retorno YTD</div>
              <div style={{ fontFamily: "var(--font-dm-serif)", fontSize: 20, color: client.ytdReturn >= 0 ? "var(--green)" : "var(--red)", lineHeight: 1 }}>
                {adjReturn(client.ytdReturn) >= 0 ? "+" : ""}{adjReturn(client.ytdReturn).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginLeft: 8, alignItems: "center" }}>
            <button style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={12} />
              Agendar revisión
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav style={{ display: "flex", gap: 0, borderTop: "1px solid var(--border-subtle)", marginTop: 4 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 18px",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                background: "transparent",
                color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                marginBottom: -1,
                transition: "color 0.12s, border-color 0.12s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div style={{ padding: "28px 32px", flex: 1 }}>
        {activeTab === "overview"    && <OverviewTab   client={client} />}
        {activeTab === "profile"     && <ProfileTab    client={client} />}
        {activeTab === "performance" && <ClientReport  client={client} />}
        {activeTab === "notes"       && <NotesTab      client={client} />}
      </div>
    </>
  );
}
