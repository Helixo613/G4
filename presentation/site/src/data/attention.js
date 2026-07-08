// Illustrative toy values for teaching. These are not real Transformer model weights.
export const authors = [
  "Ashish Vaswani",
  "Noam Shazeer",
  "Niki Parmar",
  "Jakob Uszkoreit",
  "Llion Jones",
  "Aidan N. Gomez",
  "Łukasz Kaiser",
  "Illia Polosukhin",
];

export const slide3Tokens = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"];
export const wideTokens = slide3Tokens.with(10, "wide");

const makeRow = (length, weights) => {
  const row = Array(length).fill(0.02);
  Object.entries(weights).forEach(([index, value]) => {
    row[Number(index)] = value;
  });
  const sum = row.reduce((total, value) => total + value, 0);
  return row.map((value) => Number((value / sum).toFixed(4)));
};

const makeMatrix = (length, rows) =>
  Array.from({ length }, (_, index) => makeRow(length, rows[index] ?? { [index]: 0.64, [Math.max(0, index - 1)]: 0.14, [Math.min(length - 1, index + 1)]: 0.14 }));

export const slide3Variants = {
  tired: {
    finalWord: "tired",
    weights: makeMatrix(11, {
      7: { 1: 0.58, 5: 0.08, 6: 0.1, 7: 0.12, 10: 0.08 },
      10: { 1: 0.42, 7: 0.18, 8: 0.16, 9: 0.12, 10: 0.08 },
    }),
    q: [0.7, -0.2, 0.6, 0.1],
    keys: [
      [0.1, 0.2, 0.0, 0.1],
      [0.9, -0.1, 0.7, 0.0],
      [-0.1, 0.5, 0.2, 0.2],
      [0.0, 0.4, 0.5, -0.1],
      [0.1, 0.1, 0.0, 0.2],
      [0.4, 0.2, 0.2, 0.6],
      [0.3, 0.0, 0.4, 0.1],
      [0.6, -0.1, 0.4, 0.0],
      [0.2, 0.1, 0.3, 0.1],
      [0.0, 0.2, 0.2, 0.3],
      [0.5, -0.2, 0.8, 0.2],
    ],
  },
  wide: {
    finalWord: "wide",
    weights: makeMatrix(11, {
      7: { 5: 0.6, 1: 0.07, 6: 0.1, 7: 0.11, 10: 0.08 },
      10: { 5: 0.48, 7: 0.16, 8: 0.14, 9: 0.12, 10: 0.06 },
    }),
    q: [0.2, 0.3, 0.4, 0.7],
    keys: [
      [0.1, 0.2, 0.0, 0.1],
      [0.4, -0.1, 0.3, 0.1],
      [-0.1, 0.5, 0.2, 0.2],
      [0.0, 0.4, 0.5, -0.1],
      [0.1, 0.1, 0.0, 0.2],
      [0.5, 0.2, 0.4, 0.9],
      [0.3, 0.0, 0.4, 0.1],
      [0.3, 0.1, 0.4, 0.4],
      [0.2, 0.1, 0.3, 0.1],
      [0.0, 0.2, 0.2, 0.3],
      [0.4, 0.2, 0.5, 0.8],
    ],
  },
};

export const architectureHeads = {
  "Head 1": {
    label: "coreference",
    focusIndex: 7,
    weights: makeMatrix(11, { 7: { 1: 0.62, 5: 0.07, 6: 0.08, 7: 0.13, 10: 0.06 } }),
  },
  "Head 2": {
    label: "local syntax",
    focusIndex: 3,
    weights: makeMatrix(11, { 3: { 2: 0.3, 3: 0.18, 4: 0.24, 5: 0.17, 1: 0.07 } }),
  },
  "Head 3": {
    label: "verb frame",
    focusIndex: 10,
    weights: makeMatrix(11, { 10: { 3: 0.3, 7: 0.2, 8: 0.18, 9: 0.14, 1: 0.1 } }),
  },
  "Head 4": {
    label: "sentence anchor",
    focusIndex: 6,
    weights: makeMatrix(11, { 6: { 0: 0.24, 1: 0.22, 3: 0.18, 5: 0.17, 6: 0.09 } }),
  },
};

export const resultFacts = {
  enDe: {
    byteNet: 23.75,
    convS2S: 25.16,
    gnmtRl: 24.6,
    transformerBig: 28.4,
  },
  enFr: {
    convS2SEnsemble: 41.16,
    transformerBig: 41.8,
  },
  training: {
    base: "~12 hours / 8x P100",
    big: "3.5 days / 8x P100",
  },
};
