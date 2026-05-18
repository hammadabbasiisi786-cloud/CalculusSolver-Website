/* ─────────────────────────────────────────
   ui.jsx — Improved component library
   Font: Space Grotesk (sans) + JetBrains Mono (code)
   ───────────────────────────────────────── */

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({
  children,
  accent,
  style = {},
  className = "",
  glow = false,
}) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(160deg, #0D1220 0%, #09101C 100%)",
        border: `1px solid ${accent ? accent : "#1C2438"}`,
        borderRadius: 12,
        padding: "24px 28px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow:
          glow && accent
            ? `0 0 32px ${accent}18, inset 0 1px 0 ${accent}12`
            : "0 1px 3px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Tag ─────────────────────────────────────────────────────────────────────
export function Tag({ children, color = "#7C6FFF" }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 9px",
        borderRadius: 4,
        background: color + "16",
        color,
        border: `1px solid ${color}30`,
        letterSpacing: "0.07em",
        fontWeight: 600,
        display: "inline-block",
        textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}

// ── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-primary, #EFF3FF)",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          fontFamily: "var(--font-sans)",
        }}
      >
        {children}
      </h2>
      {sub && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "var(--text-muted, #3D4D6A)",
            lineHeight: 1.6,
            fontFamily: "var(--font-sans)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Code ─────────────────────────────────────────────────────────────────────
export function Code({ children, style = {}, label }) {
  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div
          style={{
            fontSize: 9,
            color: "#3D4D6A",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "7px 14px",
            background: "#070A14",
            borderRadius: "7px 7px 0 0",
            border: "1px solid #131B2E",
            borderBottom: "none",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          fontSize: 11.5,
          lineHeight: 1.9,
          color: "#93C5FD",
          background: "#070A14",
          padding: "14px 18px",
          borderRadius: label ? "0 0 8px 8px" : 8,
          border: "1px solid #131B2E",
          borderTop: label ? "1px solid #0F1728" : "1px solid #131B2E",
          overflowX: "auto",
          whiteSpace: "pre",
          fontFamily: "var(--font-mono)",
          ...style,
        }}
      >
        {children}
      </pre>
    </div>
  );
}

// ── Dot ──────────────────────────────────────────────────────────────────────
export function Dot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        marginRight: 7,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}60`,
      }}
    />
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
export function Row({ children, gap = 16, style = {} }) {
  return <div style={{ display: "flex", gap, ...style }}>{children}</div>;
}

// ── Grid ──────────────────────────────────────────────────────────────────────
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

// ── PageWrap ──────────────────────────────────────────────────────────────────
export function PageWrap({ children }) {
  return (
    <div
      className="page-content"
      style={{ maxWidth: 1020, margin: "0 auto", padding: "48px 36px 72px" }}
    >
      {children}
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
export function Pill({ children, color = "#7C6FFF" }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 11px",
        borderRadius: 100,
        background: color + "14",
        color,
        border: `1px solid ${color}28`,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style = {} }) {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(90deg, transparent, #1C2438 20%, #1C2438 80%, transparent)",
        margin: "40px 0",
        ...style,
      }}
    />
  );
}

// ── ListItem ──────────────────────────────────────────────────────────────────
export function ListItem({ children, color = "#7C6FFF" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        padding: "8px 0",
        borderBottom: "1px solid #0F1728",
        fontSize: 12.5,
        color: "#8B97B8",
        alignItems: "flex-start",
        lineHeight: 1.55,
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ color, flexShrink: 0, marginTop: 2, fontSize: 9 }}>◆</span>
      {children}
    </div>
  );
}

// ── EyebrowLabel ──────────────────────────────────────────────────────────────
export function EyebrowLabel({ children, color = "#7C6FFF" }) {
  return (
    <div
      style={{
        fontSize: 10,
        color,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: 7,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </div>
  );
}

// ── StatBadge — NEW ───────────────────────────────────────────────────────────
export function StatBadge({ value, label, color = "#7C6FFF" }) {
  return (
    <div
      style={{
        background: color + "0D",
        border: `1px solid ${color}25`,
        borderRadius: 10,
        padding: "14px 18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 5,
          fontFamily: "var(--font-sans)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#3D4D6A",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
