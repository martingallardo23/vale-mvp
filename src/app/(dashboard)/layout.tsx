import { Sidebar } from "@/components/Sidebar";
import { CurrencyProvider } from "@/lib/currencyContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </CurrencyProvider>
  );
}
