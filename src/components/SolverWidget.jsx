/* ─────────────────────────────────────────────────────────────────────────────
   SolverWidget.jsx — Interactive live solver for SLaNg expressions
   Created for Sub-Task D2.  API wiring added in D3.
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { Card, EyebrowLabel, Tag } from "./ui.jsx";
import { solve, checkStatus } from "../api/solver.js";

// ─── Operations ──────────────────────────────────────────────────────────────

const OPS = [
  { value: "diff",      label: "Differentiate  d/dx" },
  { value: "partial",   label: "Partial Derivative  ∂/∂x" },
  { value: "integrate", label: "Integrate  ∫ dx" },
  { value: "gradient",  label: "Gradient  ∇f" },
  { value: "hessian",   label: "Hessian Matrix  H" },
  { value: "optimize",  label: "Optimize (min/max)" },
  { value: "lagrange",  label: "Lagrange Multipliers" },
  { value: "series",    label: "Taylor Series" },
];

// ─── 5 Preloaded Examples ────────────────────────────────────────────────────

const EXAMPLES = [
  {
    id: "ex1",
    label: "d/dx x²",
    description: "Simple power rule",
    op: "diff",
    variable: "x",
    expr: { numi: { terms: [{ coeff: 1, var: { x: 2 } }] }, deno: 1 },
  },
  {
    id: "ex2",
    label: "d/dx 3x³+2x",
    description: "Polynomial differentiation",
    op: "diff",
    variable: "x",
    expr: {
      numi: {
        terms: [
          { coeff: 3, var: { x: 3 } },
          { coeff: 2, var: { x: 1 } },
        ],
      },
      deno: 1,
    },
  },
  {
    id: "ex3",
    label: "∫ 6x dx",
    description: "Simple integration",
    op: "integrate",
    variable: "x",
    expr: { numi: { terms: [{ coeff: 6, var: { x: 1 } }] }, deno: 1 },
  },
  {
    id: "ex4",
    label: "d/dx 5x⁴−3x²+7",
    description: "Higher-degree polynomial",
    op: "diff",
    variable: "x",
    expr: {
      numi: {
        terms: [
          { coeff: 5, var: { x: 4 } },
          { coeff: -3, var: { x: 2 } },
          { coeff: 7 },
        ],
      },
      deno: 1,
    },
  },
  {
    id: "ex5",
    label: "∫ (x³+2x) dx",
    description: "Polynomial integration",
    op: "integrate",
    variable: "x",
    expr: {
      numi: {
        terms: [
          { coeff: 1, var: { x: 3 } },
          { coeff: 2, var: { x: 1 } },
        ],
      },
      deno: 1,
    },
  },
];

// ─── KaTeX Helper ────────────────────────────────────────────────────────────
// Uses window.katex loaded from CDN in index.html.
// When npm install katex is available, switch to:
//   import katex from 'katex';  import 'katex/dist/katex.min.css';

function LatexBlock({ latex, displayMode = true }) {
  if (!latex) return null;

  const katex = typeof window !== "undefined" ? window.katex : null;
  if (!katex) {
    return (
      <code
        style={{
          color: "#93C5FD",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
        }}
      >
        {latex}
      </code>
    );
  }

  try {
    const html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return (
      <code
        style={{
          color: "#93C5FD",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
        }}
      >
        {latex}
      </code>
    );
  }
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const S = {
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#3D4D6A",
    marginBottom: 7,
    fontFamily: "var(--font-mono)",
  },
  select: {
    padding: "10px 14px",
    fontSize: 12.5,
    background: "#070A14",
    color: "#CBD5E1",
    border: "1px solid #1C2438",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.15s",
    width: "100%",
  },
  input: {
    padding: "10px 14px",
    fontSize: 13,
    background: "#070A14",
    color: "#CBD5E1",
    border: "1px solid #1C2438",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%",
    minHeight: 180,
    padding: "14px 16px",
    fontSize: 12,
    lineHeight: 1.7,
    background: "#070A14",
    color: "#93C5FD",
    border: "1px solid #1C2438",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SolverWidget() {
  const [op, setOp] = useState("diff");
  const [variable, setVariable] = useState("x");
  const [exprJson, setExprJson] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeExample, setActiveExample] = useState("");
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    checkStatus().then((online) => setApiOnline(online));
  }, []);

  // ── Load a preloaded example ────────────────────────────────────────────
  function loadExample(exId) {
    if (!exId) {
      setActiveExample("");
      return;
    }
    const ex = EXAMPLES.find((e) => e.id === exId);
    if (!ex) return;
    setOp(ex.op);
    setVariable(ex.variable);
    setExprJson(JSON.stringify(ex.expr, null, 2));
    setActiveExample(exId);
    setResult(null);
    setError(null);
  }

  // ── Solve handler ───────────────────────────────────────────────────────
  // D3 replaces the mock logic below with: const data = await solve(payload);
  async function handleSolve() {
    setError(null);
    setResult(null);

    if (!exprJson.trim()) {
      setError("Please enter a SLaNg expression or load an example.");
      return;
    }

    // Validate JSON
    let parsedExpr;
    try {
      parsedExpr = JSON.parse(exprJson);
    } catch {
      setError(
        "Invalid JSON — please check your expression. Expected a SLaNg tree object with numi/deno.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = await solve({ op, var: variable, expr: parsedExpr });
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════════
          INPUT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <Card glow accent="#F59E0B20" style={{ marginBottom: 20 }}>
        {/* ── Header row: title + example dropdown ─────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <EyebrowLabel color="#F59E0B">SOLVER INPUT</EyebrowLabel>
              {apiOnline !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8B97B8", fontFamily: "var(--font-mono)" }}>
                  API
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: apiOnline ? "#10B981" : "#EF4444",
                    boxShadow: `0 0 8px ${apiOnline ? "#10B98180" : "#EF444480"}`
                  }} title={apiOnline ? "API Online" : "API Offline"} />
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#EFF3FF",
                fontFamily: "var(--font-sans)",
              }}
            >
              Enter a SLaNg Expression
            </div>
          </div>

          {/* Load example dropdown */}
          <div>
            <label style={S.label}>Load Example</label>
            <select
              id="solver-example-select"
              value={activeExample}
              onChange={(e) => loadExample(e.target.value)}
              style={{
                ...S.select,
                width: "auto",
                minWidth: 200,
                borderColor: activeExample ? "#F59E0B40" : "#1C2438",
              }}
            >
              <option value="">— Select an example —</option>
              {EXAMPLES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.label} — {ex.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Operation + Variable row ─────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <label style={S.label} htmlFor="solver-op-select">
              Operation
            </label>
            <select
              id="solver-op-select"
              value={op}
              onChange={(e) => setOp(e.target.value)}
              style={S.select}
            >
              {OPS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 100 }}>
            <label style={S.label} htmlFor="solver-var-input">
              Variable
            </label>
            <input
              id="solver-var-input"
              type="text"
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              placeholder="x"
              style={S.input}
            />
          </div>
        </div>

        {/* ── JSON textarea ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <label style={S.label} htmlFor="solver-expr-textarea">
            Expression (SLaNg JSON)
          </label>
          <textarea
            id="solver-expr-textarea"
            value={exprJson}
            onChange={(e) => {
              setExprJson(e.target.value);
              setActiveExample(""); // custom edit clears active example
            }}
            placeholder={`{
  "numi": {
    "terms": [
      { "coeff": 1, "var": { "x": 2 } }
    ]
  },
  "deno": 1
}`}
            style={S.textarea}
            onFocus={(e) => (e.target.style.borderColor = "#F59E0B50")}
            onBlur={(e) => (e.target.style.borderColor = "#1C2438")}
            spellCheck={false}
          />
        </div>

        {/* ── Solve button ─────────────────────────────────────────────── */}
        <button
          id="solver-solve-btn"
          onClick={handleSolve}
          disabled={loading}
          style={{
            padding: "12px 32px",
            fontSize: 14,
            fontWeight: 700,
            background: loading
              ? "#1C2438"
              : "linear-gradient(135deg, #F59E0B, #D97706)",
            color: loading ? "#3D4D6A" : "#000",
            border: "none",
            borderRadius: 10,
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.02em",
            transition: "all 0.2s",
            boxShadow: loading
              ? "none"
              : "0 0 24px rgba(245,158,11,0.25), 0 2px 8px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow =
                "0 0 32px rgba(245,158,11,0.4), 0 4px 12px rgba(0,0,0,0.4)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow =
                "0 0 24px rgba(245,158,11,0.25), 0 2px 8px rgba(0,0,0,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {loading && (
            <span
              style={{
                width: 14,
                height: 14,
                border: "2px solid #3D4D6A",
                borderTop: "2px solid #F59E0B",
                borderRadius: "50%",
                animation: "solver-spin 0.7s linear infinite",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
          {loading ? "Solving…" : "▶  Solve"}
        </button>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          ERROR
      ═══════════════════════════════════════════════════════════════════ */}
      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #450a0a, #3b0a0a)",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: "var(--font-sans)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          RESULT PANEL
      ═══════════════════════════════════════════════════════════════════ */}
      {result && (
        <Card
          glow
          accent={result.verified ? "#10B98130" : "#F59E0B30"}
          style={{
            animation: "solver-fadeUp 0.35s ease both",
          }}
        >
          {/* ── Status header ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <EyebrowLabel color="#3D4D6A">RESULT</EyebrowLabel>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Verified / unverified badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 14px",
                  borderRadius: 20,
                  background: result.verified ? "#052e16" : "#422006",
                  color: result.verified ? "#4ade80" : "#fbbf24",
                  border: `1px solid ${result.verified ? "#166534" : "#78350f"}`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: result.verified ? "#22c55e" : "#f59e0b",
                    flexShrink: 0,
                  }}
                />
                {result.verified ? "Verified by SLaNg" : "Unverified"}
              </span>

              {/* Status badge */}
              <Tag
                color={
                  result.status === "solved"
                    ? "#10B981"
                    : result.status === "error"
                      ? "#EF4444"
                      : "#F59E0B"
                }
              >
                {result.status}
              </Tag>
            </div>
          </div>

          {/* ── Rule + Confidence ───────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: "#070A14",
                border: "1px solid #131B2E",
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#3D4D6A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Rule Applied
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#C084FC",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {result.rule?.replace(/_/g, " ") || "—"}
              </div>
            </div>

            <div
              style={{
                background: "#070A14",
                border: "1px solid #131B2E",
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#3D4D6A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Confidence
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    color:
                      (result.confidence || 0) >= 0.9
                        ? "#4ade80"
                        : (result.confidence || 0) >= 0.7
                          ? "#fbbf24"
                          : "#f87171",
                  }}
                >
                  {((result.confidence || 0) * 100).toFixed(1)}%
                </span>
                {/* Mini confidence bar */}
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "#131B2E",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(result.confidence || 0) * 100}%`,
                      height: "100%",
                      background:
                        (result.confidence || 0) >= 0.9
                          ? "linear-gradient(90deg, #10B981, #4ade80)"
                          : (result.confidence || 0) >= 0.7
                            ? "linear-gradient(90deg, #F59E0B, #fbbf24)"
                            : "linear-gradient(90deg, #EF4444, #f87171)",
                      borderRadius: 2,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Steps ──────────────────────────────────────────────────── */}
          {result.steps?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#3D4D6A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Step-by-Step Solution
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {result.steps.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 16px",
                      background: "#070A14",
                      border: "1px solid #131B2E",
                      borderRadius: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Step number */}
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#7C6FFF18",
                        border: "1px solid #7C6FFF30",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7C6FFF",
                        flexShrink: 0,
                        marginTop: 1,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      {s.rule && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#7C6FFF",
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {s.rule.replace(/_/g, " ")}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 13,
                          color: "#CBD5E1",
                          lineHeight: 1.6,
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {s.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LaTeX output ────────────────────────────────────────────── */}
          {result.latex && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#3D4D6A",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "var(--font-mono)",
                }}
              >
                LaTeX Output
              </div>
              <div
                style={{
                  background: "#070A14",
                  border: "1px solid #131B2E",
                  borderRadius: 8,
                  padding: "20px 24px",
                  textAlign: "center",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LatexBlock latex={result.latex} />
              </div>
            </div>
          )}

          {/* ── Unverified warning ──────────────────────────────────────── */}
          {result.status === "unverified" && (
            <div
              style={{
                marginTop: 18,
                padding: "12px 16px",
                borderRadius: 8,
                background: "#422006",
                border: "1px solid #78350f",
                color: "#fbbf24",
                fontSize: 12,
                lineHeight: 1.6,
                fontFamily: "var(--font-sans)",
              }}
            >
              ⚠ Model produced an answer but SLaNg could not verify it.
              The answer may be incorrect.
            </div>
          )}
        </Card>
      )}

      {/* ── Keyframe animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes solver-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes solver-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
