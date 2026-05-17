import { useState } from "react";
import { Card, Code, Grid, PageWrap, Divider, SectionTitle, Tag } from "../components/ui.jsx";

const MODULES = [
  {
    file: "slang-basic.js",
    color: "#06B6D4",
    title: "Basic Operations",
    desc: "Core expression building blocks. All other modules build on top of these.",
    functions: [
      { name: "createTerm(coeff, vars)", desc: "Atomic unit: coefficient × variables^powers. e.g. createTerm(3, {x:2}) → 3x²" },
      { name: "createFraction(terms, deno)", desc: "Fraction with polynomial numerator and numeric denominator. Default deno=1." },
      { name: "evaluateTerm / evaluateFraction", desc: "Substitute numbers for variables and compute numerically." },
      { name: "differentiateTerm / differentiateFraction", desc: "Exact symbolic differentiation via power rule." },
      { name: "integrateTerm / integrateFraction", desc: "Exact indefinite integration via reverse power rule." },
      { name: "definiteIntegrateFraction", desc: "Evaluates integral between bounds a and b." },
      { name: "simplifyFraction / expandProduct", desc: "Combine like terms, expand products of fractions." },
    ],
    code: `import { createTerm, createFraction,
  differentiateFraction, evaluateFraction } from './slang-basic.js';

// Build (x² + 3x) / 1
const expr = createFraction([
  createTerm(1, { x: 2 }),   // x²
  createTerm(3, { x: 1 })    // 3x
]);

const deriv = differentiateFraction(expr, 'x');
// → (2x + 3) / 1

const val = evaluateFraction(deriv, { x: 5 });
// → 13`,
  },
  {
    file: "slang-advanced.js",
    color: "#A855F7",
    title: "Advanced Calculus",
    desc: "Higher-level operations built on top of slang-basic: Taylor series, limits, optimization, curve analysis.",
    functions: [
      { name: "taylorSeries(expr, var, center, terms)", desc: "Polynomial approximation around a point." },
      { name: "computeLimit(expr, var, point)", desc: "Evaluates limits including L'Hôpital cases." },
      { name: "findCriticalPoints(expr, var, range)", desc: "Finds where f'(x) = 0 numerically over a range." },
      { name: "secondDerivativeTest(expr, var, point)", desc: "Classifies critical points as min/max/inflection." },
      { name: "analyzeCurve(expr, var)", desc: "Full curve sketch analysis: monotonicity, concavity, inflections." },
      { name: "integrationByParts(u, dv, var)", desc: "Integration by parts: ∫u dv = uv - ∫v du." },
      { name: "partialFractionDecomposition", desc: "Decomposes rational functions for easier integration." },
    ],
    code: `import { findCriticalPoints, secondDerivativeTest,
  taylorSeries } from './slang-advanced.js';

// f(x) = x³ - 3x
const cubic = polynomial([1, 0, -3, 0], 'x');
const pts = findCriticalPoints(cubic[0][0], 'x', [-3, 3], 1000);
// criticalPoints: [-1, 1]

const test = secondDerivativeTest(cubic[0][0], 'x', pts[0]);
// → { type: 'local maximum', f''(x): -6 }`,
  },
  {
    file: "slang-extended.js",
    color: "#F59E0B",
    title: "Multivariable Calculus",
    desc: "Gradient, Hessian, tangent planes, Lagrange multipliers, directional derivatives — everything for functions of multiple variables.",
    functions: [
      { name: "gradient(expr, vars[])", desc: "Returns {∂f/∂x, ∂f/∂y, ...} as SLaNg objects for each variable." },
      { name: "hessian(expr, vars[])", desc: "2D matrix of second partial derivatives. Symmetric by construction." },
      { name: "tangentPlane(expr, vars[], point)", desc: "Equation of tangent plane z = f(a,b) + ∇f·(r - r₀)." },
      { name: "lagrangeMultipliers(f, g, vars[])", desc: "Constrained optimization via ∇f = λ∇g." },
      { name: "directionalDerivative(expr, vars[], point, dir)", desc: "Rate of change in an arbitrary unit direction." },
      { name: "findExtrema / classifyCriticalPoint", desc: "Find and classify critical points of multivariable functions." },
    ],
    code: `import { gradient, hessian,
  lagrangeMultipliers } from './slang-extended.js';

// f(x,y) = x² + 3xy + y²
const f = { terms: [
  createTerm(1, {x:2}),
  createTerm(3, {x:1,y:1}),
  createTerm(1, {y:2})
]};

const grad = gradient(f, ['x', 'y']);
// grad.x → 2x + 3y
// grad.y → 3x + 2y

const H = hessian(f, ['x', 'y']);
// H.x.x → 2,  H.x.y → 3 (symmetric)`,
  },
  {
    file: "slang-convertor.js",
    color: "#10B981",
    title: "LaTeX ↔ SLaNg Converter",
    desc: "Bidirectional conversion between LaTeX strings and SLaNg tree objects. This is the bridge from existing math datasets to SLaNg format.",
    functions: [
      { name: "slangToLatex(expr)", desc: "SLaNg tree → LaTeX string for display." },
      { name: "latexToSlang(latex)", desc: "LaTeX string → SLaNg tree object for computation." },
      { name: "batchConvertToLatex / batchConvertToSlang", desc: "Batch conversions for large datasets." },
      { name: "validateLatex(str)", desc: "Check whether a LaTeX string is parseable." },
      { name: "areExpressionsEquivalent(a, b)", desc: "Test symbolic equivalence of two expressions." },
      { name: "getExpressionComplexity(expr)", desc: "Measure depth and number of nodes in a SLaNg tree." },
    ],
    code: `import { slangToLatex, latexToSlang,
  areExpressionsEquivalent } from './slang-convertor.js';

// SLaNg → LaTeX (for display)
const latex = slangToLatex(createTerm(3, {x: 2}));
// → "3x^{2}"

// LaTeX → SLaNg (for computation from datasets)
const expr = latexToSlang("\\\\frac{x^2 + 1}{x}");
// → { numi: { terms: [x², 1] }, deno: x }

// CalculusSolver uses this to import AP Calculus,
// MIT 18.01/18.02 training data (440K problems)`,
  },
  {
    file: "slang-symbolic.js",
    color: "#EF4444",
    title: "Symbolic Engine",
    desc: "Full symbolic expression trees with trig, exponential, logarithmic, hyperbolic functions and their exact differentiation/integration rules.",
    functions: [
      { name: "symConst / symVar / symFn", desc: "Build symbolic expression nodes: constants, variables, function applications." },
      { name: "symAdd / symMul / symDiv / symPow", desc: "Combine expressions with arithmetic operators." },
      { name: "sin, cos, tan, exp, ln, sqrt, …", desc: "Convenience constructors for all 16 supported functions." },
      { name: "symDiff(expr, var)", desc: "Exact symbolic differentiation with chain rule, product rule, etc." },
      { name: "symIntegrate(expr, var)", desc: "Symbolic integration rules for all supported function forms." },
      { name: "symSimplify(expr)", desc: "Apply trig identities, constant folding, and algebraic simplification." },
      { name: "symEval(expr, vars)", desc: "Numerically evaluate a symbolic expression at a given point." },
    ],
    code: `import { symVar, sin, cos, exp, ln,
  symMul, symAdd, symDiff, symEval } from './slang-symbolic.js';

const x = symVar('x');

// Build sin(x²) * exp(x)
const expr = symMul(sin(symMul(x, x)), exp(x));

// Exact symbolic differentiation
const deriv = symDiff(expr, 'x');
// chain rule + product rule applied automatically

// Numerical evaluation
const val = symEval(deriv, { x: 1.0 });`,
  },
  {
    file: "slang-helpers.js",
    color: "#F97316",
    title: "Helper Builders",
    desc: "High-level construction helpers: polynomial(), sum(), product(), monomial(). These are the ergonomic API on top of createTerm/createFraction.",
    functions: [
      { name: "polynomial(coeffs[], var)", desc: "e.g. polynomial([1,-4,4],'x') builds x² - 4x + 4 as equation form." },
      { name: "sum(terms[])", desc: "Build a sum from [(coeff, vars)] pairs." },
      { name: "product(factors[])", desc: "Build a product of fractions." },
      { name: "monomial(coeff, vars)", desc: "Single-term equation shorthand." },
      { name: "evaluateAt(expr, point)", desc: "Wrapper for evaluateEquation at a point." },
      { name: "expandAndSimplify(expr)", desc: "Expand and collect like terms in one step." },
      { name: "partialDerivative(expr, var)", desc: "Treat all other variables as constants and differentiate." },
    ],
    code: `import { polynomial, sum } from './slang-helpers.js';

// x³ - 3x  (instead of manual createTerm calls)
const cubic = polynomial([1, 0, -3, 0], 'x');

// f(x,y) = x²y + 2xy² - x + y
const multivar = sum([
  [1,  { x: 2, y: 1 }],   // x²y
  [2,  { x: 1, y: 2 }],   // 2xy²
  [-1, { x: 1 }],          // -x
  [1,  { y: 1 }]           // y
]);`,
  },
  {
    file: "slang-stats.js + slang-linalg.js",
    color: "#64748B",
    title: "Statistics & Linear Algebra",
    desc: "Extensions for statistical operations and matrix algebra — used internally by slang-extended for Hessian computation and optimization algorithms.",
    functions: [
      { name: "multipleRegression(X, y)", desc: "Least squares via Gaussian elimination. Returns coefficients, R², predictions." },
      { name: "incompleteGamma / incompleteBeta", desc: "Special functions for statistical distributions." },
      { name: "doubleIntegral / tripleIntegral", desc: "2D/3D Gauss-Legendre quadrature over rectangular or functional regions." },
      { name: "arcLength / surfaceAreaOfRevolution", desc: "32-point Gauss-Legendre for high-precision geometric integration." },
      { name: "volumeOfRevolution", desc: "Disk method: V = π ∫(f(x))² dx." },
    ],
    code: `import { doubleIntegral, arcLength } from './slang-advanced.js';
import { multipleRegression } from './slang-stats.js';

// ∫∫ f(x,y) dA over [0,1]×[0,1]
const result = doubleIntegral(
  expr, 'x', 'y', 0, 1, 0, 1
);  // 2D Gauss-Legendre, 16 points/dim

// Arc length of y=sin(x) from 0 to π
const L = arcLength(sinExpr, 'x', 0, Math.PI);
// 32-point Gauss-Legendre quadrature`,
  },
];

export default function SLaNgPage() {
  const [active, setActive] = useState(0);
  const mod = MODULES[active];

  return (
    <PageWrap>
      <SectionTitle sub="A JavaScript math library that represents calculus expressions as structured trees and computes exact symbolic results. CalculusSolver is built entirely on top of SLaNg.">
        SLaNg Math Library
      </SectionTitle>

      {/* Data structure explainer */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#06B6D4", letterSpacing: "0.1em", marginBottom: 12 }}>THE DATA STRUCTURE — EVERYTHING IS A TREE</div>
        <Grid cols={3} gap={12}>
          <div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>TERM — atomic unit</div>
            <Code>{`// 3x²y
createTerm(3, { x: 2, y: 1 })
// → { coeff: 3,
//    var: { x: 2, y: 1 } }`}</Code>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>FRACTION — polynomial / number</div>
            <Code>{`// (x² + 5) / 2
createFraction(
  [createTerm(1,{x:2}), createTerm(5)],
  2
)
// → { numi:{terms:[…]}, deno:2 }`}</Code>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>EQUATION — sum of products</div>
            <Code>{`// x² + 3x + 1
// stored as 3 separate products:
[ [frac_x2], [frac_3x], [frac_1] ]
// added together at eval time`}</Code>
          </div>
        </Grid>
      </Card>

      <Divider />
      <SectionTitle sub="Click a module to explore its functions and code.">Module Reference</SectionTitle>

      <Grid cols={2} gap={16}>
        {/* Module list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {MODULES.map((m, i) => (
            <button key={m.file} onClick={() => setActive(i)} style={{
              textAlign: "left", padding: "12px 16px",
              border: `1px solid ${i === active ? m.color + "50" : "#1E293B"}`,
              borderLeft: `3px solid ${i === active ? m.color : "transparent"}`,
              background: i === active ? m.color + "0D" : "#0D1117",
              borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: i === active ? m.color : "#94A3B8", marginBottom: 3 }}>{m.file}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{m.title}</div>
            </button>
          ))}
        </div>

        {/* Module detail */}
        <Card accent={mod.color + "40"}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: mod.color, letterSpacing: "0.1em", marginBottom: 4 }}>{mod.file}</div>
            <div style={{ fontSize: 15, color: "#F1F5F9", fontWeight: 700, marginBottom: 6 }}>{mod.title}</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "#94A3B8", lineHeight: 1.6 }}>{mod.desc}</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 8 }}>EXPORTED FUNCTIONS</div>
            {mod.functions.map((f, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < mod.functions.length - 1 ? "1px solid #0F172A" : "none" }}>
                <code style={{ fontSize: 11, color: mod.color }}>{f.name}</code>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 8 }}>USAGE EXAMPLE</div>
            <Code>{mod.code}</Code>
          </div>
        </Card>
      </Grid>

      <Divider />

      {/* Capabilities summary */}
      <SectionTitle sub="What SLaNg can compute out of the box.">Full Capability Map</SectionTitle>
      <Grid cols={3} gap={12}>
        {[
          { title: "Single-Variable", color: "#06B6D4", items: ["Differentiation (power rule)", "Indefinite integration", "Definite integration", "Product / Quotient rule", "Chain rule (symbolic)", "Simplification & expansion", "Limit computation", "Taylor series"] },
          { title: "Multivariable", color: "#A855F7", items: ["Partial derivatives", "Gradient vector ∇f", "Hessian matrix H", "Tangent planes", "Directional derivatives", "Lagrange multipliers", "Critical point classification", "Double & Triple integrals"] },
          { title: "Applied / Geometry", color: "#10B981", items: ["Arc length (32-pt GL)", "Surface area of revolution", "Volume of revolution", "Trig & transcendental fns", "LaTeX ↔ SLaNg", "Numerical verification", "Multiple regression", "Statistical distributions"] },
        ].map(section => (
          <Card key={section.title} accent={section.color + "30"}>
            <div style={{ fontSize: 11, color: section.color, letterSpacing: "0.1em", marginBottom: 10 }}>{section.title}</div>
            {section.items.map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #0F172A", fontSize: 12, color: "#94A3B8" }}>
                <span style={{ color: section.color, marginTop: 1 }}>▸</span> {item}
              </div>
            ))}
          </Card>
        ))}
      </Grid>
    </PageWrap>
  );
}
