import assert from "node:assert/strict";
import {
  slide3Tokens,
  slide3Variants,
  architectureHeads,
  resultFacts,
  authors,
} from "../src/data/attention.js";

function validRows(matrix, label) {
  matrix.forEach((row, index) => {
    const sum = row.reduce((total, value) => total + value, 0);
    assert.ok(row.every((value) => value >= 0), `${label} row ${index} has a negative weight`);
    assert.ok(Math.abs(sum - 1) < 0.001, `${label} row ${index} sums to ${sum}`);
  });
}

validRows(slide3Variants.tired.weights, "slide3 tired");
validRows(slide3Variants.wide.weights, "slide3 wide");
Object.entries(architectureHeads).forEach(([name, head]) => validRows(head.weights, name));

const itIndex = slide3Tokens.indexOf("it");
const animalIndex = slide3Tokens.indexOf("animal");
const streetIndex = slide3Tokens.indexOf("street");

assert.equal(authors.length, 8);
assert.ok(slide3Variants.tired.weights[itIndex][animalIndex] > 0.4);
assert.ok(slide3Variants.wide.weights[itIndex][streetIndex] > 0.4);
assert.equal(resultFacts.enDe.transformerBig, 28.4);
assert.equal(resultFacts.enFr.transformerBig, 41.8);
assert.equal(resultFacts.training.big, "3.5 days / 8x P100");
assert.equal(resultFacts.training.base, "~12 hours / 8x P100");
