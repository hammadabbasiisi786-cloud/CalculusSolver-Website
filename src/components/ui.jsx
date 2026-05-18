export function Card({ children, accent, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(145deg, #0D1117 0%, #0A0F1A 100%)",
        border: `1px solid ${accent || "#1E293B"}`,
        borderRadius: 12,
        padding: "22px 26px",
        transition: "border-color 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Tag({ children, color = "#6366F1" }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 9px",
        borderRadius: 4,
        background: color + "18",
        color,
        border: `1px solid ${color}35`,
        letterSpacing: "0.07em",
        fontWeight: 700,
        display: "inline-block",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: "#F1F5F9",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
        }}
      >
        {children}
      </h2>
      {sub && (
        <p
          style={{
            margin: "7px 0 0",
            fontSize: 12.5,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function Code({ children, style = {}, label }) {
  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div
          style={{
            fontSize: 9,
            color: "#334155",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "8px 14px 0",
            background: "#020817",
            borderRadius: "6px 6px 0 0",
            border: "1px solid #0F172A",
            borderBottom: "none",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {label}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          fontSize: 11.5,
          lineHeight: 1.8,
          color: "#7DD3FC",
          background: "#020817",
          padding: "14px 16px",
          borderRadius: label ? "0 0 6px 6px" : 6,
          border: "1px solid #0F172A",
          borderTop: label ? "1px solid #0D1624" : "1px solid #0F172A",
          overflowX: "auto",
          whiteSpace: "pre",
          ...style,
        }}
      >
        {children}
      </pre>
    </div>
  );
}

export function Dot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
}

export function Row({ children, gap = 16, style = {} }) {
  return <div style={{ display: "flex", gap, ...style }}>{children}</div>;
}

export function Grid({ children, cols = 2, gap = 16, style = {} }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageWrap({ children }) {
  return (
    <div
      style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 32px 60px" }}
    >
      {children}
    </div>
  );
}

export function Pill({ children, color = "#6366F1" }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 10px",
        borderRadius: 100,
        background: color + "15",
        color,
        border: `1px solid ${color}30`,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function Divider({ style = {} }) {
  return (
    <div
      style={{
        borderTop: "1px solid #1E293B",
        margin: "36px 0",
        position: "relative",
        ...style,
      }}
    />
  );
}

export function ListItem({ children, color = "#6366F1" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        padding: "7px 0",
        borderBottom: "1px solid #0D1624",
        fontSize: 12,
        color: "#94A3B8",
        alignItems: "flex-start",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color, flexShrink: 0, marginTop: 1, fontSize: 10 }}>
        ▸
      </span>
      {children}
    </div>
  );
}

export function EyebrowLabel({ children, color = "#6366F1" }) {
  return (
    <div
      style={{
        fontSize: 10,
        color,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}
