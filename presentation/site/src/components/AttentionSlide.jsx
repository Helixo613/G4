import { useState } from "react";
import { slide3Tokens, slide3Variants, wideTokens } from "../data/attention.js";
import { useCountUp } from "../hooks/useCountUp.js";
import { AmbientField } from "./AmbientField.jsx";
import { AttentionArcs, Heatmap, TokenRow } from "./AttentionViz.jsx";
import { SlideHeader } from "./SlideHeader.jsx";

export function AttentionSlide() {
  const [variant, setVariant] = useState("tired");
  const [focus, setFocus] = useState(7);
  const [showMath, setShowMath] = useState(false);
  const tokens = variant === "tired" ? slide3Tokens : wideTokens;
  const data = slide3Variants[variant];

  return (
    <section className="slide">
      <div className="slide-ambient">
        <AmbientField density={36} color="87, 240, 194" speed={0.45} />
      </div>
      <div className="slide-content">
        <SlideHeader eyebrow="P2 · Self-Attention Simulator" title="A word asks: who matters to me right now?" />
        <div className="sim-grid">
          <div className="stage glass-panel">
            <TokenRow tokens={tokens} focus={focus} onFocus={setFocus} />
            <AttentionArcs weights={data.weights[focus]} focus={focus} tokens={tokens} />
            <div className="control-row stage-controls">
              <button className="pill-btn" onClick={() => setVariant(variant === "tired" ? "wide" : "tired")}>
                {variant === "tired" ? "tired \u2192 wide" : "wide \u2192 tired"}
              </button>
              <button className={`pill-btn ${showMath ? "active" : ""}`} onClick={() => setShowMath(!showMath)}>
                Show the math
              </button>
            </div>
          </div>
          <Heatmap matrix={data.weights} focus={focus} tokens={tokens} />
        </div>
        {showMath && <MathPanel data={data} weights={data.weights[focus]} tokens={tokens} focus={focus} />}
      </div>
    </section>
  );
}

function MathPanel({ data, weights, tokens, focus }) {
  const scores = data.keys.map((key) => key.reduce((sum, value, index) => sum + value * data.q[index], 0));
  const max = Math.max(...scores.map(Math.abs), 1);
  return (
    <div className="math-panel">
      <div className="formula">{"Attention(Q,K,V) = softmax(QK\u1D40/\u221ad"}<sub>k</sub>{")V"}</div>
      <div className="math-columns">
        <VectorBlock title={`Q for "${tokens[focus]}"`} values={data.q} />
        <div>
          <h3>Dot-product scores</h3>
          {scores.map((score, i) => <ScoreBar key={i} label={tokens[i]} value={score} max={max} />)}
        </div>
        <div>
          <h3>Softmax percentages</h3>
          {weights.map((weight, i) => <PercentBar key={i} label={tokens[i]} weight={weight} />)}
        </div>
      </div>
      <details>
        <summary>All K vectors</summary>
        <div className="key-grid">
          {data.keys.map((key, i) => <VectorBlock key={i} title={tokens[i]} values={key} />)}
        </div>
      </details>
    </div>
  );
}

function VectorBlock({ title, values }) {
  return (
    <div className="vector">
      <h3>{title}</h3>
      <code>[{values.map((value) => value.toFixed(1)).join(", ")}]</code>
    </div>
  );
}

function ScoreBar({ label, value, max }) {
  const width = Math.max(4, Math.abs(value / max) * 100);
  return (
    <div className="bar-row">
      <span>{label}</span>
      <i style={{ width: `${width}%` }} />
      <b>{value.toFixed(2)}</b>
    </div>
  );
}

function PercentBar({ label, weight }) {
  const value = useCountUp(weight * 100, true, 700);
  return (
    <div className="bar-row">
      <span>{label}</span>
      <i style={{ width: `${Math.max(4, value)}%` }} />
      <b>{Math.round(value)}%</b>
    </div>
  );
}
