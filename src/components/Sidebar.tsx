"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  LogOut,
  Telescope,
} from "lucide-react";
import { CurrencyToggle } from "@/components/CurrencyToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Panel", href: "/" },
  { icon: Users, label: "Clientes", href: "/clients" },
  { icon: Telescope, label: "Research", href: "/research" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 212,
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 16px 20px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: "0 10px 32px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: 22,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            vale
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
            Gestión Patrimonial
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 10px 10px" }}>
          Área de trabajo
        </div>
        {navItems.map(({ icon: Icon, label, href }) => {
          const active  = isActive(href);
          const hovered = hoveredNav === href && !active;
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHoveredNav(href)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 6,
                background: active
                  ? "var(--accent-light)"
                  : hovered
                    ? "var(--surface-raised)"
                    : "transparent",
                color: active
                  ? "var(--accent)"
                  : hovered
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                textDecoration: "none",
                transition: "background 0.12s, color 0.12s",
              }}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Currency toggle */}
      <div style={{ padding: "0 4px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 6 }}>
          Moneda
        </div>
        <CurrencyToggle />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {(["alerts", "settings"] as const).map((key) => {
          const hovered = hoveredBtn === key;
          return (
            <button
              key={key}
              onMouseEnter={() => setHoveredBtn(key)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 6,
                border: "none",
                background: hovered ? "var(--surface-raised)" : "transparent",
                color: hovered ? "var(--text-secondary)" : "var(--text-muted)",
                fontSize: 13.5,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "background 0.12s, color 0.12s",
              }}
            >
              {key === "alerts" ? <Bell size={15} strokeWidth={1.75} /> : <Settings size={15} strokeWidth={1.75} />}
              {key === "alerts" ? "Alertas" : "Ajustes"}
              {key === "alerts" && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--red)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 10,
                    padding: "1px 6px",
                  }}
                >
                  3
                </span>
              )}
            </button>
          );
        })}

        <div style={{ height: 1, background: "var(--border)", margin: "12px 0 10px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            MG
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              M. Gallardo
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Asesor Sr.</div>
          </div>
          <LogOut
            size={13}
            strokeWidth={1.75}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            style={{
              flexShrink: 0,
              cursor: "pointer",
              color: hoveredLogout ? "var(--red)" : "var(--text-muted)",
              opacity: hoveredLogout ? 1 : 0.5,
              transition: "color 0.12s, opacity 0.12s",
            }}
          />
        </div>
      </div>
    </aside>
  );
}
