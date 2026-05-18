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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
          background: "#0A0D16",
          borderBottom: "1px solid #1A2535",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0,
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate("/overview")}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, #6366F1, #06B6D4)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "#fff",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 0 16px #6366F130",
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
          <span style={{ color: "#1E293B", fontSize: 13 }}>/</span>
          <span
            style={{
              color: "#475569",
              fontSize: 12,
              whiteSpace: "nowrap",
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

        {/* Mobile hamburger button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid #1E293B",
            color: "#94A3B8",
            cursor: "pointer",
            borderRadius: 6,
            padding: "7px 10px",
            fontSize: 16,
            lineHeight: 1,
            gap: 4,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: "56px 0 0 0",
            zIndex: 99,
            background: "#080B14",
            borderTop: "1px solid #1E293B",
            display: "flex",
            flexDirection: "column",
            padding: "16px 0",
          }}
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.path)}
              style={{
                textAlign: "left",
                padding: "14px 28px",
                border: "none",
                borderLeft: `3px solid ${active === n.id ? "#6366F1" : "transparent"}`,
                background: active === n.id ? "#6366F10C" : "transparent",
                color: active === n.id ? "#F1F5F9" : "#64748B",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                if (active !== n.id) e.currentTarget.style.color = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                if (active !== n.id) e.currentTarget.style.color = "#64748B";
              }}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <div style={{ flex: 1 }}>
        <Routes>
          {/*
            FIX: Use absolute paths in Navigate (leading "/") to prevent
            relative resolution from causing infinite redirect loops.
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
          borderTop: "1px solid #111827",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#1E293B",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ color: "#334155" }}>
          © 2025 QuantumLogics Incorporated. All rights reserved.
        </span>
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
