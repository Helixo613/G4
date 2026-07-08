// Thin wrapper around transformers.js so React components never touch the
// tokenizer/model objects directly. Model is fetched from the HF CDN lazily
// (only when runAttention() is first called) and memoized after that.
const MODEL_ID = "dbernsohn/all-MiniLM-L6-v2-onnx";
const NUM_LAYERS = 6;

let loadingPromise = null;

export function loadModel(onProgress) {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const { AutoTokenizer, AutoModel, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      if (onProgress) env.backends.onnx.wasm.proxy = false;

      const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
        progress_callback: onProgress,
      });
      const model = await AutoModel.from_pretrained(MODEL_ID, {
        output_attentions: true,
        dtype: "fp32",
        progress_callback: onProgress,
      });
      return { tokenizer, model };
    })();
  }
  return loadingPromise;
}

/**
 * Runs the real MiniLM encoder on `text` and returns tokens plus attention
 * weights for every layer, reshaped into plain nested arrays so the existing
 * AttentionArcs / Heatmap components (which expect number[][] per layer) can
 * render them unmodified.
 *
 * @returns {Promise<{ tokens: string[], attentions: number[][][][] }>}
 *   attentions[layer][head][row][col]
 */
export async function runAttention(text, onProgress) {
  const { tokenizer, model } = await loadModel(onProgress);

  const inputs = await tokenizer(text);
  const out = await model(inputs);

  // decode() per single id gives clean wordpieces ("didn", "'", "t") without
  // the "##" continuation marker or the space-joining decode() would do for
  // a full sequence -- exactly the per-token labels the arcs/heatmap need.
  // [CLS]/[SEP] are kept since the arcs are more honest with them visible.
  const ids = Array.from(inputs.input_ids.data).map(Number);
  const tokens = ids.map((id) => tokenizer.decode([id]));

  const attentions = [];
  for (let layer = 0; layer < NUM_LAYERS; layer += 1) {
    const tensor = out[`attentions.${layer}`];
    const [, heads, seq] = tensor.dims;
    const data = tensor.data;
    const layerMatrix = [];
    for (let h = 0; h < heads; h += 1) {
      const headMatrix = [];
      const headOffset = h * seq * seq;
      for (let r = 0; r < seq; r += 1) {
        const row = [];
        const rowOffset = headOffset + r * seq;
        for (let c = 0; c < seq; c += 1) row.push(Number(data[rowOffset + c]));
        headMatrix.push(row);
      }
      layerMatrix.push(headMatrix);
    }
    attentions.push(layerMatrix);
  }

  return { tokens, attentions };
}

/** Averages attention across all heads for a given layer -> number[][]. */
export function averageHeads(layerMatrix) {
  const heads = layerMatrix.length;
  const seq = layerMatrix[0].length;
  const avg = Array.from({ length: seq }, () => new Array(seq).fill(0));
  for (const head of layerMatrix) {
    for (let r = 0; r < seq; r += 1) {
      for (let c = 0; c < seq; c += 1) avg[r][c] += head[r][c] / heads;
    }
  }
  return avg;
}
