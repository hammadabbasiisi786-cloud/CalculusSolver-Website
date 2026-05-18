import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import SLaNgPage from "./pages/SLaNgPage.jsx";
import CalculusSolverPage from "./pages/CalculusSolverPage.jsx";
import HowTheyFitPage from "./pages/HowTheyFitPage.jsx";

const NAV = [
  { id: "overview", path: "/overview", label: "Overview", icon: "◈" },
  { id: "slang", path: "/slang", label: "SLaNg Library", icon: "∂" },
  { id: "solver", path: "/solver", label: "CalculusSolver ML", icon: "⬡" },
];

function Shell() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from current pathname
  const active =
    NAV.find(
      (n) =>
        location.pathname === n.path ||
        location.pathname.startsWith(n.path + "/"),
    )?.id ?? "overview";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080B14",
        color: "#CBD5E1",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          background: "#0D1117",
          borderBottom: "1px solid #1E293B",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 0,
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 40,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg,#6366F1,#06B6D4)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            ∫
          </div>
          <span
            style={{
              color: "#F1F5F9",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            QUANTUM LOGICS
          </span>
          <span style={{ color: "#334155", fontSize: 13 }}>/</span>
          <span style={{ color: "#64748B", fontSize: 12 }}>
            CalculusSolver + SLaNg
          </span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.path)}
              style={{
                padding: "0 18px",
                height: 56,
                border: "none",
                background: "transparent",
                borderBottom:
                  active === n.id
                    ? "2px solid #6366F1"
                    : "2px solid transparent",
                color: active === n.id ? "#F1F5F9" : "#475569",
                cursor: "pointer",
                fontSize: 12,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.15s",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Index redirect → /overview */}
          <Route index element={<Navigate to="overview" replace />} />

          <Route path="overview" element={<HowTheyFitPage />} />
          <Route path="slang" element={<SLaNgPage />} />
          <Route path="solver" element={<CalculusSolverPage />} />

          {/* Catch-all: any unknown sub-path falls back to overview */}
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    /*
      basename="/developer/docs" means React Router treats
      /developer/docs as the root. All <Link> and navigate() calls
      are relative to it, so the actual URLs become:
        /developer/docs/overview
        /developer/docs/slang
        /developer/docs/solver

      A bare visit to / is caught by the Vite dev-server middleware
      (vite.config.js) and redirected to /developer/docs, which then
      hits the <Navigate to="overview"> index route above.
    */
    <BrowserRouter basename="/developer/docs">
      <Shell />
    </BrowserRouter>
  );
}
