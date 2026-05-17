export function Card({ children, accent, style = {} }) {
  return (
    <div style={{
      background: "#0D1117",
      border: `1px solid ${accent || "#1E293B"}`,
      borderRadius: 10,
      padding: "20px 24px",
      ...style,
    }}>{children}</div>
  );
}

export function Tag({ children, color = "#6366F1" }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4,
      background: color + "20", color, border: `1px solid ${color}40`,
      letterSpacing: "0.06em", fontWeight: 600,
    }}>{children}</span>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>{children}</h2>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>{sub}</p>}
    </div>
  );
}

export function Code({ children, style = {} }) {
  return (
    <pre style={{
      margin: 0, fontSize: 11.5, lineHeight: 1.75,
      color: "#7DD3FC", background: "#020817",
      padding: "14px 16px", borderRadius: 6,
      border: "1px solid #0F172A",
      overflowX: "auto", whiteSpace: "pre",
      ...style,
    }}>{children}</pre>
  );
}

export function Dot({ color }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, marginRight: 6, flexShrink: 0 }} />;
}

export function Row({ children, gap = 16, style = {} }) {
  return <div style={{ display: "flex", gap, ...style }}>{children}</div>;
}

export function Grid({ children, cols = 2, gap = 16, style = {} }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap, ...style }}>
      {children}
    </div>
  );
}

export function PageWrap({ children }) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "40px 32px" }}>
      {children}
    </div>
  );
}

export function Pill({ children, color = "#6366F1" }) {
  return (
    <span style={{
      fontSize: 10, padding: "3px 10px", borderRadius: 100,
      background: color + "15", color, border: `1px solid ${color}30`,
      letterSpacing: "0.08em",
    }}>{children}</span>
  );
}

export function Divider() {
  return <div style={{ borderTop: "1px solid #1E293B", margin: "28px 0" }} />;
}
