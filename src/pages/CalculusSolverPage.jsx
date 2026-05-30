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

const LAYERS = [
  {
    id: 0,
    icon: "⟨⟩",
    label: "Tokenizer",
    color: "#22D3EE",
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
    color: "#C084FC",
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
    desc: "An 8-layer autoregressive Transformer decoder that generates the output SLaNg token sequence one token at a time. At each step it attends to (1) its own previous tokens, (2) the full encoder output via cross-attention, (3) Rule Head predictions injected as prefix embeddings. The SLaNg validity mask sets logits to -inf for any token that would violate SLaNg grammar — making syntactically invalid expressions impossible at the token level.",
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
    color: "#7C6FFF",
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
    color: "#C084FC",
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
    color: "#7C6FFF",
    desc: "38% rejection rate from latex_to_slang.js parse failures.",
  },
  {
    name: "MIT 18.01 (Single Variable)",
    pairs: "120K / 180K",
    color: "#C084FC",
    desc: "33% rejection rate.",
  },
  {
    name: "MIT 18.02 (Multivariable)",
    pairs: "200K / 280K",
    color: "#22D3EE",
    desc: "29% rejection rate.",
  },
  {
    name: "Taylor Series Expansion",
    pairs: "80K / 110K",
    color: "#F59E0B",
    desc: "27% rejection rate.",
  },
];

const CONTRIBUTOR_CONCEPTS = [
  {
    title: "SLaNg Expression Trees",
    color: "#22D3EE",
    body: "Inputs and outputs are JSON trees, not LaTeX strings. Learn terms, fractions, variables, operation envelopes, and how slangmath evaluates an expression.",
  },
  {
    title: "Tokenizer + Vocabulary",
    color: "#7C6FFF",
    body: "The model sees token IDs from tokenizer/vocab.json. New operations must be added to the vocabulary and serialized consistently.",
  },
  {
    title: "Training Pairs",
    color: "#10B981",
    body: "Every sample is input tree, solved output tree, rule labels, and optional step trace. Bad or unverifiable samples should be rejected before training.",
  },
  {
    title: "Checkpoint Flow",
    color: "#F59E0B",
    body: "Stage 1 writes checkpoints/pretrain/best.pt, Stage 2 writes checkpoints/sft/best.pt, Stage 3 writes checkpoints/final/best.pt for deployment.",
  },
  {
    title: "Verifier-First Accuracy",
    color: "#C084FC",
    body: "Accuracy is numerical equivalence over random points with evaluateFraction, plus step-rule accuracy for the reasoning trace.",
  },
  {
    title: "FastAPI + Streamlit",
    color: "#EF4444",
    body: "FastAPI serves /solve for programmatic clients. Streamlit loads the same checkpoint via streamlit_app.py and shows a web UI. If no checkpoint exists it falls back to the built-in polynomial solver until a trained model is deployed.",
  },
];

const GPU_COMMANDS = `# 1. Create environment
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install

# 2. Generate or refresh SLaNg training data
node data_pipeline/generate_slang_data.js --count 50000 --out data/slang_dataset.jsonl
node data_pipeline/split_data.js

# 3. Stage 1: grammar pretraining
python training/pretrain.py \\
  --config training/config/pretrain.yaml \\
  --data data/splits/train \\
  --output checkpoints/pretrain

# 4. Stage 2: supervised fine-tuning
python training/finetune.py \\
  --checkpoint checkpoints/pretrain/best.pt \\
  --config training/config/finetune.yaml \\
  --data data/splits/train \\
  --output checkpoints/sft

# 5. Stage 3: verifier-loop hard examples
python training/verifier_loop.py \\
  --checkpoint checkpoints/sft/best.pt \\
  --hard_example_ratio 0.4 \\
  --output checkpoints/final`;

const ACCURACY_COMMANDS = `# Run the local evaluation script against the installed dataset
python eval/evaluate_model.py --num_samples 100

# Start Streamlit for manual model testing
streamlit run streamlit_app.py

# Fast smoke test of the deployed API
uvicorn api.app:app --host 0.0.0.0 --port 8000 --workers 1`;

export default function CalculusSolverPage() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const layer = LAYERS[activeLayer];
  const stage = TRAINING_STAGES[activeStage];

  return (
    <PageWrap>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <EyebrowLabel color="#7C6FFF">ML SYSTEM DEEP DIVE</EyebrowLabel>
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
              background: "linear-gradient(90deg, #7C6FFF, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CalculusSolver
          </span>{" "}
          ML System
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#3D4D6A",
            lineHeight: 1.75,
            maxWidth: 600,
            fontFamily: "var(--font-sans)",
          }}
        >
          A Python + JavaScript ML system that learns to solve calculus by
          predicting which SLaNg operations to apply — verified by slangmath at
          every step.
        </p>
      </div>

      {/* ── Quick stats ───────────────────────────────────────────────── */}
      <Grid cols={4} gap={12} style={{ marginBottom: 48 }}>
        <StatBadge value="5" label="Components" color="#7C6FFF" />
        <StatBadge value="512" label="Hidden dim" color="#22D3EE" />
        <StatBadge value="3" label="Training stages" color="#C084FC" />
        <StatBadge value="5M+" label="Training pairs" color="#F59E0B" />
      </Grid>

      {/* ── Model architecture ────────────────────────────────────────── */}
      <SectionTitle sub="Click each component to explore its architecture and code.">
        Model Architecture — 5 Components
      </SectionTitle>

      <Grid cols={2} gap={16} style={{ marginBottom: 40 }}>
        {/* Left: component selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {LAYERS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(i)}
              style={{
                textAlign: "left",
                padding: "13px 16px",
                border: `1px solid ${i === activeLayer ? l.color + "40" : "#1C2438"}`,
                borderLeft: `3px solid ${i === activeLayer ? l.color : "transparent"}`,
                background: i === activeLayer ? l.color + "0C" : "transparent",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (i !== activeLayer) {
                  e.currentTarget.style.background = "#ffffff05";
                  e.currentTarget.style.borderLeftColor = l.color + "30";
                }
              }}
              onMouseLeave={(e) => {
                if (i !== activeLayer) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderLeftColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{l.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: i === activeLayer ? l.color : "#8B97B8",
                      transition: "color 0.15s",
                      marginBottom: 2,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {l.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#3D4D6A",
                      lineHeight: 1.4,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {l.sub}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Combined loss display */}
          <Card style={{ marginTop: 8, padding: "14px 16px" }}>
            <EyebrowLabel color="#3D4D6A">Combined Training Loss</EyebrowLabel>
            <Code style={{ fontSize: 10.5 }}>{`Loss =
  decoder_ce   × 1.0   // main output
+ rule_head_ce × 1.0   // which rule?
+ step_tracer  × 0.5   // descriptions`}</Code>
          </Card>
        </div>

        {/* Right: detail panel */}
        <Card accent={layer.color + "30"} glow>
          <div style={{ marginBottom: 16 }}>
            <EyebrowLabel color={layer.color}>{layer.sub}</EyebrowLabel>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#EFF3FF",
                marginBottom: 10,
                display: "flex",
                gap: 10,
                alignItems: "center",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span>{layer.icon}</span> {layer.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#8B97B8",
                lineHeight: 1.75,
              }}
            >
              {layer.desc}
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <EyebrowLabel color="#3D4D6A">Key Details</EyebrowLabel>
            {layer.detail.map((d, i) => (
              <ListItem key={i} color={layer.color}>
                {d}
              </ListItem>
            ))}
          </div>
          <Code>{layer.code}</Code>
        </Card>
      </Grid>

      <Divider />

      {/* ── Training pipeline ─────────────────────────────────────────── */}
      <SectionTitle sub="Three sequential stages — each checkpoint is the starting point for the next.">
        Training Pipeline
      </SectionTitle>

      {/* Stage tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 18,
          overflowX: "auto",
          background: "#0B0E1A",
          border: "1px solid #1C2438",
          borderRadius: 10,
          padding: 6,
        }}
      >
        {TRAINING_STAGES.map((s, i) => (
          <button
            key={s.n}
            onClick={() => setActiveStage(i)}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              borderRadius: 7,
              background: i === activeStage ? s.color + "16" : "transparent",
              color: i === activeStage ? s.color : "#3D4D6A",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: i === activeStage ? 600 : 400,
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              fontFamily: "var(--font-sans)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (i !== activeStage) e.currentTarget.style.color = "#8B97B8";
            }}
            onMouseLeave={(e) => {
              if (i !== activeStage) e.currentTarget.style.color = "#3D4D6A";
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: i === activeStage ? s.color + "28" : "#1C2438",
                border: `1px solid ${i === activeStage ? s.color + "60" : "#1C2438"}`,
                fontSize: 9,
                fontWeight: 700,
                lineHeight: "18px",
                textAlign: "center",
                marginRight: 7,
                color: i === activeStage ? s.color : "#3D4D6A",
                verticalAlign: "middle",
              }}
            >
              {s.n}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <Card accent={stage.color + "30"} glow style={{ marginBottom: 40 }}>
        <Grid cols={2} gap={24}>
          <div>
            <EyebrowLabel color={stage.color}>{stage.script}</EyebrowLabel>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#EFF3FF",
                marginBottom: 12,
                fontFamily: "var(--font-sans)",
              }}
            >
              Stage {stage.n}: {stage.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#8B97B8",
                lineHeight: 1.8,
              }}
            >
              {stage.desc}
            </p>
          </div>
          <Code>{stage.config}</Code>
        </Grid>
      </Card>

      <Divider />

      {/* ── Data pipeline ─────────────────────────────────────────────── */}
      <SectionTitle sub="5M+ training pairs, all verified by slangmath before use.">
        Data Pipeline
      </SectionTitle>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 40,
        }}
      >
        {DATA_SOURCES.map((d) => (
          <div
            key={d.name}
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              background: "transparent",
              border: "1px solid #1C2438",
              borderLeft: `3px solid ${d.color}`,
              borderRadius: 8,
              padding: "14px 20px",
              transition: "background 0.15s, border-color 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffffff04";
              e.currentTarget.style.borderColor = "#222D42";
              e.currentTarget.style.borderLeftColor = d.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#1C2438";
              e.currentTarget.style.borderLeftColor = d.color;
            }}
          >
            <div
              style={{
                minWidth: 130,
                fontSize: 16,
                fontWeight: 800,
                color: d.color,
                flexShrink: 0,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-sans)",
              }}
            >
              {d.pairs}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#EFF3FF",
                  fontWeight: 600,
                  marginBottom: 3,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {d.name}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "#3D4D6A",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {d.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* ── Inference Stack ───────────────────────────────────────────── */}
      <SectionTitle sub="Browser-ready JS class + FastAPI backend.">
        Inference Stack
      </SectionTitle>

      <Grid cols={2} gap={16} style={{ marginBottom: 40 }}>
        <Card glow>
          <EyebrowLabel color="#22D3EE">
            JS Client — inference/CalculusSolver.js
          </EyebrowLabel>
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
        <Card glow>
          <EyebrowLabel color="#C084FC">
            FastAPI Backend — api/app.py
          </EyebrowLabel>
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

      {/* ── Contributor guide ─────────────────────────────────────────── */}
      <SectionTitle sub="The concepts a new contributor should understand before changing data, model code, or training scripts.">
        Contributor Starting Map
      </SectionTitle>

      <Grid cols={3} gap={12} style={{ marginBottom: 40 }}>
        {CONTRIBUTOR_CONCEPTS.map((item) => (
          <Card key={item.title} accent={item.color + "28"} glow>
            <EyebrowLabel color={item.color}>Required Concept</EyebrowLabel>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#EFF3FF",
                marginBottom: 8,
                fontFamily: "var(--font-sans)",
              }}
            >
              {item.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#8B97B8",
                lineHeight: 1.7,
              }}
            >
              {item.body}
            </p>
          </Card>
        ))}
      </Grid>

      <Grid cols={2} gap={16} style={{ marginBottom: 40 }}>
        <Card glow accent="#10B98128">
          <EyebrowLabel color="#10B981">How To Contribute</EyebrowLabel>
          <ListItem color="#10B981">
            Add or fix SLaNg math functions first, then generate verified
            training pairs from those functions.
          </ListItem>
          <ListItem color="#10B981">
            Add new operation tokens, rule labels, and serializer support before
            expecting the model to learn a new operation.
          </ListItem>
          <ListItem color="#10B981">
            Keep training data auditable: each sample should include the input
            envelope, expected output tree, operation, rule target, and step
            targets when available.
          </ListItem>
          <ListItem color="#10B981">
            Run numerical equivalence and step accuracy before promoting a
            checkpoint to checkpoints/final/best.pt.
          </ListItem>
        </Card>
        <Card glow accent="#F59E0B28">
          <EyebrowLabel color="#F59E0B">GPU Training Checklist</EyebrowLabel>
          <ListItem color="#F59E0B">
            Use an NVIDIA GPU with CUDA PyTorch installed; start with 12GB VRAM
            for small experiments and 24GB+ for larger batches.
          </ListItem>
          <ListItem color="#F59E0B">
            Tune batch size, gradient accumulation, fp16, and max sequence
            length before changing model architecture.
          </ListItem>
          <ListItem color="#F59E0B">
            Save every stage under checkpoints/ so Streamlit and FastAPI can
            discover the newest compatible best.pt automatically.
          </ListItem>
          <ListItem color="#F59E0B">
            Upload checkpoints/final/best.pt with the app deployment; otherwise
            Streamlit stays in fallback mode.
          </ListItem>
        </Card>
      </Grid>

      <Divider />

      {/* ── Practical training + deployment ───────────────────────────── */}
      <SectionTitle sub="End-to-end commands for a contributor training on GPU and then deploying the resulting checkpoint.">
        Train, Deploy, And Test
      </SectionTitle>

      <Grid cols={2} gap={16} style={{ marginBottom: 40 }}>
        <Card glow accent="#7C6FFF28">
          <EyebrowLabel color="#7C6FFF">GPU Training Commands</EyebrowLabel>
          <Code>{GPU_COMMANDS}</Code>
        </Card>
        <Card glow accent="#22D3EE28">
          <EyebrowLabel color="#22D3EE">Streamlit Deployment Flow</EyebrowLabel>
          <Code>{`# Streamlit Cloud main file
streamlit_app.py

# Required deployed artifact
checkpoints/final/best.pt

# Runtime behavior
# - If final/best.pt exists: load neural model
# - If missing: show fallback polynomial solver
# - /solve API uses the same checkpoint search order

# Run locally
streamlit run streamlit_app.py

# Checkpoint lookup order
MODEL_PATH
checkpoints/final/best.pt
checkpoints/sft/best.pt
checkpoints/pretrain/best.pt`}</Code>
        </Card>
      </Grid>

      <Card glow accent="#C084FC28" style={{ marginBottom: 40 }}>
        <Grid cols={2} gap={24}>
          <div>
            <EyebrowLabel color="#C084FC">Accuracy Testing</EyebrowLabel>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                color: "#8B97B8",
                lineHeight: 1.75,
              }}
            >
              A checkpoint is promoted only after it passes numerical
              equivalence and step trace checks. Numerical equivalence compares
              the model output to slangmath over random points; step accuracy
              checks whether each generated rule label matches ground truth.
            </p>
            <ListItem color="#C084FC">
              Overall equivalence rate: solved problems divided by attempted
              problems.
            </ListItem>
            <ListItem color="#C084FC">
              Model accuracy is validated numerically by comparing output to
              slangmath over random points in each sample.
            </ListItem>
            <ListItem color="#C084FC">
              Per-operation rate: diff, integrate, limit, gradient, hessian,
              lagrange, tangent_plane, and dir_deriv reported separately.
            </ListItem>
            <ListItem color="#C084FC">
              Per-rule accuracy: power_rule, chain_rule, product_rule,
              quotient_rule, and operation-specific rules.
            </ListItem>
            <ListItem color="#C084FC">
              Streamlit shows the same checkpoint used by FastAPI, so local UI
              testing reflects deployed behavior.
            </ListItem>
          </div>
          <Code>{ACCURACY_COMMANDS}</Code>
        </Grid>
      </Card>

      <Divider />

      {/* ── Evaluation ────────────────────────────────────────────────── */}
      <SectionTitle sub="Three benchmark sets, all measured by numerical equivalence.">
        Evaluation
      </SectionTitle>

      <Grid cols={3} gap={12}>
        {[
          {
            name: "AP Calculus AB/BC",
            file: "ap_calculus.json",
            color: "#7C6FFF",
            note: "Standard US high-school calculus problems",
          },
          {
            name: "MIT 18.01 / 18.02",
            file: "mit_ocw.json",
            color: "#C084FC",
            note: "Single + multivariable university calculus",
          },
          {
            name: "Multivariable",
            file: "multivariable.json",
            color: "#22D3EE",
            note: "Gradient, Lagrange, surface integrals",
          },
        ].map((b) => (
          <Card key={b.name} accent={b.color + "28"} glow>
            <EyebrowLabel color={b.color}>{b.file}</EyebrowLabel>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#EFF3FF",
                marginBottom: 6,
                fontFamily: "var(--font-sans)",
              }}
            >
              {b.name}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "#3D4D6A",
                marginBottom: 14,
                fontFamily: "var(--font-sans)",
              }}
            >
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
