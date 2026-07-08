import { useState } from "react";
import { resultFacts } from "../data/attention.js";
import { useCountUp } from "../hooks/useCountUp.js";
import { AmbientField } from "./AmbientField.jsx";
import { SlideHeader } from "./SlideHeader.jsx";

const TIMELINE_ITEMS = [
  "2017 Transformer",
  "2018 BERT",
  "2018\u20132020 GPT-1/2/3",
  "2020 ViT",
  "2021 AlphaFold",
  "2022 ChatGPT",
  "today GPT / Gemini / Claude / Llama \u2014 all Transformers",
];

export function ResultsSlide() {
  const [step, setStep] = useState(0);
  return (
    <section className="slide">
      <div className="slide-ambient">
        <AmbientField density={44} color="255, 189, 89" speed={0.45} />
      </div>
      <div className="slide-content">
        <SlideHeader eyebrow="P4 · Results & Legacy" title="Better scores, lower cost, bigger era." />
        <div className="results-actions">
          <button className="pill-btn" onClick={() => setStep((s) => Math.max(s, 1))}>Show results</button>
          <button className="pill-btn" onClick={() => setStep((s) => Math.max(s, 2))}>Training cost</button>
          <button className="pill-btn" onClick={() => setStep((s) => Math.max(s, 3))}>Legacy timeline</button>
        </div>
        <div className="results-grid">
          {step >= 1 && <BleuChart />}
          {step >= 2 && <TrainingCost />}
        </div>
        {step >= 3 && <Timeline />}
      </div>
    </section>
  );
}

function BleuChart() {
  const bars = [
    ["EN\u2192DE ByteNet", resultFacts.enDe.byteNet],
    ["EN\u2192DE ConvS2S", resultFacts.enDe.convS2S],
    ["EN\u2192DE GNMT+RL", resultFacts.enDe.gnmtRl],
    ["EN\u2192DE Transformer (big)", resultFacts.enDe.transformerBig, true],
    ["EN\u2192FR ConvS2S ensemble", resultFacts.enFr.convS2SEnsemble],
    ["EN\u2192FR Transformer (big)", resultFacts.enFr.transformerBig, true],
  ];
  return (
    <div className="panel glass-panel appear">
      <h3>BLEU scores</h3>
      {bars.map(([label, value, hot]) => <ResultBar key={label} label={label} value={value} hot={hot} />)}
    </div>
  );
}

function ResultBar({ label, value, hot }) {
  const shown = useCountUp(value, true, 900);
  return (
    <div className={`result-bar ${hot ? "winner" : ""}`}>
      <span>{label}</span>
      <i style={{ width: `${(value / 42) * 100}%` }} />
      <b>{shown.toFixed(1)}</b>
    </div>
  );
}

function TrainingCost() {
  return (
    <div className="panel glass-panel appear">
      <h3>Training cost</h3>
      <table>
        <tbody>
          <tr><td>Transformer (base)</td><td>12 hours / 8&times; P100</td></tr>
          <tr><td>Transformer (big)</td><td>3.5 days / 8&times; P100</td></tr>
          <tr><td>Prior SOTA models</td><td>orders of magnitude more FLOPs</td></tr>
        </tbody>
      </table>
      <p className="callout">fraction of the cost</p>
    </div>
  );
}

function Timeline() {
  return (
    <div className="timeline-track appear">
      <div className="timeline-line"><i /></div>
      <div className="timeline-items">
        {TIMELINE_ITEMS.map((item, index) => (
          <span key={item} style={{ "--i": index }}>{item}</span>
        ))}
      </div>
      <p className="closing-line">Attention really was all you need.</p>
    </div>
  );
}
