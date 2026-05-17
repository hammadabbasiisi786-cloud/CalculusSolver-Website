# CalculusSolver + SLaNg — Project Explorer

An interactive React app that visually explains both sister projects from **Quantum Logics**:
- **SLaNg** — the JavaScript math library (ground truth)
- **CalculusSolver** — the ML system built on top of SLaNg

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

## Pages

### ◈ Overview
Shows how both projects work together end-to-end: how a math expression flows from user input through SLaNg encoding → tokenization → ML model → SLaNg verification → output with steps. Includes the division of responsibility table.

### ∂ SLaNg Library
Deep dive into the JavaScript library:
- Data structures: Term, Fraction, Equation
- All 7 modules: slang-basic, slang-advanced, slang-extended, slang-convertor, slang-symbolic, slang-helpers, slang-stats/linalg
- Full capability map (single-variable, multivariable, applied/geometry)

### ⬡ CalculusSolver ML System
Deep dive into the ML system:
- 4-component model: Tokenizer → Tree Encoder → Rule Head → Tree Decoder → Step Tracer
- 3-stage training pipeline with configs
- Data pipeline: 5M synthetic + 440K real (AP Calculus, MIT OCW)
- Inference stack: JS class + FastAPI + beam search
- Evaluation benchmarks

## Build for Production

```bash
npm run build
npm run preview
```
