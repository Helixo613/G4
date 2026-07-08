# Attention Is All You Need — Presentation Simulation

Interactive presentation site for the paper *"Attention Is All You Need"* (Vaswani et al., NeurIPS 2017). Replaces a PPT: 5 full-screen slides, arrow-key navigation, live simulations of self-attention, multi-head attention, positional encoding, and the encoder/decoder architecture.

Runs fully offline — no backend, no API keys, no network calls at runtime.

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`)

## Run it locally

```bash
git clone https://github.com/Helixo613/G4.git
cd G4
git checkout presentation-site   # if the site isn't on main yet

cd presentation/site
npm install
npm run dev
```

Open the URL it prints (e.g. `http://localhost:5173`).

## Other commands

Run from `presentation/site/`:

- `npm run build` — production build to `dist/` (for hosting)
- `npm run test` — validates the attention-weight data (softmax rows sum to 1, facts correct)

## Presenting

- **Arrow keys** (`\u2192` / `\u2190`) or **PageUp/PageDown** — move between slides
- **1–5** — jump to a slide directly
- **F** — toggle full-screen presenter mode
- On-screen prev/next buttons also work

The full presenter script (what each of the 4 people says, click-by-click) is in [`presentation/SCRIPT.md`](presentation/SCRIPT.md).

## Project layout

```
presentation/
  SCRIPT.md          presenter script + cue sheet
  site/              the actual React + Vite app
    src/
      components/    one file per slide + shared pieces
      sim/           particle field + easing/motion math
      hooks/         useRaf, useCountUp
      data/          hardcoded (toy) attention weights, real PE formula
    tests/           data validation script
```
