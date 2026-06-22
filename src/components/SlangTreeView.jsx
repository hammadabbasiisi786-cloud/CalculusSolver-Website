// SlangTreeView.jsx — Advanced SLaNg AST Visualizer
// Handles all three SLaNg shapes: term | polynomial | fraction
import { useState } from "react";

function termStr(term) {
    const c = term.coeff ?? 1;
    const vs = Object.entries(term.var || {})
        .filter(([, e]) => e !== 0)
        .map(([v, e]) => e === 1 ? v : `${v}^${e}`).join("");
    if (!vs) return String(Number(c.toFixed ? c.toFixed(6).replace(/\.?0+$/, "") : c));
    if (c === 1) return vs;
    if (c === -1) return `-${vs}`;
    const cStr = typeof c === "number" ? c.toFixed(6).replace(/\.?0+$/, "") : String(c);
    return `${cStr}${vs}`;
}

function polynomialStr(poly) {
    if (!poly?.terms?.length) return "0";
    return poly.terms.map((t, i) => {
        const s = termStr(t);
        if (i === 0) return s;
        return t.coeff >= 0 ? ` + ${s}` : ` ${s}`;
    }).join("");
}

function getShape(expr) {
    if (!expr) return "unknown";
    if (expr.numi !== undefined && expr.deno !== undefined) return "fraction";
    if (expr.terms !== undefined) return "polynomial";
    if (expr.coeff !== undefined) return "term";
    return "unknown";
}

const NODE_COLORS = {
    fraction:   { bg: "#110827", border: "#7C6FFF", text: "#c4b5fd" },
    polynomial: { bg: "#051c1c", border: "#22d3ee", text: "#67e8f9" },
    numerator:  { bg: "#052e16", border: "#22c55e", text: "#4ade80" },
    denominator:{ bg: "#422006", border: "#f59e0b", text: "#fbbf24" },
    term:       { bg: "#0d1117", border: "#475569", text: "#94a3b8" },
};

function NodeBox({ label, color, onClick, expanded }) {
    const c = NODE_COLORS[color] || NODE_COLORS.term;
    return (
        <div
            onClick={onClick}
            style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 8, cursor: onClick ? "pointer" : "default",
                background: c.bg, border: `1px solid ${c.border}60`,
                color: c.text, fontWeight: 700, fontSize: 11.5, marginBottom: 4,
                boxShadow: `0 2px 12px ${c.border}20`,
                transition: "border-color 0.2s, box-shadow 0.2s",
                userSelect: "none",
            }}
        >
            {label}
            {onClick && <span style={{ opacity: 0.6, fontSize: 9 }}>{expanded ? "▲" : "▼"}</span>}
        </div>
    );
}

function Connector() {
    return <div style={{ width: 1, height: 12, background: "#1E293B", margin: "0 auto 4px" }} />;
}

function TermPill({ term }) {
    return (
        <div style={{
            padding: "4px 11px", borderRadius: 6, fontSize: 11,
            background: "#080B14", border: "1px solid #1E293B",
            color: "#CBD5E1", fontFamily: "'IBM Plex Mono','Courier New',monospace",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
        }}>
            {termStr(term)}
        </div>
    );
}

function TermRow({ terms }) {
    return (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
            {(terms?.length ? terms : [{ coeff: 0 }]).map((t, i) => <TermPill key={i} term={t} />)}
        </div>
    );
}

function PolynomialNode({ poly, label, color }) {
    const [open, setOpen] = useState(true);
    const str = polynomialStr(poly);
    return (
        <div style={{ textAlign: "center" }}>
            <NodeBox label={`${label}: ${str}`} color={color} onClick={() => setOpen(!open)} expanded={open} />
            {open && (
                <>
                    <Connector />
                    <TermRow terms={poly?.terms} />
                </>
            )}
        </div>
    );
}

function FractionNode({ expr }) {
    const denoIsOne = typeof expr.deno === "number" && expr.deno === 1;
    const denoTerms = expr.deno?.terms;
    const trivialDeno = denoIsOne || (denoTerms?.length === 1 && denoTerms[0]?.coeff === 1 && !Object.keys(denoTerms[0]?.var || {}).length);

    return (
        <div style={{ textAlign: "center" }}>
            <NodeBox label="Fraction" color="fraction" />
            <Connector />
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
                <PolynomialNode poly={expr.numi} label="Numerator" color="numerator" />
                {!trivialDeno && (
                    <div>
                        {typeof expr.deno === "number"
                            ? (<><NodeBox label={`Denominator: ${expr.deno}`} color="denominator" /></>)
                            : <PolynomialNode poly={expr.deno} label="Denominator" color="denominator" />}
                    </div>
                )}
            </div>
        </div>
    );
}

function PolynomialTopNode({ expr }) {
    return (
        <div style={{ textAlign: "center" }}>
            <NodeBox label="Polynomial" color="polynomial" />
            <Connector />
            <TermRow terms={expr.terms} />
        </div>
    );
}

function TermTopNode({ expr }) {
    return (
        <div style={{ textAlign: "center" }}>
            <NodeBox label={`Term: ${termStr(expr)}`} color="term" />
        </div>
    );
}

export default function SlangTreeView({ expr, label }) {
    if (!expr) return null;
    const shape = getShape(expr);

    // JSON viewer panel
    const [showRaw, setShowRaw] = useState(false);

    return (
        <div style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", overflowX: "auto" }}>
            {label && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {label}
                    </div>
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        style={{
                            fontSize: 10, padding: "2px 9px", borderRadius: 6, cursor: "pointer",
                            background: "#0D1117", border: "1px solid #1E293B", color: "#64748B",
                            fontFamily: "inherit"
                        }}
                    >
                        {showRaw ? "Graph ▲" : "JSON ▼"}
                    </button>
                </div>
            )}

            {showRaw ? (
                <pre style={{
                    margin: 0, fontSize: 10.5, lineHeight: 1.8, color: "#67e8f9",
                    background: "#060a14", padding: "12px 14px", borderRadius: 8,
                    border: "1px solid #1E293B", overflowX: "auto", whiteSpace: "pre-wrap"
                }}>
                    {JSON.stringify(expr, null, 2)}
                </pre>
            ) : (
                <div style={{ padding: "8px 0", textAlign: "center" }}>
                    {shape === "fraction"   && <FractionNode expr={expr} />}
                    {shape === "polynomial" && <PolynomialTopNode expr={expr} />}
                    {shape === "term"       && <TermTopNode expr={expr} />}
                    {shape === "unknown"    && (
                        <pre style={{ fontSize: 10.5, color: "#94a3b8", textAlign: "left" }}>
                            {JSON.stringify(expr, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}