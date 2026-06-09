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
import SolverPage from "./pages/SolverPage.jsx";
import ContributePage from "./pages/ContributePage.jsx";

const NAV = [
  {
    id: "overview",
    path: "/overview",
    label: "Overview",
    icon: "◈",
    accent: "#7C6FFF",
  },
  {
    id: "slang",
    path: "/slang",
    label: "SLaNg Library",
    icon: "∂",
    accent: "#C084FC",
  },
  {
    id: "solver",
    path: "/solver",
    label: "CalculusSolver ML",
    icon: "⬡",
    accent: "#22D3EE",
  },
  {
    id: "contribute",
    path: "/contribute",
    label: "Train & Contribute",
    icon: "⊕",
    accent: "#10B981",
  },
  {
    id: "try-it",
    path: "/try-it",
    label: "Try It",
    icon: "▶",
    accent: "#F59E0B"
  }
];

function Shell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const active =
    NAV.find(
      (n) =>
        location.pathname === n.path ||
        location.pathname.startsWith(n.path + "/"),
    )?.id ?? "overview";

  const activeNav = NAV.find((n) => n.id === active);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#8B97B8",
        fontFamily: "var(--font-sans, 'Space Grotesk', sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          background: scrolled ? "rgba(6,8,15,0.92)" : "rgba(9,12,22,0.85)",
          borderBottom: `1px solid ${scrolled ? "#1C2438" : "#131B2E"}`,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(16px)",
          transition: "background 0.25s, border-color 0.25s",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate("/overview")}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #7C6FFF 0%, #22D3EE 100%)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#fff",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow:
                "0 0 20px rgba(124,111,255,0.35), 0 0 6px rgba(34,211,238,0.2)",
            }}
          >
            ∫
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span
              style={{
                color: "#EFF3FF",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              QUANTUM LOGICS
            </span>
            <span
              className="nav-subtitle"
              style={{
                color: "#3D4D6A",
                fontSize: 10,
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
              }}
            >
              CalculusSolver + SLaNg
            </span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {NAV.map((n) => {
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.path)}
                style={{
                  padding: "0 16px",
                  height: 60,
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#EFF3FF" : "#3D4D6A",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "color 0.15s",
                  fontFamily: "var(--font-sans)",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#8B97B8";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#3D4D6A";
                }}
              >
                {/* Colored dot for active item */}
                <span
                  style={{
                    fontSize: isActive ? 13 : 12,
                    color: isActive ? n.accent : "currentColor",
                    transition: "color 0.15s",
                  }}
                >
                  {n.icon}
                </span>
                {n.label}
                {/* Active indicator line */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "20%",
                      right: "20%",
                      height: 2,
                      background: `linear-gradient(90deg, ${n.accent}, ${n.accent}80)`,
                      borderRadius: "2px 2px 0 0",
                      animation: "slideIn 0.2s ease",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          style={{
            display: "none",
            background: menuOpen ? "#131B2E" : "transparent",
            border: "1px solid #1C2438",
            color: "#8B97B8",
            cursor: "pointer",
            borderRadius: 7,
            padding: "8px 11px",
            fontSize: 15,
            lineHeight: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, border-color 0.15s",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: "60px 0 0 0",
            zIndex: 99,
            background: "rgba(6,8,15,0.97)",
            borderTop: "1px solid #1C2438",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            padding: "12px 0",
          }}
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.path)}
              style={{
                textAlign: "left",
                padding: "15px 28px",
                border: "none",
                borderLeft: `3px solid ${active === n.id ? n.accent : "transparent"}`,
                background: active === n.id ? n.accent + "0C" : "transparent",
                color: active === n.id ? "#EFF3FF" : "#3D4D6A",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.12s",
              }}
            >
              <span style={{ fontSize: 18, color: n.accent }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<HowTheyFitPage />} />
          <Route path="/slang" element={<SLaNgPage />} />
          <Route path="/solver" element={<CalculusSolverPage />} />
          <Route path="/try-it" element={<SolverPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #131B2E",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          flexWrap: "wrap",
          gap: 8,
          background: "rgba(6,8,15,0.6)",
        }}
      >
        <span style={{ color: "#1C2438", fontFamily: "var(--font-mono)" }}>
          © 2025 QuantumLogics Incorporated. All rights reserved.
        </span>
        <span style={{ color: "#1C2438", fontFamily: "var(--font-mono)" }}>
          CalculusSolver + SLaNg — Project Explorer
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
