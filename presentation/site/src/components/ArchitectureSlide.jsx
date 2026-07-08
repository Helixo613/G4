import { useState } from "react";
import { architectureHeads, slide3Tokens } from "../data/attention.js";
import { useRaf } from "../hooks/useRaf.js";
import { cycle, lerp } from "../sim/motion.js";
import { AmbientField } from "./AmbientField.jsx";
import { AttentionArcs, TokenRow } from "./AttentionViz.jsx";
import { SlideHeader } from "./SlideHeader.jsx";

const TABS = ["Attention Heads", "Positional Encoding", "Full Architecture"];

export function ArchitectureSlide() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <section className="slide">
      <div className="slide-ambient">
        <AmbientField density={30} color="156, 139, 255" speed={0.4} />
      </div>
      <div className="slide-content">
        <SlideHeader eyebrow="P3 · Architecture Explorer" title="Attention becomes a stack." />
        <div className="tabs">
          {TABS.map((item) => (
            <button key={item} className={`pill-btn tab-btn ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        {tab === "Attention Heads" && <HeadsPanel />}
        {tab === "Positional Encoding" && <PositionalEncoding />}
        {tab === "Full Architecture" && <ArchitecturePanel />}
      </div>
    </section>
  );
}

function HeadsPanel() {
  const [head, setHead] = useState("Head 1");
  const headData = architectureHeads[head];
  return (
    <div className="panel glass-panel">
      <div className="head-buttons">
        {Object.keys(architectureHeads).map((name) => (
          <button key={name} className={`pill-btn ${head === name ? "active" : ""}`} onClick={() => setHead(name)}>
            {name}
          </button>
        ))}
      </div>
      <p className="callout">{head}: {headData.label}</p>
      <TokenRow tokens={slide3Tokens} focus={headData.focusIndex} />
      <AttentionArcs weights={headData.weights[headData.focusIndex]} focus={headData.focusIndex} tokens={slide3Tokens} />
    </div>
  );
}

function PositionalEncoding() {
  const positions = Array.from({ length: 31 }, (_, position) => position);
  const dims = Array.from({ length: 32 }, (_, dim) => dim);
  const encode = (position, dim) => {
    const denominator = 10000 ** ((2 * Math.floor(dim / 2)) / 32);
    return dim % 2 === 0 ? Math.sin(position / denominator) : Math.cos(position / denominator);
  };
  const waves = [
    { dim: 0, color: "var(--blue)" },
    { dim: 2, color: "var(--mint)" },
    { dim: 8, color: "var(--violet)" },
    { dim: 18, color: "var(--amber)" },
  ];
  return (
    <div className="pe-grid">
      <div className="pe-heatmap" style={{ "--cols": positions.length }}>
        {dims.flatMap((dim) => positions.map((position) => (
          <span key={`${position}-${dim}`} style={{ background: colorScale(encode(position, dim)) }} />
        )))}
      </div>
      <svg className="waves" viewBox="0 0 760 300">
        {waves.map(({ dim, color }, index) => (
          <path
            key={dim}
            style={{ stroke: color, animationDelay: `${index * 90}ms` }}
            d={positions.map((position, i) => `${i ? "L" : "M"}${20 + position * 24},${150 - encode(position, dim) * (42 + index * 8)}`).join(" ")}
          />
        ))}
      </svg>
      <p className="caption">each position gets a unique smooth barcode; no order info otherwise</p>
    </div>
  );
}

function colorScale(value) {
  const hue = value > 0 ? 168 : 25;
  const light = 18 + Math.abs(value) * 48;
  return `hsl(${hue} 90% ${light}%)`;
}

const BLOCK_TEXT = {
  "Multi-head attention": "Several attention heads learn different relationship patterns in parallel.",
  "Add & norm": "Residual connections plus normalization keep deep stacks trainable.",
  "Feed-forward": "A small per-token network transforms each representation after attention.",
  "Masked self-attention": "The decoder can only attend to tokens already generated.",
  "Cross-attention": "Decoder tokens attend back to the encoder representation.",
};

const BLOCKS = [
  ["Encoder \u00d76", 70, 30, 300, 56, ""],
  ["Multi-head attention", 95, 115, 250, 62, "Multi-head attention"],
  ["Add & norm", 95, 190, 250, 50, "Add & norm"],
  ["Feed-forward", 95, 255, 250, 62, "Feed-forward"],
  ["Add & norm", 95, 330, 250, 50, "Add & norm"],
  ["Decoder \u00d76", 480, 30, 320, 56, ""],
  ["Masked self-attention", 510, 105, 260, 58, "Masked self-attention"],
  ["Cross-attention", 510, 180, 260, 58, "Cross-attention"],
  ["Feed-forward", 510, 255, 260, 58, "Feed-forward"],
  ["Add & norm", 510, 330, 260, 50, "Add & norm"],
];

function ArchitecturePanel() {
  const [hovered, setHovered] = useState("Multi-head attention");
  const [masked, setMasked] = useState(false);
  return (
    <div className="arch-grid">
      <ArchitectureDiagram hovered={hovered} setHovered={setHovered} />
      <div className="tooltip-panel glass-panel">
        <h3>{hovered}</h3>
        <p>{BLOCK_TEXT[hovered]}</p>
        <button className={`pill-btn ${masked ? "active" : ""}`} onClick={() => setMasked(!masked)}>Mask</button>
        <MaskMatrix masked={masked} />
      </div>
    </div>
  );
}

function ArchitectureDiagram({ hovered, setHovered }) {
  return (
    <svg className="arch" viewBox="0 0 880 430">
      <path className="flow" d="M370 210 L500 210" />
      <FlowPacket />
      {BLOCKS.map(([label, x, y, w, h, key], index) => (
        <g key={`${label}-${index}`} onMouseEnter={() => key && setHovered(key)} className={hovered === key ? "hot" : ""}>
          <rect x={x} y={y} width={w} height={h} rx="8" />
          <text x={x + w / 2} y={y + h / 2 + 8}>{label}</text>
        </g>
      ))}
    </svg>
  );
}

function FlowPacket() {
  const [elapsed, setElapsed] = useState(0);
  useRaf(true, setElapsed);
  const t = cycle(elapsed, 1400);
  const x = lerp(370, 500, t);
  return <circle className="flow-packet" cx={x} cy={210} r={5} />;
}

function MaskMatrix({ masked }) {
  return (
    <div className="mask-matrix">
      {Array.from({ length: 25 }, (_, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        return <span key={index} className={masked && col > row ? "masked" : ""} />;
      })}
      <p className={`mask-note ${masked ? "show" : ""}`}>can't peek ahead</p>
    </div>
  );
}
