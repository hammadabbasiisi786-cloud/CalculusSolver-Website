import { useState } from "react";
import {
  Card,
  Code,
  Grid,
  PageWrap,
  Divider,
  SectionTitle,
  Tag,
  EyebrowLabel,
  ListItem,
  StatBadge,
} from "../components/ui.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    id: "slang",
    icon: "⟨⟩",
    color: "#22D3EE",
    title: "SLaNg Expression Trees",
    tagline: "The language of the model",
    body: "All inputs and outputs are JSON trees — not LaTeX strings, not plain text. A SLaNg tree is a recursive structure of fractions (numi/deno), terms (coeff + var map), and operation envelopes (op, var, expr). You must be comfortable reading and writing these trees before touching any training code.",
    items: [
      "Fraction node: { numi: { terms: [...] }, deno: 1 }",
      "Term node: { coeff: 3, var: { x: 2 } } → 3x²",
      "Op envelope: { op: 'diff', var: 'x', expr: <fraction> }",
      "Evaluated via slangmath evaluateFraction(expr, { x: 2.5 })",
      "Converted to LaTeX via slangToLatex() in slang/src/convertor.js",
    ],
    code: `// Example: represents d/dx (3x² + 2x)
const input = {
  op: "diff",
  var: "x",
  expr: {
    numi: {
      terms: [
        { coeff: 3, var: { x: 2 } },   // 3x²
        { coeff: 2, var: { x: 1 } },   // 2x
      ]
    },
    deno: 1
  }
};

// Expected output SLaNg tree (6x + 2):
const output = {
  numi: {
    terms: [
      { coeff: 6, var: { x: 1 } },     // 6x
      { coeff: 2 },                     // 2 (constant)
    ]
  },
  deno: 1
};`,
  },
  {
    id: "tokenizer",
    icon: "🔤",
    color: "#7C6FFF",
    title: "Tokenizer & Vocabulary",
    tagline: "How the model reads a tree",
    body: "The model never sees JSON directly. The slang_serializer.js converts a SLaNg tree into a flat integer token sequence using Depth-First Search traversal. Each node type maps to an integer ID in tokenizer/vocab.json. Tree-aware positional encodings (depth, sibling index, path hash) replace standard sequential positions.",
    items: [
      "DFS order: root → children left-to-right, END tokens close each node",
      "vocab.json: every token family maps to a unique integer ID",
      "New op types require new vocab entries before any training run",
      "positional_encoding.py: three signals concatenated per token",
      "Serializer is deterministic — same tree always → same token sequence",
    ],
    code: `// Serialisation of sin(x) node:
// [FUNC:sin, VAR:x, END] → [42, 7, 2]

// vocab.json sample:
{
  "FUNC:sin":   42,
  "FUNC:cos":   43,
  "VAR:x":       7,
  "VAR:y":       8,
  "TERM:coeff": 15,
  "OP:diff":    20,
  "OP:integrate":21,
  "END":         2,
  "RULE:power_rule":  80,
  "RULE:chain_rule":  81
}

// Positional encoding per token i:
// pos[i] = Linear(depth) ⊕ Linear(sibling_idx) ⊕ Linear(path_hash)`,
  },
  {
    id: "training-pairs",
    icon: "📦",
    color: "#10B981",
    title: "Training Pairs Format",
    tagline: "What every sample must contain",
    body: "Every training sample is a JSONL line with four fields: the input op envelope, the solved output tree, the rule label(s) applied, and an optional step trace. Samples that fail numerical verification via evaluateFraction must be rejected before training — never include unverified pairs.",
    items: [
      "input: the full op envelope the model should solve",
      "output: solved SLaNg tree + rule label + steps array",
      "verified: true — set only after slangmath confirms correctness",
      "steps: array of { rule, description } — powers the Step Tracer",
      "generate_slang_data.js rejects unverified samples automatically",
    ],
    code: `// A valid .jsonl training line:
{
  "input": {
    "op": "diff", "var": "x",
    "expr": {
      "numi": { "terms": [{ "coeff": 4, "var": { "x": 3 } }] },
      "deno": 1
    }
  },
  "output": {
    "expr": {
      "numi": { "terms": [{ "coeff": 12, "var": { "x": 2 } }] },
      "deno": 1
    },
    "rule": "power_rule",
    "description": "Apply power rule: d/dx[x^3] = 3x^2",
    "steps": [
      { "rule": "power_rule",
        "description": "Apply power rule: d/dx[x^3] = 3x^2" }
    ]
  },
  "verified": true
}`,
  },
  {
    id: "checkpoint-flow",
    icon: "💾",
    color: "#F59E0B",
    title: "Three-Stage Checkpoint Flow",
    tagline: "Stage 1 → Stage 2 → Stage 3",
    body: "Training always runs in order. Each stage reads from the previous stage's best.pt. Never skip Stage 1 — the grammar pretraining is what teaches the decoder to produce structurally valid SLaNg before it has learned any calculus. Skipping it causes Stage 2 to converge to a degenerate solution.",
    items: [
      "checkpoints/pretrain/best.pt — grammar pretraining output",
      "checkpoints/sft/best.pt — supervised fine-tuning output",
      "checkpoints/final/best.pt — verifier-loop hard example output",
      "streamlit_app.py and api/app.py both resolve final → sft → pretrain",
      "best.pt is the lowest val-loss checkpoint from each stage",
    ],
    code: `# Checkpoint resolution order (api/app.py + streamlit_app.py):
candidates = [
    ROOT / "checkpoints" / "final"   / "best.pt",   # ← preferred
    ROOT / "checkpoints" / "sft"     / "best.pt",
    ROOT / "checkpoints" / "pretrain"/ "best.pt",
]
for path in candidates:
    if path.exists():
        model_path = path
        break
# If none found → FallbackSolver (deterministic polynomial math)`,
  },
  {
    id: "verifier",
    icon: "✓",
    color: "#C084FC",
    title: "Verifier-First Accuracy",
    tagline: "What 'correct' means here",
    body: "Structural token-level accuracy is not enough. Two SLaNg trees can look different but be algebraically equivalent. The official metric is numerical equivalence: evaluate both the model output and the ground truth at 50 random points and check they agree within 1e-9. eval/evaluate_model.py runs this automatically.",
    items: [
      "evaluateFraction(model_out, pt) vs evaluateFraction(ground_truth, pt)",
      "50 random test points, tolerance 1e-9, all 50 must pass",
      "val/numerical_equiv is the primary training metric to watch",
      "Rule accuracy = % of rule predictions matching ground truth label",
      "Step accuracy = % of step descriptions matching training annotation",
    ],
    code: `// Numerical equivalence check (slangmath):
function numericallyEqual(exprA, exprB, vars, tol=1e-9, pts=50) {
  for (let i = 0; i < pts; i++) {
    const pt = {};
    for (const v of vars) pt[v] = Math.random() * 9.6 - 4.8 + 0.01;
    const a = evaluateFraction(exprA, pt);
    const b = evaluateFraction(exprB, pt);
    if (!isFinite(a) || !isFinite(b)) continue;
    if (Math.abs(a - b) > tol) return false;
  }
  return true;
}

// python eval/evaluate_model.py reports:
// numerical_equiv | rule_accuracy | step_accuracy`,
  },
  {
    id: "api-streamlit",
    icon: "🚀",
    color: "#EF4444",
    title: "FastAPI + Streamlit Serving",
    tagline: "How trained checkpoints reach users",
    body: "Two serving surfaces share the same inference code. FastAPI (api/app.py) exposes /solve for programmatic clients with full JSON in/out. Streamlit (streamlit_app.py) loads the same checkpoint and shows an interactive web UI. Both fall back to the built-in polynomial solver when no checkpoint exists, so contributors can develop without a trained model.",
    items: [
      "FastAPI: uvicorn api.app:app --host 0.0.0.0 --port 8000",
      "Streamlit: streamlit run streamlit_app.py",
      "Both use CalculusSolverInference from inference/solve.py",
      "Fallback mode: basic polynomial diff/integrate only, confidence=1.0",
      "Streamlit shows GPU training panel and live accuracy metrics post-training",
    ],
    code: `# Start both surfaces locally:
# Terminal 1 — API
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Streamlit
streamlit run streamlit_app.py

# Test the API:
curl -X POST http://localhost:8000/solve \\
  -H "Content-Type: application/json" \\
  -d '{"input":{"op":"diff","var":"x",
       "expr":{"numi":{"terms":[{"coeff":1,"var":{"x":2}}]},
               "deno":1}}}'`,
  },
  {
    id: "rule-vocab",
    icon: "📋",
    color: "#F97316",
    title: "Rule Vocabulary",
    tagline: "The 30+ calculus rules the model knows",
    body: "The Rule Head predicts one of ~30 rule labels for each operator node. Every label maps directly to a slangmath function. If you add a new operation to the dataset you must also add its rule label to vocab.json under the RULE:* namespace and register the corresponding slangmath handler.",
    items: [
      "power_rule → differentiateFraction (basic polynomials)",
      "sum_rule → differentiateFraction (term-by-term)",
      "product_rule → productRuleDifferentiate (slang-advanced.js)",
      "quotient_rule → quotientRuleDifferentiate (slang-advanced.js)",
      "chain_rule → slang-extended.js composition handler",
      "partial_x / partial_y → gradient (multivariable)",
      "form_lagrangian / solve_system → lagrangeMultipliers",
      "power_rule_integral → integrateFraction (reverse power rule)",
    ],
    code: `// Adding a new rule (e.g. integration_by_parts):
// 1. Add to tokenizer/vocab.json:
{ "RULE:by_parts": 95 }

// 2. Add to model/rule_head.py RULE_LABELS list:
RULE_LABELS = [..., "by_parts"]

// 3. Register in data_pipeline/generate_slang_data.js:
function classifyRule(expr, variable) {
  // ... existing logic ...
  if (hasProductStructure(expr)) {
    return { rule: "by_parts",
             desc: "Apply integration by parts: ∫u dv = uv - ∫v du" };
  }
}

// 4. Regenerate data and retrain from Stage 1.`,
  },
];

const GPU_STAGES = [
  {
    id: 0,
    icon: "⚙️",
    color: "#22D3EE",
    label: "Environment Setup",
    sub: "Python venv · pip · npm · CUDA check",
    description:
      "Create an isolated Python environment, install all dependencies, and verify that PyTorch can see your GPU. The fp16 training configs require CUDA 11.8+ and at least 16 GB VRAM (A100/RTX 3090/4090 recommended). For multi-GPU runs use accelerate launch.",
    code: `# ── 1. Python environment ─────────────────────────────────────────
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt    # torch, transformers, accelerate, …

# ── 2. Node dependencies ──────────────────────────────────────────
npm install                        # installs slangmath + data tools

# ── 3. Verify GPU is visible ──────────────────────────────────────
python - <<'EOF'
import torch
print("CUDA available:", torch.cuda.is_available())
print("Device count:", torch.cuda.device_count())
print("Device name:", torch.cuda.get_device_name(0))
# Expected: True / 1+ / NVIDIA A100 (or similar)
EOF

# ── 4. (Multi-GPU) configure Accelerate ──────────────────────────
accelerate config                  # follow the prompts`,
  },
  {
    id: 1,
    icon: "📊",
    color: "#10B981",
    label: "Data Generation",
    sub: "generate_slang_data.js · split_data.js",
    description:
      "Generate verified SLaNg training pairs using the JavaScript pipeline. The generator runs slangmath to solve each problem and numerically verifies the answer before saving it. Unverified samples are silently skipped. Run split_data.js after generation to produce train/val/test splits.",
    code: `# ── Generate SLaNg training pairs (numerically verified) ──────────
node data_pipeline/generate_slang_data.js \\
  --count 100000 \\
  --out data/slang_dataset.jsonl
# Output: 100 K verified pairs (unverified are auto-skipped)
# Ops breakdown: diff×4, integrate×2, product_rule×2,
#                quotient_rule×1, gradient×1  (weighted)

# ── Split into train / val / test ─────────────────────────────────
node data_pipeline/split_data.js
# Creates: data/splits/train.jsonl
#          data/splits/val.jsonl
#          data/splits/test.jsonl

# ── (Optional) generate full 5M synthetic dataset ─────────────────
node data_pipeline/generate_synthetic.js \\
  --count 5000000 --ops all --vars x,y \\
  --out data/synthetic/
# ~18 hours, required for full production training`,
  },
  {
    id: 2,
    icon: "🔷",
    color: "#C084FC",
    label: "Stage 1 — Grammar Pretraining",
    sub: "training/pretrain.py · checkpoints/pretrain/",
    description:
      "Mask 20% of operator nodes in SLaNg trees and train the encoder-decoder to reconstruct them. No calculus — this stage teaches the model the structural rules of valid SLaNg expressions. Expected runtime is ~18 hours on a single A100. Never skip this stage.",
    code: `# ── Single GPU ───────────────────────────────────────────────────
python training/pretrain.py \\
  --config training/config/pretrain.yaml \\
  --data   data/splits/train.jsonl \\
  --output checkpoints/pretrain/

# ── Multi-GPU (via Accelerate) ────────────────────────────────────
accelerate launch training/pretrain.py \\
  --config training/config/pretrain.yaml \\
  --data   data/splits/train.jsonl \\
  --output checkpoints/pretrain/

# pretrain.yaml key settings:
# batch_size: 128 | lr: 2e-4 | warmup_steps: 5000
# max_steps: 300000 | mask_ratio: 0.20 | fp16: true
#
# Checkpoints saved every 10 000 steps.
# Best (lowest val loss) → checkpoints/pretrain/best.pt
# Monitor: wandb dashboard → val/loss`,
  },
  {
    id: 3,
    icon: "🎯",
    color: "#7C6FFF",
    label: "Stage 2 — Supervised Fine-Tuning",
    sub: "training/finetune.py · checkpoints/sft/",
    description:
      "Fine-tune on full (input → output + steps) calculus pairs. Combined loss: decoder cross-entropy + Rule Head cross-entropy (equal weight) + Step Tracer cross-entropy (0.5× weight). Expected runtime ~10 hours on a single A100.",
    code: `# ── Single GPU ───────────────────────────────────────────────────
python training/finetune.py \\
  --checkpoint checkpoints/pretrain/best.pt \\
  --config     training/config/finetune.yaml \\
  --data       data/splits/train.jsonl \\
  --val        data/splits/val.jsonl \\
  --output     checkpoints/sft/

# ── Multi-GPU ─────────────────────────────────────────────────────
accelerate launch training/finetune.py \\
  --checkpoint checkpoints/pretrain/best.pt \\
  --config     training/config/finetune.yaml \\
  --data       data/splits/train.jsonl \\
  --val        data/splits/val.jsonl \\
  --output     checkpoints/sft/

# finetune.yaml key settings:
# batch_size: 64 | lr: 5e-5 | warmup_steps: 1000
# max_steps: 150000 | fp16: true
# loss: decoder×1.0 | rule_head×1.0 | step_tracer×0.5
#
# Watch: val/numerical_equiv should climb steeply.
# Best checkpoint → checkpoints/sft/best.pt`,
  },
  {
    id: 4,
    icon: "🔁",
    color: "#F59E0B",
    label: "Stage 3 — Verifier-Loop",
    sub: "training/verifier_loop.py · checkpoints/final/",
    description:
      "After Stage 2, run the model over the training set, identify wrong answers by comparing against slangmath's evaluateFraction output, and up-weight those hard examples in subsequent batches. Repeats every 5 000 steps. Produces the final deployment checkpoint.",
    code: `# ── Single GPU ───────────────────────────────────────────────────
python training/verifier_loop.py \\
  --checkpoint        checkpoints/sft/best.pt \\
  --data              data/splits/train.jsonl \\
  --hard-example-ratio 0.4 \\
  --output            checkpoints/final/

# ── Multi-GPU ─────────────────────────────────────────────────────
accelerate launch training/verifier_loop.py \\
  --checkpoint        checkpoints/sft/best.pt \\
  --data              data/splits/train.jsonl \\
  --hard-example-ratio 0.4 \\
  --output            checkpoints/final/

# --hard-example-ratio 0.4:
#   40% of each batch = problems the model got wrong last pass.
#   If train/hard_pool_size grows unboundedly → reduce to 0.2.
#
# Final deployment checkpoint → checkpoints/final/best.pt
# After this step Streamlit and the API auto-load the new model.`,
  },
];

const STREAMLIT_PANELS = [
  {
    icon: "🔋",
    color: "#10B981",
    title: "Model Status Banner",
    desc: 'Shows "Neural checkpoint loaded" when checkpoints/final/best.pt (or sft/pretrain fallback) is present, or "Fallback mode" when no checkpoint exists. Contributors see which stage checkpoint is active.',
  },
  {
    icon: "🧮",
    color: "#7C6FFF",
    title: "Interactive Solver",
    desc: "Select a built-in example or paste any valid SLaNg JSON envelope. Press Solve to run the loaded model and see the full result object: expr, steps, latex, confidence, verified, rule.",
  },
  {
    icon: "📈",
    color: "#22D3EE",
    title: "Training Metrics Panel",
    desc: "After any training stage completes, the metrics panel (val/numerical_equiv, val/rule_accuracy, val/step_accuracy, train/hard_pool_size) is pulled from the checkpoint metadata and displayed as live cards.",
  },
  {
    icon: "🔬",
    color: "#C084FC",
    title: "Accuracy Test Runner",
    desc: "Run python eval/evaluate_model.py --num_samples N directly from the Streamlit sidebar. Results (per-rule accuracy breakdown, numerical_equiv %) stream back and render inline without leaving the UI.",
  },
];

const ACCURACY_STEPS = [
  {
    id: "a1",
    color: "#22D3EE",
    icon: "①",
    title: "Quick Smoke Test",
    desc: "Run 100 samples from the test split to check the deployed checkpoint is working. Takes ~30 seconds on CPU, ~5 seconds on GPU.",
    code: `python eval/evaluate_model.py \\
  --checkpoint checkpoints/final/best.pt \\
  --num_samples 100

# Expected output:
# numerical_equiv : 0.94   (94 / 100 passed)
# rule_accuracy   : 0.91
# step_accuracy   : 0.87`,
  },
  {
    id: "a2",
    color: "#7C6FFF",
    icon: "②",
    title: "Full Benchmark Evaluation",
    desc: "Run the AP Calculus benchmark — the canonical accuracy reference for this project. Uses 50 random test points per sample.",
    code: `node eval/slang_equivalence.js \\
  --checkpoint checkpoints/final/best.pt \\
  --benchmark  eval/benchmarks/ap_calculus.json \\
  --points     50

node eval/step_accuracy.js \\
  --checkpoint checkpoints/final/best.pt \\
  --benchmark  eval/benchmarks/ap_calculus.json`,
  },
  {
    id: "a3",
    color: "#10B981",
    icon: "③",
    title: "Per-Rule Breakdown",
    desc: "Identify which rules the model struggles with most. Useful after a new training run to see if a specific operation regressed.",
    code: `# Per-rule accuracy report:
python eval/evaluate_model.py \\
  --checkpoint checkpoints/final/best.pt \\
  --num_samples 1000 \\
  --per_rule

# Sample output:
# power_rule         : 0.98
# sum_rule           : 0.97
# product_rule       : 0.91
# quotient_rule      : 0.88
# chain_rule         : 0.84
# partial_derivative : 0.79
# form_lagrangian    : 0.71   ← needs more data`,
  },
  {
    id: "a4",
    color: "#F59E0B",
    icon: "④",
    title: "Live API Testing via Streamlit",
    desc: "Start both servers, then use Streamlit's Accuracy Test panel to run eval inline. Also lets you manually test edge-case expressions before filing a PR.",
    code: `# Terminal 1:
streamlit run streamlit_app.py

# Terminal 2 (optional — tests the full API path):
uvicorn api.app:app --host 0.0.0.0 --port 8000

# In Streamlit sidebar:
#   → "Run accuracy test"  → set N samples → click Run
#   Results stream into the right panel in real time.
#
# Manually test an edge case:
curl -s http://localhost:8000/solve \\
  -H "Content-Type: application/json" \\
  -d @my_test_case.json | python -m json.tool`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ContributePage() {
  const [activeConcept, setActiveConcept] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [activeAccuracy, setActiveAccuracy] = useState(0);

  const concept = CONCEPTS[activeConcept];
  const stage = GPU_STAGES[activeStage];
  const accuracy = ACCURACY_STEPS[activeAccuracy];

  return (
    <PageWrap>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <EyebrowLabel color="#10B981">CONTRIBUTOR GUIDE</EyebrowLabel>
        <h1
          style={{
            margin: "10px 0 12px",
            fontSize: 32,
            fontWeight: 700,
            color: "#EFF3FF",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            fontFamily: "var(--font-sans)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #10B981, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Train & Contribute
          </span>
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#3D4D6A",
            lineHeight: 1.75,
            maxWidth: 640,
            fontFamily: "var(--font-sans)",
          }}
        >
          Everything you need to understand the codebase, extend the model, run
          GPU training, visualise results in Streamlit, and measure accuracy
          before filing a pull request.
        </p>
      </div>

      {/* ── Quick stats ───────────────────────────────────────────────── */}
      <Grid cols={4} gap={12} style={{ marginBottom: 48 }}>
        <StatBadge value="7" label="Core concepts" color="#10B981" />
        <StatBadge value="3" label="Training stages" color="#7C6FFF" />
        <StatBadge value="~36h" label="Full GPU run" color="#22D3EE" />
        <StatBadge value="50pts" label="Verify test points" color="#F59E0B" />
      </Grid>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — REQUIRED CONCEPTS
      ════════════════════════════════════════════════════════════════ */}
      <SectionTitle sub="Master these seven concepts before writing any training or inference code.">
        Required Concepts
      </SectionTitle>

      <Grid cols={2} gap={16} style={{ marginBottom: 40 }}>
        {/* Left: concept selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {CONCEPTS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveConcept(i)}
              style={{
                textAlign: "left",
                padding: "13px 16px",
                border: `1px solid ${i === activeConcept ? c.color + "40" : "#1C2438"}`,
                borderLeft: `3px solid ${i === activeConcept ? c.color : "transparent"}`,
                background:
                  i === activeConcept ? c.color + "0C" : "transparent",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (i !== activeConcept) {
                  e.currentTarget.style.background = "#ffffff05";
                  e.currentTarget.style.borderLeftColor = c.color + "30";
                }
              }}
              onMouseLeave={(e) => {
                if (i !== activeConcept) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderLeftColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{c.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: i === activeConcept ? c.color : "#8B97B8",
                      transition: "color 0.15s",
                      marginBottom: 2,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#3D4D6A",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {c.tagline}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: concept detail */}
        <Card accent={concept.color + "25"} glow>
          <div style={{ marginBottom: 14 }}>
            <EyebrowLabel color={concept.color}>{concept.title}</EyebrowLabel>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                color: "#8B97B8",
                lineHeight: 1.75,
                fontFamily: "var(--font-sans)",
              }}
            >
              {concept.body}
            </p>
            <div>
              {concept.items.map((item, i) => (
                <ListItem key={i} color={concept.color}>
                  {item}
                </ListItem>
              ))}
            </div>
          </div>
          <Code>{concept.code}</Code>
        </Card>
      </Grid>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — GPU TRAINING WALKTHROUGH
      ════════════════════════════════════════════════════════════════ */}
      <SectionTitle sub="Run the full three-stage training pipeline on a single GPU or multi-GPU setup.">
        GPU Training — Step by Step
      </SectionTitle>

      {/* Stage pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 20,
          padding: "14px 18px",
          background: "#0B0E1A",
          border: "1px solid #1C2438",
          borderRadius: 10,
        }}
      >
        {GPU_STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 6,
              border: `1px solid ${i === activeStage ? s.color + "40" : "#1C2438"}`,
              background: i === activeStage ? s.color + "12" : "transparent",
              color: i === activeStage ? s.color : "#3D4D6A",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: i === activeStage ? 600 : 400,
              transition: "all 0.15s",
              fontFamily: "var(--font-sans)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (i !== activeStage) e.currentTarget.style.color = "#8B97B8";
            }}
            onMouseLeave={(e) => {
              if (i !== activeStage) e.currentTarget.style.color = "#3D4D6A";
            }}
          >
            <span>{s.icon}</span>
            <span style={{ fontSize: 10, opacity: 0.6 }}>{i + 1}.</span>
            {s.label}
          </button>
        ))}
      </div>

      <Card accent={stage.color + "30"} glow style={{ marginBottom: 16 }}>
        <Grid cols={2} gap={24}>
          <div>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  lineHeight: 1,
                  width: 46,
                  height: 46,
                  background: stage.color + "14",
                  border: `1px solid ${stage.color}28`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stage.icon}
              </span>
              <div>
                <EyebrowLabel color={stage.color}>
                  Step {stage.id + 1} of {GPU_STAGES.length}
                </EyebrowLabel>
                <div
                  style={{ fontSize: 15, color: "#EFF3FF", fontWeight: 700 }}
                >
                  {stage.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#3D4D6A",
                    marginTop: 2,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {stage.sub}
                </div>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#8B97B8",
                lineHeight: 1.8,
                fontFamily: "var(--font-sans)",
              }}
            >
              {stage.description}
            </p>
          </div>
          <Code>{stage.code}</Code>
        </Grid>
      </Card>

      {/* WandB monitoring note */}
      <Card style={{ marginBottom: 40 }}>
        <EyebrowLabel color="#F59E0B">
          MONITORING — WEIGHTS & BIASES
        </EyebrowLabel>
        <p
          style={{
            fontSize: 13,
            color: "#8B97B8",
            lineHeight: 1.75,
            margin: "8px 0 16px",
            fontFamily: "var(--font-sans)",
          }}
        >
          All three stages log to Weights & Biases automatically (requires{" "}
          <code
            style={{
              color: "#22D3EE",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            wandb login
          </code>{" "}
          before training). Key metrics to monitor:
        </p>
        <Grid cols={2} gap={10}>
          {[
            [
              "val/numerical_equiv",
              "% of val outputs passing evaluateFraction check — primary metric",
            ],
            [
              "val/rule_accuracy",
              "% of rule predictions matching ground truth label",
            ],
            [
              "val/step_accuracy",
              "% of step descriptions matching training annotation",
            ],
            [
              "train/hard_pool_size",
              "Problems in the hard example pool (Stage 3 only)",
            ],
          ].map(([metric, desc]) => (
            <div
              key={metric}
              style={{
                background: "#0B0E1A",
                border: "1px solid #1C2438",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#F59E0B",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 4,
                }}
              >
                {metric}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#3D4D6A",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </Grid>
      </Card>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — STREAMLIT UI PANELS
      ════════════════════════════════════════════════════════════════ */}
      <SectionTitle sub="What Streamlit shows after a training run and how to use each panel.">
        Streamlit — Training Results & Testing
      </SectionTitle>

      <p
        style={{
          fontSize: 13.5,
          color: "#8B97B8",
          lineHeight: 1.8,
          marginBottom: 24,
          fontFamily: "var(--font-sans)",
        }}
      >
        After any training stage deposits a checkpoint, run{" "}
        <code
          style={{
            color: "#22D3EE",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          streamlit run streamlit_app.py
        </code>{" "}
        and the app automatically detects the best available checkpoint (final →
        sft → pretrain). The four panels below are what you will see:
      </p>

      <Grid cols={2} gap={14} style={{ marginBottom: 32 }}>
        {STREAMLIT_PANELS.map((panel, i) => (
          <Card key={i} accent={panel.color + "20"}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  width: 40,
                  height: 40,
                  background: panel.color + "14",
                  border: `1px solid ${panel.color}28`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {panel.icon}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: panel.color,
                    marginBottom: 5,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {panel.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8B97B8",
                    lineHeight: 1.65,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {panel.desc}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </Grid>

      {/* Streamlit launch snippet */}
      <Code>{`# Launch Streamlit (auto-loads best available checkpoint):
streamlit run streamlit_app.py

# With a specific checkpoint:
MODEL_PATH=checkpoints/sft/best.pt streamlit run streamlit_app.py

# The app reads MODEL_PATH env var first, then walks:
#   checkpoints/final/best.pt  →  checkpoints/sft/best.pt  →  checkpoints/pretrain/best.pt
# If none found: FallbackSolver (polynomial diff/integrate only, confidence=1.0)

# To expose on your network (useful for a training server):
streamlit run streamlit_app.py --server.address 0.0.0.0 --server.port 8501`}</Code>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — ACCURACY TESTING
      ════════════════════════════════════════════════════════════════ */}
      <SectionTitle sub="Four ways to measure and verify model accuracy before submitting a PR.">
        Testing Accuracy
      </SectionTitle>

      {/* Accuracy step tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {ACCURACY_STEPS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setActiveAccuracy(i)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${i === activeAccuracy ? a.color + "50" : "#1C2438"}`,
              background: i === activeAccuracy ? a.color + "14" : "transparent",
              color: i === activeAccuracy ? a.color : "#3D4D6A",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: i === activeAccuracy ? 600 : 400,
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              if (i !== activeAccuracy) e.currentTarget.style.color = "#8B97B8";
            }}
            onMouseLeave={(e) => {
              if (i !== activeAccuracy) e.currentTarget.style.color = "#3D4D6A";
            }}
          >
            <span>{a.icon}</span>
            {a.title}
          </button>
        ))}
      </div>

      <Card accent={accuracy.color + "30"} glow style={{ marginBottom: 40 }}>
        <Grid cols={2} gap={24}>
          <div>
            <EyebrowLabel color={accuracy.color}>{accuracy.title}</EyebrowLabel>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13.5,
                color: "#8B97B8",
                lineHeight: 1.8,
                fontFamily: "var(--font-sans)",
              }}
            >
              {accuracy.desc}
            </p>
          </div>
          <Code>{accuracy.code}</Code>
        </Grid>
      </Card>

      {/* PR checklist */}
      <Card>
        <EyebrowLabel color="#10B981">
          PR CHECKLIST — BEFORE YOU SUBMIT
        </EyebrowLabel>
        <p
          style={{
            fontSize: 13,
            color: "#8B97B8",
            margin: "8px 0 14px",
            lineHeight: 1.7,
            fontFamily: "var(--font-sans)",
          }}
        >
          Every pull request that modifies training code, the data pipeline, the
          vocabulary, or the model architecture must include the following:
        </p>
        {[
          "Run python eval/evaluate_model.py --num_samples 500 and paste the output table in the PR description.",
          "If you added a new rule: add it to tokenizer/vocab.json, model/rule_head.py RULE_LABELS, and the data generator, then regenerate data from scratch.",
          "If you changed the model architecture: restart from Stage 1 — do not fine-tune an incompatible checkpoint.",
          "All new training samples must have verified: true (never include unverified pairs).",
          "Include a before/after comparison for val/numerical_equiv from W&B.",
          "Streamlit must start without errors and show the correct checkpoint in the status banner.",
        ].map((item, i) => (
          <ListItem key={i} color="#10B981">
            {item}
          </ListItem>
        ))}
      </Card>
    </PageWrap>
  );
}
