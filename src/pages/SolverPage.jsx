// src/pages/SolverPage.jsx
import { useState, useEffect } from "react";
import { PageWrap, SectionTitle, Card, Tag, Divider, Grid, EyebrowLabel } from "../components/ui.jsx";
import { solve as apiSolve, checkHealth } from "../api/calculusSolverClient.js";
import SlangTreeView from "../components/SlangTreeView.jsx";

// Import SLaNg mathematical engine for local parsing and formatting
import { latexToSlang, slangToLatex } from "../slang/convertor.js";

const MOCK = {
    status: "solved", rule: "mock_rule", confidence: 0.99, verified: true,
    expr: { numi: { terms: [{ coeff: 2, var: { x: 1 } }] }, deno: 1 },
    steps: [{ rule: "mock_rule",  description: "Mock response" }],
};

const OPS = [
    { value: "diff",          label: "Differentiate  d/dx" },
    { value: "integrate",     label: "Integrate  ∯ dx" },
    { value: "gradient",      label: "Gradient  ∇f" },
];

export default function SolverPage() {
    const [text,      setText]     = useState("");
    const [op,        setOp]       = useState("diff");
    const [variable,  setVar]      = useState("x");
    const [parsedInput, setParsedInput] = useState(null);
    const [result,    setResult]   = useState(null);
    const [normalOut, setNormalOut] = useState("");
    const [loading,   setLoading]  = useState(false);
    const [error,     setError]    = useState(null);
    const [apiOnline, setOnline]   = useState(null);
    const [useMock,   setUseMock]  = useState(true);

    useEffect(() => {
        checkHealth().then(ok => { setOnline(ok); setUseMock(!ok); });
    }, []);

    async function handleSolve() {
        if (!text.trim()) { setError("Please enter a math expression."); return; }
        
        setLoading(true); setError(null); setResult(null); setParsedInput(null); setNormalOut("");
        
        let slangExpr;
        try {
            // Local parsing using the SLaNg engine directly in the frontend
            slangExpr = latexToSlang(text);
            setParsedInput(slangExpr);
        } catch (err) {
            setError(`SLaNg Syntax Error: ${err.message}`);
            setLoading(false);
            return;
        }

        try {
            if (useMock) {
                await new Promise(r => setTimeout(r, 1100));
                setResult(MOCK);
                setNormalOut(slangToLatex(MOCK.expr));
            } else {
                const data = await apiSolve(slangExpr, op, variable);
                setResult(data);
                // Convert Output SLaNg back to Normal Math formatting locally
                if (data.expr) {
                    setNormalOut(slangToLatex(data.expr));
                }
            }
        } catch (err) {
            setError(err.message);
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
            width: "100%", padding: "14px 18px", fontSize: 16,
            background: "rgba(13, 17, 23, 0.7)", color: "#EFF3FF", boxSizing: "border-box",
            border: "1px solid rgba(124, 111, 255, 0.3)", borderRadius: 12, marginBottom: 16,
            fontFamily: "'IBM Plex Mono','Courier New',monospace", outline: "none",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)", transition: "border-color 0.3s, box-shadow 0.3s",
        },
        selectEl: {
            padding: "12px 16px", fontSize: 14, background: "rgba(13, 17, 23, 0.7)",
            color: "#CBD5E1", border: "1px solid rgba(124, 111, 255, 0.3)", borderRadius: 10,
            fontFamily: "'IBM Plex Mono','Courier New',monospace", flexShrink: 0,
            backdropFilter: "blur(12px)", outline: "none",
        },
        btn: {
            padding: "12px 28px", fontSize: 14, fontWeight: 700,
            background: loading ? "#1E293B" : "linear-gradient(135deg, #7C6FFF 0%, #4F38FF 100%)", 
            color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
            flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
            boxShadow: loading ? "none" : "0 8px 16px rgba(124, 111, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            transition: "transform 0.1s, box-shadow 0.2s",
        },
        err: {
            marginTop: 16, padding: "14px 18px", borderRadius: 10,
            background: "rgba(69, 10, 10, 0.8)", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13,
            backdropFilter: "blur(8px)",
        },
        badge: (v) => ({
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
            fontWeight: 600, padding: "4px 14px", borderRadius: 20, marginBottom: 16,
            background: v ? "rgba(5, 46, 22, 0.8)" : "rgba(66, 32, 6, 0.8)", 
            color: v ? "#4ade80" : "#fbbf24", border: `1px solid ${v ? '#166534' : '#92400e'}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)"
        }),
        stepCard: {
            padding: "12px 16px", borderRadius: 10, marginTop: 10,
            background: "rgba(8, 11, 20, 0.6)", border: "1px solid #1E293B",
            backdropFilter: "blur(4px)",
        },
        label: {
            display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#8B97B8", marginBottom: 8,
        },
        mLabel: { fontSize: 12, color: "#8B97B8", marginBottom: 4 },
        mValue: { fontSize: 16, fontWeight: 500, color: "#EFF3FF", marginBottom: 16 },
        mathOutput: {
            fontSize: 24, fontWeight: 600, color: "#fff",
            fontFamily: "'IBM Plex Mono','Courier New',monospace",
            textAlign: "center", padding: "24px",
            background: "linear-gradient(160deg, rgba(20,24,38,0.8) 0%, rgba(13,17,23,0.9) 100%)",
            borderRadius: 12, border: "1px solid #2a334e",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
            marginBottom: 24, letterSpacing: "0.05em"
        }
    };

    return (
        <PageWrap>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
                <SectionTitle sub="Powered by SLaNg Mathematical Engine and Groq AI">
                    <span style={{ fontSize: 32, background: "linear-gradient(to right, #93C5FD, #C4B5FD)", WebkitBackgroundClip: "text", color: "transparent" }}>
                        Intelligent Calculus Solver
                    </span>
                </SectionTitle>
                <div style={c.dot(apiOnline)}>
                    <span style={c.dotCircle(apiOnline)} />
                    {apiOnline === null && "Checking Backend Connectivity..."}
                    {apiOnline === true  && "SLaNg Backend Synchronized"}
                    {apiOnline === false && "Backend Offline — Using Mock Fallback"}
                </div>
            </div>

            <Card glow={true} accent="#4F38FF" style={{ marginBottom: 32, background: "rgba(13, 17, 23, 0.4)", backdropFilter: "blur(16px)" }}>
                <label style={c.label}>Mathematical Expression</label>
                <input
                    style={c.inputEl} type="text"
                    placeholder="e.g.  3x^2 + 2x   or   \frac{x}{x^2 + 1}"
                    value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !loading && handleSolve()}
                />

                <label style={c.label}>Operation &amp; Variable</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <select style={c.selectEl} value={op} onChange={e => setOp(e.target.value)}>
                        {OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select style={c.selectEl} value={variable} onChange={e => setVar(e.target.value)}>
                        <option value="x">Var: x</option>
                        <option value="y">Var: y</option>
                        <option value="t">Var: t</option>
                    </select>
                    <button style={c.btn} onClick={handleSolve} disabled={loading}>
                        {loading && (
                            <span style={{
                                width: 14, height: 14, border: "2px solid #ffffff40",
                                borderTop: "2px solid #fff", borderRadius: "50%",
                                animation: "cs-spin 0.7s linear infinite", display: "inline-block"
                            }} />
                        )}
                        {loading ? "Processing SLaNg..." : "Solve Graph ▶"}
                    </button>
                </div>

                {error && <div style={c.err}>{error}</div>}
            </Card>

            {(parsedInput || result) && (
                <Grid cols={result ? 2 : 1} gap={24}>
                    
                    {/* INPUT SLaNg Tree */}
                    {parsedInput && (
                        <Card accent="#3b82f6" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)" }}>
                            <EyebrowLabel color="#60a5fa">Local Parsed Input</EyebrowLabel>
                            <Divider style={{ margin: "16px 0" }} />
                            <div style={{ marginBottom: 16 }}>
                                <Tag color="#60a5fa">SLaNg Tree (expr)</Tag>
                            </div>
                            <SlangTreeView expr={parsedInput} label="Parsed Payload" />
                        </Card>
                    )}

                    {/* OUTPUT SLaNg Tree */}
                    {result && (
                        <Card glow={true} accent="#10b981" style={{ background: "rgba(6, 78, 59, 0.2)", backdropFilter: "blur(12px)" }}>
                            <EyebrowLabel color="#34d399">Backend Solver Output</EyebrowLabel>
                            <Divider style={{ margin: "16px 0" }} />
                            
                            {normalOut && (
                                <div>
                                    <div style={c.mLabel}>Formatted Math Result</div>
                                    <div style={c.mathOutput}>{normalOut}</div>
                                </div>
                            )}

                            <div style={c.badge(result.verified)}>
                                {result.verified ? "✓ Verified by SLaNg Core" : "⚠ Unverified AST"}
                            </div>
                            
                            <Grid cols={2} gap={16} style={{ marginBottom: 20 }}>
                                <div>
                                    <div style={c.mLabel}>Root Rule Applied</div>
                                    <div style={c.mValue}>{result.rule?.replace(/_/g, " ")}</div>
                                </div>
                                <div>
                                    <div style={c.mLabel}>AI Confidence</div>
                                    <div style={c.mValue}>{((result.confidence || 0) * 100).toFixed(1)}%</div>
                                </div>
                            </Grid>

                            {result.expr && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ marginBottom: 12 }}><Tag color="#34d399">Response SLaNg Tree</Tag></div>
                                    <SlangTreeView expr={result.expr} label="Result Graph" />
                                </div>
                            )}

                            {result.steps?.length > 0 && (
                                <div style={{ marginTop: 24 }}>
                                    <EyebrowLabel color="#a78bfa">Derivation Steps</EyebrowLabel>
                                    {result.steps.map((s, i) => (
                                        <div key={i} style={c.stepCard}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B97B8", marginBottom: 6 }}>
                                                {s.rule?.replace(/_/g, " ").toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>
                                                {s.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                </Grid>
            )}

            <style>{" @keyframes cs-spin { to { transform: rotate(360deg); } } "}</style>
        </PageWrap>
    );
}