## Design Context

### Users
Financial advisors (asesores de inversión) managing ~8 private clients in Argentina. They open the dashboard every morning to orient their day — checking portfolio performance, market news, and client priorities. They are professionals who value precision and efficiency over decoration.

### Brand Personality
**Confiable · Preciso · Discreto**

Vale is a quiet professional, not a flashy fintech. It speaks with authority without shouting. It respects the advisor's intelligence and never wastes their time.

### Emotional Goal
**Claridad + urgencia** — The advisor should open the dashboard and immediately know what matters today and what needs action. No ambiguity, no noise.

### Aesthetic Direction
- **Warm institutional** — not cold Bloomberg, not playful startup. Think private bank meets modern software.
- Light mode only (current palette: OKLCH warm navy-indigo accent, off-white surfaces)
- Typography: DM Serif for headings/numbers (gravitas), DM Sans for UI copy (clarity)
- Density: information-rich but never cluttered. Every element earns its space.
- Restraint over decoration — no gradients, no shadows for drama, no color for color's sake

### Design Principles
1. **Information hierarchy first** — the most important number or action should be immediately obvious without scanning
2. **Earn every pixel** — remove anything that doesn't help the advisor do their job
3. **Consistency over creativity** — extend existing patterns (cards, borders, CSS vars) rather than inventing new ones
4. **Quiet confidence** — use color sparingly; accent color signals action or AI, not decoration
5. **Argentine context** — the system is aware of ARS/USD duality, local instruments (LECAPs, FCI), and local market rhythms

### Technical Conventions
- Next.js 15 App Router, all components `"use client"`
- **Inline styles only** — no Tailwind utility classes in JSX (tailwind imported but only for resets)
- CSS custom properties: `--surface`, `--surface-raised`, `--border`, `--border-subtle`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-light`, `--green`, `--red`, `--amber`
- OKLCH color format throughout
- Card pattern: `background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10/12`
- Section headers: `fontSize: 10.5–11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07–0.09em", color: "var(--text-muted)"`
- Primary numbers: `fontFamily: "var(--font-dm-serif)", fontSize: 20–26`
