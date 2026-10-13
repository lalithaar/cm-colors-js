import {
  Color,
  ColorPair,
  makeReadableBulk,
  make_readable_bulk,
  makeReadable,
  make_readable,
  calculateContrastRatio,
  getWcagLevel,
  calculateDeltaE2000,
  hexToRgb,
  rgbToHex,
  CSS_NAMED_COLORS
} from "./dist/index.js";

console.log("=== CM-Colors JS Comprehensive Test Suite ===");
let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("\n1. Ground Truth Color Fixes (matching Python bit-for-bit):");
const groundTruth = [
  { fg: "#777777", bg: "#ffffff", expected: "#757575" },
  { fg: "#3b82f6", bg: "#ffffff", expected: "#2b72e5" },
  { fg: "#e11d48", bg: "#000000", expected: "#e3214a" },
  { fg: "#6366f1", bg: "#121212", expected: "#686cf7" },
  { fg: "#facc15", bg: "#ffffff", expected: "#957100" }
];

for (const tc of groundTruth) {
  const pair = new ColorPair(tc.fg, tc.bg);
  const [fixed, success] = pair.makeReadable();
  assert(
    fixed.toLowerCase() === tc.expected.toLowerCase() && success === true,
    `${tc.fg} on ${tc.bg} -> ${fixed} (expected: ${tc.expected})`
  );
}

console.log("\n2. Format Preservation (matching Python):");
{
  // Hex
  const [hexFixed] = new ColorPair("#777777", "#ffffff").make_readable();
  assert(hexFixed === "#757575", `Hex preservation: got ${hexFixed}`);

  // RGB string
  const [rgbStrFixed] = new ColorPair("rgb(119, 119, 119)", "rgb(255, 255, 255)").make_readable();
  assert(rgbStrFixed === "rgb(117, 117, 117)", `RGB string preservation: got ${rgbStrFixed}`);

  // RGB tuple
  const [rgbTupleFixed] = new ColorPair([119, 119, 119], [255, 255, 255]).make_readable();
  assert(
    Array.isArray(rgbTupleFixed) &&
      rgbTupleFixed[0] === 117 &&
      rgbTupleFixed[1] === 117 &&
      rgbTupleFixed[2] === 117,
    `RGB tuple preservation: got [${rgbTupleFixed}]`
  );

  // Named color (returns hex)
  const [namedFixed] = new ColorPair("gray", "white").make_readable();
  assert(namedFixed === "#767676", `Named color handling: got ${namedFixed}`);
}

console.log("\n3. Bulk API parity (make_readable_bulk):");
{
  const bulkInput = [["#777", "#fff"], ["#000", "#000"]];
  const bulkResults = make_readable_bulk(bulkInput);
  assert(bulkResults.length === 2, `Bulk returned 2 results: got ${bulkResults.length}`);
  assert(
    bulkResults[0][0] === "#757575" && bulkResults[0][1] === "readable",
    `Pair 1: ${bulkResults[0][0]} status: ${bulkResults[0][1]}`
  );
  assert(
    bulkResults[1][0] === "#5f5f5f" && bulkResults[1][1] === "not readable",
    `Pair 2: ${bulkResults[1][0]} status: ${bulkResults[1][1]}`
  );
}

console.log("\n4. Alpha / RGBA compositing:");
{
  // 50% black on white = rgb(128, 128, 128)
  const semiTransparent = new Color("rgba(0, 0, 0, 0.5)", new Color("#ffffff"));
  assert(
    semiTransparent.rgb[0] === 128 && semiTransparent.rgb[1] === 128 && semiTransparent.rgb[2] === 128,
    `RGBA alpha compositing: got ${semiTransparent.rgb}`
  );
}

console.log("\n5. Named Colors Dictionary:");
{
  assert(Object.keys(CSS_NAMED_COLORS).length === 148, `148 CSS named colors: got ${Object.keys(CSS_NAMED_COLORS).length}`);
  assert(CSS_NAMED_COLORS["aliceblue"] === "#f0f8ff", `aliceblue = #f0f8ff`);
  assert(CSS_NAMED_COLORS["rebeccapurple"] === "#663399", `rebeccapurple = #663399`);
}

console.log("\n6. Contrast calculations:");
{
  const ratio = calculateContrastRatio([255, 255, 255], [0, 0, 0]);
  assert(Math.abs(ratio - 21.0) < 0.01, `Black on white ratio: 21:1 (got ${ratio.toFixed(2)})`);
  const level = getWcagLevel([255, 255, 255], [0, 0, 0]);
  assert(level === "AAA", `Black on white level: AAA (got ${level})`);
}

console.log("\n7. CIEDE2000:");
{
  const dE = calculateDeltaE2000([255, 0, 0], [255, 0, 0]);
  assert(dE === 0.0, `Same color deltaE: 0.0 (got ${dE})`);
  const dEDiff = calculateDeltaE2000([255, 0, 0], [0, 255, 0]);
  assert(dEDiff > 50, `Red vs Green deltaE > 50 (got ${dEDiff.toFixed(2)})`);
}

console.log("\n8. Color and ColorPair properties:");
{
  const pair = new ColorPair("#000000", "#ffffff");
  assert(pair.is_readable === "Very Readable", `pair.is_readable: Very Readable`);
  assert(pair.isReadable === "Very Readable", `pair.isReadable: Very Readable`);
  assert(pair.is_valid === true, `pair.is_valid: true`);
  assert(pair.isValid === true, `pair.isValid: true`);
  assert(pair.errors.length === 0, `pair.errors: empty`);
}

console.log(`\n========================================`);
console.log(`Summary: ${passed}/${total} assertions passed.`);
if (passed !== total) {
  process.exit(1);
}
console.log("All tests passed with 100% parity!\n");
