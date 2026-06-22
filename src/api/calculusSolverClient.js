const API_BASE = import.meta.env.VITE_API_URL || "https://api.calculussolver.quantumlogicslimited.com";

export async function solve(expr, opType = "diff", variable = "x") {
    let res;
    try {
        res = await fetch(`${API_BASE}/solve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                op: opType,
                var: variable,
                expr: expr,
            }),
        });
    } 
    catch {
        throw new Error("offline");
        }

    if (res.status === 400) {
        const e = await res.json().catch(() => ({}));
        throw new Error(`Invalid input: ${e.detail || "check your expression"}`);
    }
    if (res.status === 422) {
        throw new Error("Expression not recognised. Try something like: x^2 + 3x");
    }
    if (!res.ok) {
        throw new Error(`Server error (${res.status}). Please try again.`);
    }

    return res.json();
}

export async function checkHealth() {
    try {
        const r = await fetch(`${API_BASE}/health`, {
            signal: AbortSignal.timeout(4000),
        });
        return r.ok;
    } 
    catch {
        return false;
    }
}