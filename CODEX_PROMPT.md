# Prompt for Codex — paste everything below this line

---

Build an interactive presentation website for the paper **"Attention Is All You Need"** (Vaswani et al., NeurIPS 2017). It replaces a PowerPoint entirely: 4 presenters will drive it live in front of a class of peers with mixed ML familiarity. It combines slides with live simulations of the paper's core mechanisms.

A presenter script already exists at `presentation/SCRIPT.md`. **Read it first.** Every `[CLICK: ...]` cue in that script is a hard requirement — the site must have exactly those interactions, with those names, on those slides. The cue sheet table at the bottom of the script is your acceptance checklist.

## Workflow discipline (per AGENTS.md — follow it)

- Think before coding. Smallest clean implementation; no unnecessary abstractions; no speculative features beyond this spec.
- Use the **frontend-design skill** before building UI — this must look like a designed product, not a Bootstrap demo. If the **refero MCP** is available, pull real presentation/data-viz app patterns for reference first.
- Prefix noisy shell commands (install, build, dev server, lint) with **`rtk`** if available.
- Before claiming done, apply **verification-before-completion**: actually run the build, actually load the page, actually exercise every interaction in the cue sheet. Never claim a check passed without running it.
- No new dependencies without justification. Target: React + Vite and nothing else (no chart libs, no animation libs — SVG/CSS/`requestAnimationFrame` are enough; d3 is NOT justified for this scope).
- Do not commit or push anything.
- Final summary in Caveman format: **Changed / Validated / Issues / Next**.

## Tech constraints

- **Location:** `presentation/site/` (Vite project root).
- **Stack:** Vite + React, plain CSS or CSS modules. No backend, no network calls at runtime, no real ML model — all attention weights are small hardcoded toy matrices in a data file. Must work fully **offline** (presentation-room WiFi cannot be trusted).
- `npm run dev` must serve it; `npm run build` must produce a static bundle that works when served from disk.
- Target display: 1920x1080 projector, dark theme (rooms are bright, dark slides project better). Text must be readable from the back of a room — minimum ~24px body on slides, large headings.

## Navigation model (like a PPT)

- 5 full-screen slides. **→ / ← arrow keys** (and PageDown/PageUp, for clickers) move between slides. On-screen prev/next buttons too.
- Persistent footer: thin progress bar (slide position), slide number "N / 5", and the current presenter tag ("P1"…"P4").
- Slide transitions: quick and clean (~200ms fade/slide). Never block on animation.
- Number keys 1–5 jump directly to a slide (recovery if a presenter gets lost).

## Slide-by-slide spec

### Slide 1 — Title & Authors (presenter P1)

- Paper title large, "Vaswani et al. — Google Brain / Google Research — NeurIPS 2017".
- 8 author name chips: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin. A small footnote badge: "Equal contribution — author order randomized."
- Subtle ambient background animation of attention arcs (slow, low-contrast, must not distract).

### Slide 2 — The Problem (presenter P1)

Side-by-side comparison panel, sentence of ~10 tokens shown in both halves.

- **Button "Play RNN"**: left half animates tokens lighting up strictly one at a time (~350ms apart), a "memory" bubble above visibly fading/compressing as it moves right (later tokens: earlier tokens' color drains). Label the two pains: "sequential — no parallelism" and "long-range info fades".
- **Button "Play Transformer"**: right half lights ALL tokens simultaneously and draws arcs between all pairs in one burst. Label: "every token attends to every token — in parallel".
- Both replayable any number of times.

### Slide 3 — Self-Attention Simulator (presenter P2) — the centerpiece, spend the most effort here

Sentence displayed as clickable token pills: **"The animal didn't cross the street because it was too tired"**.

- **Click any token** → it becomes the focus: SVG arcs drawn from it to every other token, arc thickness + opacity proportional to attention weight; simultaneously a highlighted row appears in a small attention heatmap below (full matrix, focus row emphasized). Weights are hardcoded toy data but must be *plausible*: with "tired", the row for "it" puts dominant weight on "animal".
- **Toggle "tired / wide"**: swaps the last word between "tired" and "wide" and swaps to a second hardcoded weight matrix where "it" attends dominantly to "street". If "it" is the selected token, arcs must visibly re-render on toggle — this is the wow moment of the talk.
- **Toggle "Show the math"**: expands a panel showing, for the selected token: its Q vector, all K vectors, the raw dot-product scores as bars, the softmax percentages as bars, and the formula `Attention(Q,K,V) = softmax(QKᵀ/√d_k)V` rendered nicely (Unicode/CSS is fine; KaTeX not needed). Use tiny toy vectors (4-dim) so numbers fit on screen.
- Default state on slide entry: "it" pre-selected, "tired" active, math hidden.

### Slide 4 — Architecture Explorer (presenter P3)

Tabbed panel, three tabs, in this order:

1. **Tab "Attention Heads"** (default): same sentence as slide 3 with arcs, plus a **head selector (Head 1 … Head 4)**. Head 1 = coreference pattern (pronouns→nouns), Head 2 = local/adjacent-syntax pattern (each token→neighbors). Heads 3–4 can be plausible variations (e.g. attend-to-verb, attend-to-punctuation/first-token). Distinct hardcoded matrices per head; switching heads animates the arcs.
2. **Tab "Positional Encoding"**: visualization of sinusoidal encodings — a heatmap of position (x, 0–30) vs encoding dimension (y, ~32 dims) using actual sin/cos values `sin(pos/10000^(2i/d))`, plus 3–4 overlaid sine waves of different frequencies. One-line caption: "each position gets a unique smooth barcode; no order info otherwise".
3. **Tab "Full Architecture"**: clean SVG diagram of the encoder (left, "×6" stack: multi-head attention → add & norm → feed-forward → add & norm) and decoder (right: masked self-attention → cross-attention from encoder → feed-forward). Hovering a block highlights it and shows a one-sentence tooltip. **Toggle "Mask"**: in a small decoder self-attention mini-matrix, the upper triangle (future positions) grays out with a "can't peek ahead" label.

### Slide 5 — Results & Legacy (presenter P4)

Three sequential reveals, each triggered by its own button (P4 clicks them in order):

1. **Button "Show results"**: animated horizontal bar chart, BLEU scores — EN→DE: ByteNet 23.75, ConvS2S 25.16, GNMT+RL 24.6, **Transformer (big) 28.4** highlighted; EN→FR: **Transformer (big) 41.8** highlighted vs prior ~41.16 (ConvS2S ensemble). Bars animate to width on click.
2. **Button "Training cost"**: compact table — Transformer (base): 12 hours / 8× P100; Transformer (big): 3.5 days / 8× P100; prior SOTA models: order(s) of magnitude more FLOPs. Highlight the "fraction of the cost" takeaway.
3. **Button "Legacy timeline"**: horizontal timeline animating left→right: 2017 Transformer → 2018 BERT → 2018–2020 GPT-1/2/3 → 2020 ViT → 2021 AlphaFold → 2022 ChatGPT → today "GPT / Gemini / Claude / Llama — all Transformers".

Closing line rendered after timeline completes: "Attention really was all you need."

## Data & correctness notes

- Put all hardcoded matrices/vectors in one file, e.g. `src/data/attention.ts`, with a comment stating they are illustrative toy values, not real model weights.
- Every attention weight row must be a valid softmax output (non-negative, sums to 1).
- Positional-encoding tab must use the real formula, computed at runtime — this one is NOT toy data.
- Facts that must appear exactly: BLEU 28.4 (EN-DE) and 41.8 (EN-FR); 8 authors as listed; NeurIPS 2017; 3.5 days / 8 GPUs (big), ~12 hours (base).

## Acceptance checklist (verify each before reporting done)

1. `npm run build` succeeds; `npm run dev` serves the site.
2. Arrow keys, PageUp/Down, number keys 1–5, and on-screen buttons all navigate.
3. Slide 2: both play buttons animate and are replayable.
4. Slide 3: clicking each of the 11 tokens re-renders arcs + heatmap row; tired/wide toggle flips "it"'s attention target between animal/street; math panel shows scores → softmax → formula.
5. Slide 4: all four heads switch patterns; PE tab renders real sinusoids; architecture tab hover-highlights; mask toggle grays the upper triangle.
6. Slide 5: three reveals fire in order and animate; all numbers match the facts above.
7. Every `[CLICK]` cue in `presentation/SCRIPT.md`'s cue sheet is possible with an obviously-labeled control.
8. Readable at 1920×1080; no layout overflow on any slide.

Report the final summary in Caveman format: Changed / Validated / Issues / Next.
