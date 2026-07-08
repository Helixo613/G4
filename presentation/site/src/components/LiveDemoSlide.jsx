import { useRef, useState } from "react";
import { averageHeads, runAttention } from "../lib/model.js";
import { AmbientField } from "./AmbientField.jsx";
import { AttentionArcs, Heatmap, TokenRow } from "./AttentionViz.jsx";
import { SlideHeader } from "./SlideHeader.jsx";

const DEFAULT_TEXT = "The animal didn't cross the street because it was too tired";
const NUM_LAYERS = 6;
const NUM_HEADS = 12;

export function LiveDemoSlide() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [status, setStatus] = useState("idle"); // idle | loading | running | ready | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [tokens, setTokens] = useState([]);
  const [attentions, setAttentions] = useState(null);
  const [layer, setLayer] = useState(3);
  const [head, setHead] = useState("avg");
  const [focus, setFocus] = useState(1);
  const modelReady = useRef(false);

  async function handleRun() {
    if (!text.trim() || status === "loading" || status === "running") return;
    setErrorMsg("");
    setStatus(modelReady.current ? "running" : "loading");
    setProgress(0);
    try {
      const result = await runAttention(text, (data) => {
        if (data.status === "progress" && data.file && data.file.endsWith(".onnx")) {
          setProgress(Math.round(data.progress));
        }
      });
      modelReady.current = true;
      setTokens(result.tokens);
      setAttentions(result.attentions);
      setFocus(Math.min(1, result.tokens.length - 1));
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || String(err));
    }
  }

  const busy = status === "loading" || status === "running";
  const matrix = attentions && (head === "avg" ? averageHeads(attentions[layer]) : attentions[layer][head]);

  return (
    <section className="slide live-slide">
      <div className="slide-ambient">
        <AmbientField density={26} color="255, 189, 89" speed={0.35} />
      </div>
      <div className="slide-content">
        <SlideHeader eyebrow="Bonus · Live Model Demo" title="This isn't a simulation anymore — it's the real network." />

        <div className="live-input-row">
          <input
            className="live-text-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleRun()}
            placeholder="Type any sentence…"
            maxLength={160}
          />
          <button className="pill-btn active" onClick={handleRun} disabled={busy}>
            {busy ? "Running\u2026" : "Run real model"}
          </button>
        </div>
        <p className="caption live-caption">
          {"Runs a real 6-layer MiniLM (BERT-family) encoder live in your browser via transformers.js — the exact softmax-over-QK\u1D40 mechanism from the paper, on whatever sentence you type."}
        </p>

        {status === "loading" && (
          <div className="live-status glass-panel">
            <div className="spinner" />
            <p>{"Downloading model, one-time (\u224891MB)\u2026 "}{progress > 0 ? `${progress}%` : ""}</p>
          </div>
        )}

        {status === "error" && (
          <div className="live-status live-error glass-panel">
            <p>Couldn't load the model: {errorMsg}</p>
            <p className="caption">Needs internet to fetch it the first time. The toy slides still work offline.</p>
          </div>
        )}

        {status === "ready" && matrix && (
          <div className="sim-grid live-grid">
            <div className="stage glass-panel">
              <TokenRow tokens={tokens} focus={focus} onFocus={setFocus} />
              <AttentionArcs weights={matrix[focus]} focus={focus} tokens={tokens} />
              <div className="control-row stage-controls live-controls">
                <div className="layer-buttons">
                  {Array.from({ length: NUM_LAYERS }, (_, index) => (
                    <button
                      key={index}
                      className={`pill-btn ${layer === index ? "active" : ""}`}
                      onClick={() => setLayer(index)}
                    >
                      L{index + 1}
                    </button>
                  ))}
                </div>
                <select className="head-select" value={head} onChange={(event) => {
                  const value = event.target.value;
                  setHead(value === "avg" ? "avg" : Number(value));
                }}>
                  <option value="avg">avg heads</option>
                  {Array.from({ length: NUM_HEADS }, (_, index) => (
                    <option key={index} value={index}>Head {index + 1}</option>
                  ))}
                </select>
              </div>
              <p className="caption live-real-note">{"These are REAL learned weights — not our toy matrices."}</p>
            </div>
            <Heatmap matrix={matrix} focus={focus} tokens={tokens} />
          </div>
        )}
      </div>
    </section>
  );
}
