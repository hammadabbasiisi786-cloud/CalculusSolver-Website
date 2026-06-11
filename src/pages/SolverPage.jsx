// src/pages/SolverPage.jsx
import { useState, useEffect } from "react";
import { PageWrap, SectionTitle, Card, Tag, Divider } from "../components/ui.jsx";
import { solve as apiSolve, checkHealth } from "../api/calculusSolverClient.js";
import SlangTreeView from "../components/SlangTreeView.jsx";

const MOCK = {
    status: "solved", rule: "quotient_rule", confidence: 0.96, verified: true,
    steps: [{ rule: "quotient_rule",  description: "d/dx[u/v] = (v·u′ − u·v′) / v²" }],
};

const OPS = [
    { value: "diff",          label: "Differentiate  d/dx" },
    { value: "integrate",     label: "Integrate  ∯ dx" },
    { value: "gradient",      label: "Gradient  ∇f" },
    { value: "lagrange",      label: "Lagrange Multipliers" },
    { value: "product_rule",  label: "Product Rule" },
    { value: "quotient_rule", label: "Quotient Rule" },
];

export default function SolverPage() {
    const [text,      setText]     = useState("");
    const [op,        setOp]       = useState("diff");
    const [variable,  setVar]      = useState("x");
    const [result,    setResult]   = useState(null);
    const [loading,   setLoading]  = useState(false);
    const [error,     setError]    = useState(null);
    const [apiOnline, setOnline]   = useState(null);
    const [useMock,   setUseMock]  = useState(true);

    useEffect(() => {
        checkHealth().then(ok => { setOnline(ok); setUseMock(!ok); });
    }, []);

    async function handleSolve() {
        if (!text.trim()) { setError("Please enter a math expression."); return; }
        setLoading(true); setError(null); setResult(null);
        try {
            if (useMock) {
                await new Promise(r => setTimeout(r, 1100));
                setResult(MOCK);
            } else {
                const data = await apiSolve(text, op, variable);
                setResult(data);
            }
        } catch (err) {
            if (err.message === "offline") {
                setError("Solver API is offline. Showing mock result instead.");
                setUseMock(true);
                await new Promise(r => setTimeout(r, 1100));
                setResult(MOCK);
            } else {
                setError(err.message);
            }
        } finally { setLoading(false); }
    }

    const c = {
        dot: (ok) => ({
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11,
            padding: "3px 10px", borderRadius: 20, marginBottom: 24,
            background: ok === null ? "#1E293B" : ok ? "#052e16" : "#450a0a",
            color:      ok === null ? "#64748B" : ok ? "#4ade80" : "#f87171",
        }),
        dotCircle: (ok) => ({
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: ok === null ? "#475569" : ok ? "#22c55e" : "#ef4444",
        }),
        inputEl: {
            width: "100%", padding: "10px 14px", fontSize: 13,
            background: "#0D1117", color: "#CBD5E1", boxSizing: "border-box",
            border: "1px solid #1E293B", borderRadius: 8, marginBottom: 14,
            fontFamily: "'IBM Plex Mono','Courier New',monospace", outline: "none",
        },
        selectEl: {
            padding: "9px 12px", fontSize: 12, background: "#0D1117",
            color: "#CBD5E1", border: "1px solid #1E293B", borderRadius: 8,
            fontFamily: "'IBM Plex Mono','Courier New',monospace", flexShrink: 0,
        },
        btn: {
            padding: "9px 22px", fontSize: 13, fontWeight: 600,
            background: loading ? "#1E293B" : "#6366F1", color: "#fff",
            border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
            flexShrink: 0, display: "flex", alignItems: "center", gap: 7,
        },
        err: {
            marginTop: 12, padding: "10px 14px", borderRadius: 8,
            background: "#450a0a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 12,
        },
        resultCard: {
            marginTop: 28, background: "#0D1117", border: "1px solid #1E293B",
            borderRadius: 10, padding: "20px 22px",
        },
        badge: (v) => ({
            display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11,
            fontWeight: 600, padding: "3px 10px", borderRadius: 20, marginBottom: 14,
            background: v ? "#052e16" : "#422006", color: v ? "#4ade80" : "#fbbf24",
        }),
        stepCard: {
            padding: "10px 14px", borderRadius: 8, marginTop: 8,
            background: "#080B14", border: "1px solid #1E293B",
        },
        label: {
            display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
            textTransform: "uppercase", color: "#475569", marginBottom: 6,
        },
        mLabel: { fontSize: 11, color: "#475569", marginBottom: 3 },
        mValue: { fontSize: 14, fontWeight: 500, color: "#F1F5F9", marginBottom: 12 },
    };

    return (
        <PageWrap>
            <SectionTitle sub="Type a math expression — the ML model solves it in SLaNg format">
                Try the Solver
            </SectionTitle>

            <div style={c.dot(apiOnline)}>
                <span style={c.dotCircle(apiOnline)} />
                {apiOnline === null && "Checking API..."}
                {apiOnline === true  && "Solver API online"}
                {apiOnline === false && "Solver API offline — using mock data"}
            </div>

            <label style={c.label}>Math expression</label>
            <input
                style={c.inputEl} type="text"
                placeholder="e.g.  3x^2 + 2x   or   2x / (x^2 + 1)"
                value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && handleSolve()}
            />

            <label style={c.label}>Operation &amp; variable</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
                <select style={c.selectEl} value={op}       onChange={e => setOp(e.target.value)}>
                    {OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select style={c.selectEl} value={variable} onChange={e => setVar(e.target.value)}>
                    <option value="x">Variable: x</option>
                    <option value="y">Variable: y</option>
                    <option value="t">Variable: t</option>
                </select>
                <button style={c.btn} onClick={handleSolve} disabled={loading}>
                    {loading && (
                        <span style={{
                            width: 13, height: 13, border: "2px solid #ffffff40",
                            borderTop: "2px solid #fff", borderRadius: "50%",
                            animation: "cs-spin 0.7s linear infinite", display: "inline-block"
                        }} />
                    )}
                    {loading ? "Solving..." : "Solve ▶"}
                </button>
            </div>

            {error && <div style={c.err}>{error}</div>}

            {result && (
                <div style={c.resultCard}>
                    <div style={c.badge(result.verified)}>
                        {result.verified ? "✓ Verified by SLaNg" : "⚠ Unverified"}
                    </div>
                    <div style={c.mLabel}>Rule applied</div>
                    <div style={c.mValue}>{result.rule?.replace(/_/g, " ")}</div>
                    <div style={c.mLabel}>Confidence</div>
                    <div style={c.mValue}>{((result.confidence || 0) * 100).toFixed(1)}%</div>
                    {result.steps?.length > 0 && (
                        <>
                            <div style={c.mLabel}>Steps</div>
                            {result.steps.map((s, i) => (
                                <div key={i} style={c.stepCard}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 3 }}>
                                        {s.rule?.replace(/_/g, " ")}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#CBD5E1" }}>{s.description}</div>
                                </div>
                            ))}
                        </>
                    )}
                    {result.expr?.numi && (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 10, color: "#475569",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.07em", marginBottom: 10 }}>
                                Output expression (SLaNg tree)
                            </div>
                            <SlangTreeView expr={result.expr} label="Output" />
                        </div>
                    )}
                    {result.status === "unverified" && (
                        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#422006", border: "1px solid #78350f", color: "#fbbf24", fontSize: 12 }}>
                            Model produced an answer but SLaNg math could not verify it. Answer may be incorrect.
                        </div>
                    )}
                </div>
            )}

            <style>{"        @keyframes cs-spin { to { transform: rotate(360deg); } }      "}</style>
        </PageWrap>
    );
}