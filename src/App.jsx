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
  const [menuOpen, setMenuOpen] = useState(false);

  const active =
    NAV.find(
      (n) =>
        location.pathname === n.path ||
        location.pathname.startsWith(n.path + "/"),
    )?.id ?? "overview";

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
          justifyContent: "space-between",
          gap: 0,
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
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
              fontSize: 14,
              color: "#fff",
              fontWeight: 700,
              flexShrink: 0,
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
              whiteSpace: "nowrap",
            }}
          >
            QUANTUM LOGICS
          </span>
          <span style={{ color: "#334155", fontSize: 13 }}>/</span>
          <span
            style={{
              color: "#64748B",
              fontSize: 12,
              whiteSpace: "nowrap",
              display: "none", // hidden on very small screens — see media workaround below
            }}
            className="nav-subtitle"
          >
            CalculusSolver + SLaNg
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: 2 }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.path)}
              title={n.label}
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
                transition: "color 0.15s, border-color 0.15s",
                fontFamily: "'IBM Plex Mono', monospace",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (active !== n.id) e.currentTarget.style.color = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                if (active !== n.id) e.currentTarget.style.color = "#475569";
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
          {/*
            FIX: Use absolute paths in Navigate (leading "/") to prevent
            relative resolution from causing infinite redirect loops.
            The catch-all was re-matching "/overview" and redirecting again
            endlessly. Now it only fires for truly unknown paths.
          */}
          <Route index element={<Navigate to="/overview" replace />} />

          <Route path="/overview" element={<HowTheyFitPage />} />
          <Route path="/slang" element={<SLaNgPage />} />
          <Route path="/solver" element={<CalculusSolverPage />} />

          {/* Catch-all: only hits for paths that don't match any route above */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #1E293B",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#334155",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>© 2025 QuantumLogics Incorporated. All rights reserved.</span>
        <span style={{ color: "#1E293B" }}>
          CalculusSolver + SLaNg — Project Explorer
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    /*
      FIX: Removed basename="/developer/docs" — this caused the Router to
      render nothing because the app was served at "/" which didn't start
      with the basename. If you deploy to a sub-path (e.g. /developer/docs),
      add basename="/developer/docs" back AND configure your server/Vite to
      serve the app at that path and redirect bare "/" to it.

      For Vite sub-path deploy, add to vite.config.js:
        base: '/developer/docs'
      And in this file:
        <BrowserRouter basename="/developer/docs">
    */
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
