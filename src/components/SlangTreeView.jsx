export default function SlangTreeView({ expr, label }) {
    if (!expr?.numi || !expr?.deno) return null;

    function termStr(term) {
        const c = term.coeff ?? 1;
        const vs = Object.entries(term.var || {})
            .filter(([, e]) => e !== 0)
            .map(([v, e]) => e === 1 ? v : `${v}^${e}`).join("");
        if (!vs) return String(c);
        if (c === 1) return vs; if (c === -1) return `-${vs}`;
        return `${c}${vs}`;
    }

    const numiTerms  = expr.numi?.terms || [];
    const denoTerms  = expr.deno?.terms || [];
    const trivialDeno = denoTerms.length === 1 && denoTerms[0]?.coeff === 1
        && !Object.keys(denoTerms[0]?.var || {}).length;

    const node = (text, bg, color) => (
        <div style={{ display: "inline-block", padding: "5px 12px", borderRadius: 6,
                    background: bg, border: `1px solid ${color}40`, color,
                    fontWeight: 600, fontSize: 11, marginBottom: 5 }}>{text}</div>
    );
    const conn = <div style={{ width: 1, height: 10, background: "#1E293B", margin: "0 auto 4px" }} />;
    const termRow = (terms) => (
        <div style={{ display: "flex", gap: 5, justifyContent: "center",
                    flexWrap: "wrap", marginBottom: 6 }}>
            {(terms.length ? terms : [{ coeff: 0 }]).map((t, i) => (
                <div key={i} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 11, background: "#080B14", border: "1px solid #1E293B", color: "#CBD5E1" }}>{termStr(t)}</div>
            ))}
        </div>
    );

    return (
        <div style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 11, textAlign: "center", overflowX: "auto" }}>
            {label && <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase",
                                    letterSpacing: "0.07em", marginBottom: 8, textAlign: "left" }}>{label}</div>}
            {node("Fraction", "#0f172a", "#6366F1")}
            {conn}
            {node("Numerator", "#052e16", "#4ade80")}
            {conn}
            {termRow(numiTerms)}
            {!trivialDeno && (
                <>
                    <div style={{ borderTop: "1px solid #1E293B", margin: "4px 0 8px" }} />
                    {node("Denominator", "#422006", "#fbbf24")}
                    {conn}
                    {termRow(denoTerms)}
                </>
            )}
        </div>
    );
}

// ── HOW TO USE IN SolverPage ─────────────────────────
// import SlangTreeView from "../components/SlangTreeView.jsx";
//
// Add this inside the result block, after the steps:
//
// {result.expr?.numi && (
//   <div style={{ marginTop: 20 }}>
//     <div style={{ fontSize: 10, color: "#475569",
//                   textTransform: "uppercase", letterSpacing: "0.07em",
//                   marginBottom: 10 }}>Output expression (SLaNg tree)</div>
//     <SlangTreeView expr={result.expr} label="Output" />
//   </div>
// )}