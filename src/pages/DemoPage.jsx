import { PageWrap, EyebrowLabel, Divider, Card } from "../components/ui.jsx";
import SolverWidget from "../components/SolverWidget.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// DemoPage — /demo route
// Hosts the interactive SolverWidget and explains what the demo does.
// ─────────────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <PageWrap>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <EyebrowLabel color="#F59E0B">INTERACTIVE SOLVER</EyebrowLabel>
        <h1
          style={{
            margin: "10px 0 12px",
            fontSize: 32,
            fontWeight: 700,
            color: "#EFF3FF",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            fontFamily: "var(--font-sans)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #F59E0B, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Live Demo
          </span>
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#3D4D6A",
            lineHeight: 1.75,
            maxWidth: 600,
            fontFamily: "var(--font-sans)",
          }}
        >
          Input a SLaNg expression, choose an operation, and let the ML model
          solve it. Results are verified by slangmath and rendered with
          step-by-step explanations.
        </p>
      </div>

      {/* ── How it works — quick guide ──────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          {
            step: "1",
            icon: "📝",
            title: "Enter Expression",
            desc: "Load a preloaded example or paste your own SLaNg JSON expression tree.",
            color: "#F59E0B",
          },
          {
            step: "2",
            icon: "⬡",
            title: "Choose Operation",
            desc: "Select differentiate, integrate, gradient, or any of the 8 supported operations.",
            color: "#7C6FFF",
          },
          {
            step: "3",
            icon: "✓",
            title: "Get Verified Result",
            desc: "The ML model solves it, SLaNg verifies the answer, and you see step-by-step reasoning.",
            color: "#10B981",
          },
        ].map((item) => (
          <Card key={item.step} accent={item.color + "20"}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: item.color + "14",
                  border: `1px solid ${item.color}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: item.color,
                    marginBottom: 4,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#3D4D6A",
                    lineHeight: 1.6,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Divider style={{ margin: "28px 0" }} />

      {/* ── Solver Widget ──────────────────────────────────────────── */}
      <SolverWidget />

      {/* ── Demo mode notice ───────────────────────────────────────── */}
      <div
        style={{
          marginTop: 28,
          padding: "14px 18px",
          borderRadius: 10,
          background: "#0B0E1A",
          border: "1px solid #1C2438",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#F59E0B14",
            border: "1px solid #F59E0B28",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          💡
        </span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#F59E0B",
              marginBottom: 4,
              fontFamily: "var(--font-sans)",
            }}
          >
            Demo Mode
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#3D4D6A",
              lineHeight: 1.65,
              fontFamily: "var(--font-sans)",
            }}
          >
            The solver is currently running in demo mode with preloaded mock
            results. Once the FastAPI backend is connected (Sub-Task D3) and
            the neural model is deployed (Member C), this widget will solve
            expressions in real-time with full SLaNg verification.
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
