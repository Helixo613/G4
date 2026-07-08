import { quadPath } from "../sim/motion.js";

/** Clickable token row shared by the self-attention simulator and the
 * attention-heads tab. */
export function TokenRow({ tokens, focus, onFocus }) {
  return (
    <div className="token-buttons">
      {tokens.map((token, index) => (
        <button
          key={`${token}-${index}`}
          className={`token-pill ${focus === index ? "selected" : ""}`}
          onClick={onFocus ? () => onFocus(index) : undefined}
        >
          {token}
        </button>
      ))}
    </div>
  );
}

/** Arcs from the focused token to every other token, thickness + opacity
 * proportional to attention weight. Paths re-route with a CSS `d` transition
 * whenever the weights change (tired/wide toggle, head switch); a dashed
 * stroke keeps flowing continuously so the arcs never look static. */
export function AttentionArcs({ weights, focus, tokens, height = 230 }) {
  const n = tokens.length;
  const step = 1000 / (n - 1);
  const baseline = 26;
  return (
    <svg className="attention-arcs" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5fb8ff" />
          <stop offset="55%" stopColor="#57f0c2" />
          <stop offset="100%" stopColor="#9c8bff" />
        </linearGradient>
      </defs>
      {weights.map((weight, index) => {
        if (index === focus) return null;
        const x1 = focus * step;
        const x2 = index * step;
        const bow = 60 + Math.abs(index - focus) * 12;
        const cx = (x1 + x2) / 2;
        const cy = baseline + bow;
        return (
          <path
            key={index}
            d={quadPath(x1, baseline, cx, cy, x2, baseline)}
            style={{ strokeWidth: 2 + weight * 24, opacity: 0.2 + weight * 1.1 }}
          />
        );
      })}
      {weights.map((weight, index) => {
        if (index === focus) return null;
        return <circle key={`d-${index}`} className="arc-end" cx={index * step} cy={baseline} r={2.5 + weight * 6} />;
      })}
      <circle className="arc-source" cx={focus * step} cy={baseline} r="6" />
    </svg>
  );
}

export function Heatmap({ matrix, focus, tokens }) {
  return (
    <div className="heatmap-wrap glass-panel">
      <h3>Attention heatmap</h3>
      <div className="heatmap" style={{ "--n": tokens.length }}>
        {matrix.flatMap((row, r) =>
          row.map((value, c) => (
            <span
              key={`${r}-${c}`}
              className={r === focus ? "focus-row" : ""}
              title={`${tokens[r]} \u2192 ${tokens[c]}: ${Math.round(value * 100)}%`}
              style={{ opacity: 0.12 + value * 2.1 }}
            />
          )),
        )}
      </div>
      <p>Highlighted row: <b>{tokens[focus]}</b></p>
    </div>
  );
}
