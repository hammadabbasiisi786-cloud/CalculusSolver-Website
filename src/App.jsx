import { useState } from "react";
import SLaNgPage from "./pages/SLaNgPage.jsx";
import CalculusSolverPage from "./pages/CalculusSolverPage.jsx";
import HowTheyFitPage from "./pages/HowTheyFitPage.jsx";

const NAV = [
  { id: "fit", label: "Overview", icon: "◈" },
  { id: "slang", label: "SLaNg Library", icon: "∂" },
  { id: "solver", label: "CalculusSolver ML", icon: "⬡" },
];

export default function App() {
  const [page, setPage] = useState("fit");

  return (
    <div style={{ minHeight: "100vh", background: "#080B14", color: "#CBD5E1", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <nav style={{ background: "#0D1117", borderBottom: "1px solid #1E293B", padding: "0 32px", display: "flex", alignItems: "center", gap: 0, height: 56, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366F1,#06B6D4)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700 }}>∫</div>
          <span style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>QUANTUM LOGICS</span>
          <span style={{ color: "#334155", fontSize: 13 }}>/</span>
          <span style={{ color: "#64748B", fontSize: 12 }}>CalculusSolver + SLaNg</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding: "0 18px", height: 56, border: "none", background: "transparent",
              borderBottom: page === n.id ? "2px solid #6366F1" : "2px solid transparent",
              color: page === n.id ? "#F1F5F9" : "#475569", cursor: "pointer",
              fontSize: 12, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6,
              transition: "color 0.15s",
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <div style={{ flex: 1 }}>
        {page === "fit" && <HowTheyFitPage />}
        {page === "slang" && <SLaNgPage />}
        {page === "solver" && <CalculusSolverPage />}
      </div>
    </div>
  );
}
