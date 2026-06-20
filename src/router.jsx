/* ─────────────────────────────────────────────────────────────────────────────
   router.jsx — Centralised route + navigation configuration
   4 routes: /  /slang  /model  /demo
   ───────────────────────────────────────────────────────────────────────────── */

import HowTheyFitPage from "./pages/HowTheyFitPage.jsx";
import SLaNgPage from "./pages/SLaNgPage.jsx";
import CalculusSolverPage from "./pages/CalculusSolverPage.jsx";
import DemoPage from "./pages/DemoPage.jsx";

// Navigation items rendered in the top bar and mobile drawer.
// Each entry maps 1-to-1 with a route below.
export const NAV = [
  {
    id: "overview",
    path: "/",
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
    id: "model",
    path: "/model",
    label: "CalculusSolver ML",
    icon: "⬡",
    accent: "#22D3EE",
  },
  {
    id: "demo",
    path: "/demo",
    label: "Live Demo",
    icon: "▶",
    accent: "#F59E0B",
  },
];

// Route definitions consumed by <Routes> in App.jsx.
// Using Component references (not JSX elements) so this file stays clean.
export const ROUTES = [
  { path: "/", Component: HowTheyFitPage },
  { path: "/slang", Component: SLaNgPage },
  { path: "/model", Component: CalculusSolverPage },
  { path: "/demo", Component: DemoPage },
];
