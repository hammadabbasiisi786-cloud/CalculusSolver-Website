import { useState } from "react";
import {
  Card,
  Code,
  Grid,
  PageWrap,
  Divider,
  SectionTitle,
} from "../components/ui.jsx";

const LAYERS = [
  {
    id: 0,
    icon: "⟨⟩",
    label: "Tokenizer",
    color: "#06B6D4",
    sub: "slang_serializer.js · vocab.json · positional_encoding.py",
    desc: "Converts SLaNg expression trees into integer token sequences. Depth-First Search traversal maps every node type to an integer ID from vocab.json. Tree-aware positional encoding embeds (depth, sibling_index, path_hash) — not just sequential positions — so the model understands tree structure.",
    detail: [
      "slang_serializer.js — DFS tree → token sequence",
      "vocab.json — node types mapped to integer IDs",
      "positional_encoding.py — (depth, sibling, path_hash) embeddings",
      "SLaNg validity mask state machine tracks parse state",
    ],
    code: `// DFS serialisation of a SLaNg tree
// sin(x) → [FUNC:sin, VAR:x, END]
const tokens    = dfsSerialize(slangTree);
const positions = encodeTreePosition(tokens);
// positions[i] = { depth, siblingIdx, pathHash }

// vocab.json example entries:
// "FUNC:sin"   → 42
// "VAR:x"      → 7
// "TERM:coeff" → 15
// "END"        → 2`,
  },
  {
    id: 1,
    icon: "🔷",
    label: "Tree Encoder",
    color: "#A855F7",
    sub: "model/tree_encoder.py",
    desc: "An 8-layer Transformer encoder that reads the full SLaNg token sequence. Modified self-attention includes a parent-child bias: tokens in a parent-child relationship in the original tree get a learnable additive bias to their attention scores, so the model sees tree structure even though it processes a flat sequence.",
    detail: [
      "8-layer Transformer, 512 hidden dim, 8 heads",
      "Parent-child attention bias on top of standard self-attention",
      "Reads the full input token sequence at once (no causal mask)",
      "Outputs encoder_out: (batch, seq_in, 512)",
    ],
    code: `# tree_encoder.py (simplified)
class TreeEncoder(nn.Module):
    def forward(self, tokens, positions,
                parent_child_pairs):
        x = self.embed(tokens) + self.pos_embed(positions)
        for layer in self.layers:
            # parent-child attention bias
            bias = self.pc_bias[parent_child_pairs]
            x = layer(x, attn_bias=bias)
        return x  # shape: (batch, seq_in, 512)`,
  },
  {
    id: 2,
    icon: "📋",
    label: "Rule Head",
    color: "#F59E0B",
    sub: "model/rule_head.py",
    desc: "A single linear layer on top of the encoder output for each operator node in the input tree. It predicts which SLaNg calculus rule applies at that node — power_rule, chain_rule, product_rule, quotient_rule, u_substitution, by_parts, etc. These predictions are readable by humans and map one-to-one with real slangmath function names.",
    detail: [
      "One linear layer: (512 → n_rules) per operator node",
      "Rule labels: power_rule, chain_rule, product_rule, quotient_rule, …",
      "Each label maps to a real slangmath function name",
      "Rule predictions are injected into the decoder as prefix embeddings",
    ],
    code: `# rule_head.py
class RuleHead(nn.Module):
    def forward(self, encoder_out, operator_mask):
        # operator_mask: which positions are operators
        op_hidden = encoder_out[operator_mask]
        rule_logits = self.linear(op_hidden)
        # → (n_operators, n_rules)
        # n_rules ≈ 30: power_rule, chain_rule,
        #   product_rule, quotient_rule, by_parts, ...
        return rule_logits`,
  },
  {
    id: 3,
    icon: "🔁",
    label: "Tree Decoder",
    color: "#EF4444",
    sub: "model/tree_decoder.py · inference/beam_search.py",
    desc: "An 8-layer autoregressive Transformer decoder that generates the output SLaNg token sequence one token at a time. At each step it attends to (1) its own previous tokens, (2) the full encoder output via cross-attention, (3) Rule Head predictions injected as prefix embeddings. The SLaNg validity mask sets logits to -inf for any token that would violate SLaNg grammar — making syntactically invalid expressions impossible at the token level, not just filtered later.",
    detail: [
      "8-layer decoder, same dims as encoder",
      "Causal self-attention + cross-attention to encoder",
      "Rule embeddings injected at each subtree boundary",
      "SLaNg validity mask: state automaton enforces grammar at every step",
      "Beam search over candidate output trees (inference/beam_search.py)",
    ],
    code: `# tree_decoder.py (simplified)
def decode_step(prev_tokens, encoder_out,
                rule_embeddings, parse_state):
    hidden = self.self_attn(prev_tokens)        # causal
    hidden = self.cross_attn(hidden, encoder_out)
    hidden = hidden + rule_embeddings[subtree]  # rule injection

    logits = self.lm_head(hidden[:, -1])

    # SLaNg validity mask — makes wrong syntax impossible
    mask = compute_slang_validity_mask(parse_state)
    logits[~mask] = float('-inf')

    return logits, next_parse_state(parse_state, token)`,
  },
  {
    id: 4,
    icon: "💬",
    label: "Step Tracer",
    color: "#10B981",
    sub: "model/step_tracer.py",
    desc: "A small auxiliary head — not a separate language model — that generates human-readable step descriptions from the Rule Head's predictions. It takes the rule ID and the decoder's hidden state, looks up a learned template for each rule in vocab.json, and fills in the relevant sub-expressions. Trained with teacher-forcing at 0.5× the weight of the main decoder loss.",
    detail: [
      "Input: Rule Head prediction + decoder hidden state",
      "Templates stored in vocab.json under RULE:* entries",
      "Placeholders {u}, {v}, {var} filled by nearest-neighbor vocab match",
      "Loss weight 0.5× — auxiliary, not dominant",
    ],
    code: `# step_tracer.py
class StepTracer(nn.Module):
    def forward(self, rule_ids, decoder_hidden):
        # Look up template for each rule
        templates = self.template_embed(rule_ids)
        # Fill placeholders from decoder hidden state
        slot_embs = self.slot_proj(decoder_hidden)
        descriptions = self.fill_slots(
            templates, slot_embs, self.vocab
        )
        # → ["Apply chain rule to sin(x²): ...",
        #    "Differentiate outer function: ..."]
        return descriptions`,
  },
];

const TRAINING_STAGES = [
  {
    n: 1,
    label: "Masked SLaNg Tree Pretraining",
    color: "#6366F1",
    script: "training/pretrain.py",
    desc: "Randomly masks 20% of operator nodes (replaces with [MASK]). Trains the encoder-decoder to reconstruct the original token. No calculus learned here — only SLaNg grammar. The Rule Head and Step Tracer are NOT trained at this stage.",
    config: `# pretrain.yaml
model:
  encoder_layers: 8
  decoder_layers: 8
  hidden_dim: 512
  heads: 8
training:
  batch_size: 128
  lr: 2e-4
  warmup_steps: 5000
  max_steps: 300_000
  mask_ratio: 0.20
  fp16: true
# Output: checkpoints/pretrain/best.pt`,
  },
  {
    n: 2,
    label: "Supervised Fine-Tuning",
    color: "#A855F7",
    script: "training/finetune.py",
    desc: "Full model (Encoder + Rule Head + Decoder + Step Tracer) trained on complete (input SLaNg → output SLaNg + steps) pairs using teacher-forcing. Rule Head and Step Tracer initialized fresh. Combined loss weights: decoder ×1.0, rule_head ×1.0, step_tracer ×0.5.",
    config: `Loss = decoder_ce(logits, tokens)    × 1.0
     + rule_head_ce(rules, targets)   × 1.0
     + step_tracer_ce(steps, targets) × 0.5

# Input: checkpoints/pretrain/best.pt
# Output: checkpoints/sft/best.pt`,
  },
  {
    n: 3,
    label: "SLaNg-in-the-Loop Hard Example Training",
    color: "#EF4444",
    script: "training/verifier_loop.py",
    desc: "For each model prediction, run the corresponding slangmath function and compare outputs numerically via evaluateFraction. Wrong answers are upweighted at 40% per batch. SLaNg is the judge inside the training loop itself.",
    config: `# verifier_loop.py (simplified)
for batch in dataloader:
    pred = model(batch.input)
    correct = slangmath.verify(
        pred, batch.output, testPoints=50
    )
    # Wrong answers → 40% upweight
    weights = torch.where(~correct,
        tensor(0.4), tensor(0.1))
    loss = (ce_loss * weights).mean()
# Output: checkpoints/final/best.pt`,
  },
];

const DATA_SOURCES = [
  {
    name: "Synthetic (generate_synthetic.js)",
    pairs: "5,000,000",
    color: "#10B981",
    desc: "Random SLaNg trees + slangmath solves them. Biased toward rare ops (Lagrange, series).",
  },
  {
    name: "AP Calculus AB/BC",
    pairs: "40K / 65K",
    color: "#6366F1",
    desc: "38% rejection rate from latex_to_slang.js parse failures.",
  },
  {
    name: "MIT 18.01 (Single Variable)",
    pairs: "120K / 180K",
    color: "#A855F7",
    desc: "33% rejection rate.",
  },
  {
    name: "MIT 18.02 (Multivariable)",
    pairs: "200K / 280K",
    color: "#06B6D4",
    desc: "29% rejection rate.",
  },
  {
    name: "Taylor Series Expansion",
    pairs: "80K / 110K",
    color: "#F59E0B",
    desc: "27% rejection rate.",
  },
];

export default function CalculusSolverPage() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const layer = LAYERS[activeLayer];
  const stage = TRAINING_STAGES[activeStage];

  return (
    <PageWrap>
      <SectionTitle sub="A Python + JavaScript ML system that learns to solve calculus by predicting which SLaNg operations to apply, verified by slangmath.">
        CalculusSolver — ML System
      </SectionTitle>

      {/* Model architecture */}
      <SectionTitle sub="Click each component to explore.">
        Model Architecture (4 Components)
      </SectionTitle>
      <Grid cols={2} gap={16} style={{ marginBottom: 32 }}>
        {/* Left: selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LAYERS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(i)}
              style={{
                textAlign: "left",
                padding: "12px 16px",
                border: `1px solid ${i === activeLayer ? l.color + "50" : "#1E293B"}`,
                borderLeft: `3px solid ${i === activeLayer ? l.color : "transparent"}`,
                background: i === activeLayer ? l.color + "0D" : "#0D1117",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: i === activeLayer ? l.color : "#94A3B8",
                    }}
                  >
                    {l.label}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
                    {l.sub}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Full loss equation */}
          <Card style={{ marginTop: 8, padding: "14px 16px" }}>
            <div
              style={{
                fontSize: 10,
                color: "#475569",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              COMBINED TRAINING LOSS
            </div>
            <Code style={{ fontSize: 10.5 }}>{`Loss =
  decoder_ce   × 1.0   // main output
+ rule_head_ce × 1.0   // which rule?
+ step_tracer  × 0.5   // descriptions`}</Code>
          </Card>
        </div>

        {/* Right: detail panel */}
        <Card accent={layer.color + "40"}>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: layer.color,
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {layer.sub}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#F1F5F9",
                marginBottom: 6,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span>{layer.icon}</span> {layer.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: "#94A3B8",
                lineHeight: 1.65,
              }}
            >
              {layer.desc}
            </p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                color: "#475569",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              KEY DETAILS
            </div>
            {layer.detail.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "1px solid #0F172A",
                  fontSize: 12,
                  color: "#94A3B8",
                }}
              >
                <span style={{ color: layer.color }}>▸</span> {d}
              </div>
            ))}
          </div>
          <Code>{layer.code}</Code>
        </Card>
      </Grid>

      <Divider />

      {/* Training stages */}
      <SectionTitle sub="Three sequential stages — each checkpoint is the starting point for the next.">
        Training Pipeline
      </SectionTitle>
      <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
        {TRAINING_STAGES.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setActiveStage(i)}
              style={{
                padding: "10px 18px",
                border: "none",
                background: i === activeStage ? s.color + "20" : "transparent",
                borderBottom:
                  i === activeStage
                    ? `2px solid ${s.color}`
                    : "2px solid transparent",
                color: i === activeStage ? s.color : "#475569",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Stage {s.n}: {s.label}
            </button>
            {i < 2 && <span style={{ color: "#1E293B", fontSize: 16 }}>→</span>}
          </div>
        ))}
      </div>
      <Card accent={stage.color + "40"} style={{ marginBottom: 32 }}>
        <Grid cols={2} gap={20}>
          <div>
            <div
              style={{
                fontSize: 11,
                color: stage.color,
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {stage.script}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              Stage {stage.n}: {stage.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#94A3B8",
                lineHeight: 1.65,
              }}
            >
              {stage.desc}
            </p>
          </div>
          <Code>{stage.config}</Code>
        </Grid>
      </Card>

      <Divider />

      {/* Data pipeline */}
      <SectionTitle sub="5M+ training pairs, all verified by slangmath before use.">
        Data Pipeline
      </SectionTitle>
      <Grid cols={1} gap={10}>
        {DATA_SOURCES.map((d) => (
          <div
            key={d.name}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              background: "#0D1117",
              border: "1px solid #1E293B",
              borderLeft: `3px solid ${d.color}`,
              borderRadius: 8,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                minWidth: 110,
                fontSize: 14,
                fontWeight: 700,
                color: d.color,
              }}
            >
              {d.pairs}
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#F1F5F9",
                  fontWeight: 600,
                  marginBottom: 3,
                }}
              >
                {d.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{d.desc}</div>
            </div>
          </div>
        ))}
      </Grid>

      <Divider />

      {/* Inference */}
      <SectionTitle sub="Browser-ready JS class + FastAPI backend.">
        Inference Stack
      </SectionTitle>
      <Grid cols={2} gap={16}>
        <Card>
          <div
            style={{
              fontSize: 11,
              color: "#06B6D4",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            JS CLIENT (inference/CalculusSolver.js)
          </div>
          <Code>{`const cs = new CalculusSolver({
  endpoint: "http://localhost:8000"
});

const result = await cs.solve({
  op:   "diff",
  var:  "x",
  expr: createFraction([...])
});

// result.expr  → solved SLaNg tree
// result.steps → human-readable trace
// verified by slangmath post-decode`}</Code>
        </Card>
        <Card>
          <div
            style={{
              fontSize: 11,
              color: "#A855F7",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            FASTAPI BACKEND (api/app.py)
          </div>
          <Code>{`# Start server
uvicorn api.app:app \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --workers 4

# Endpoints:
# POST /solve     → run model
# POST /validate  → slangmath verify

# Beam search (beam_search.py):
# - Width N candidates
# - SLaNg validity mask at every step
# - verifier.js checks final answer`}</Code>
        </Card>
      </Grid>

      <Divider />

      {/* Evaluation */}
      <SectionTitle sub="Three benchmark sets, all measured by numerical equivalence.">
        Evaluation
      </SectionTitle>
      <Grid cols={3} gap={12}>
        {[
          {
            name: "AP Calculus AB/BC",
            file: "ap_calculus.json",
            color: "#6366F1",
            note: "Standard US high-school calculus problems",
          },
          {
            name: "MIT 18.01 / 18.02",
            file: "mit_ocw.json",
            color: "#A855F7",
            note: "Single + multivariable university calculus",
          },
          {
            name: "Multivariable",
            file: "multivariable.json",
            color: "#06B6D4",
            note: "Gradient, Lagrange, surface integrals",
          },
        ].map((b) => (
          <Card key={b.name} accent={b.color + "30"}>
            <div
              style={{
                fontSize: 11,
                color: b.color,
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {b.file}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#F1F5F9",
                marginBottom: 6,
              }}
            >
              {b.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
              {b.note}
            </div>
            <Code style={{ fontSize: 10.5 }}>{`evaluateFraction(
  result.expr,
  problem.answer,
  { testPoints: 50 }
)
// correct if all 50 match`}</Code>
          </Card>
        ))}
      </Grid>
    </PageWrap>
  );
}
