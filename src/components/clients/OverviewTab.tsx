"use client";

import type { Client } from "@/lib/clientData";
import { PortfolioTab } from "./PortfolioTab";
import { AiInsights }   from "./AiInsights";

export function OverviewTab({ client }: { client: Client }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <PortfolioTab client={client} />
      <AiInsights client={client} />
    </div>
  );
}
