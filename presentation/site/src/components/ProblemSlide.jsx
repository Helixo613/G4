import { useState } from "react";
import { useRaf } from "../hooks/useRaf.js";
import { arcControl, clamp, quadPath } from "../sim/motion.js";
import { AmbientField } from "./AmbientField.jsx";
import { SlideHeader } from "./SlideHeader.jsx";

const TOKENS = ["The", "student", "solved", "the", "hard", "problem", "because", "she", "remembered", "context"];
const STEP_MS = 380;

export function ProblemSlide() {
  const [mode, setMode] = useState(null);
  const [runId, setRunId] = useState(0);

  const play = (next) => {
    setMode(next);
    setRunId((id) => id + 1);
  };

  return (
    <section className="slide">
      <div className="slide-ambient">
        <AmbientField density={26} color="95, 184, 255" speed={0.5} />
      </div>
      <div className="slide-content">
        <SlideHeader eyebrow="P1 · The Problem" title="RNNs read in single file. Transformers read the room." />
        <div className="comparison">
          <div className="panel glass-panel">
            <div className="panel-head">
              <h3>Recurrent model</h3>
              <button className="pill-btn" onClick={() => play("rnn")}>Play RNN</button>
            </div>
            {mode === "rnn" ? <RnnRun key={runId} /> : <RnnIdle />}
            <div className="pain-row">
              <span>sequential — no parallelism</span>
              <span>long-range info fades</span>
            </div>
          </div>
          <div className="panel glass-panel">
            <div className="panel-head">
              <h3>Transformer</h3>
              <button className="pill-btn" onClick={() => play("transformer")}>Play Transformer</button>
            </div>
            {mode === "transformer" ? <TransformerRun key={runId} /> : <TransformerIdle />}
            <p className="callout">every token attends to every token — in parallel</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TokenStrip({ mode, litCount = 0 }) {
  return (
    <div className={`tokens ${mode}`}>
      {TOKENS.map((token, index) => (
        <span key={`${token}-${index}`} className={index < litCount ? "lit" : ""}>{token}</span>
      ))}
    </div>
  );
}

function RnnIdle() {
  return (
    <>
      <TokenStrip mode="dim" />
      <div className="memory-orb-track" />
    </>
  );
}

function RnnRun() {
  const duration = TOKENS.length * STEP_MS + 500;
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useRaf(!done, (t) => {
    if (t >= duration) {
      setElapsed(duration);
      setDone(true);
    } else {
      setElapsed(t);
    }
  });

  const lit = Math.min(TOKENS.length, Math.floor(elapsed / STEP_MS) + 1);
  const progress = clamp(elapsed / duration, 0, 1);

  return (
    <>
      <TokenStrip mode="sequential" litCount={lit} />
      <div className="memory-orb-track">
        <div
          className="memory-orb"
          style={{
            left: `${progress * 90}%`,
            transform: `scale(${1 - progress * 0.6})`,
            filter: `saturate(${1 - progress * 0.85})`,
          }}
        >
          mem
        </div>
      </div>
    </>
  );
}

function TransformerIdle() {
  return (
    <>
      <TokenStrip mode="dim" />
      <svg className="pair-arcs" viewBox="0 0 1000 210" />
    </>
  );
}

function TransformerRun() {
  return (
    <>
      <TokenStrip mode="burst" litCount={TOKENS.length} />
      <PairArcs />
    </>
  );
}

function PairArcs() {
  const n = TOKENS.length;
  const step = 1000 / (n - 1);
  const baseline = 168;
  const pairs = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) pairs.push([i, j]);
  }
  return (
    <svg className="pair-arcs active" viewBox="0 0 1000 210">
      {pairs.map(([i, j]) => {
        const bow = 16 + Math.abs(j - i) * 5;
        const { cx, cy } = arcControl(i * step, j * step, baseline, bow);
        return (
          <path
            key={`${i}-${j}`}
            d={quadPath(i * step, baseline, cx, cy, j * step, baseline)}
            style={{ strokeWidth: 1.2, opacity: 0.24, animationDelay: `${(i * 7 + j) * 30}ms` }}
          />
        );
      })}
    </svg>
  );
}
