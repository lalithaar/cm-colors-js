import { makeReadable, getContrast, getWcagLevel, deltaE, ColorPair } from './dist/index.js';

console.log('Running cm-colors test suite...\n');

const testCases = [
  { fg: '#777777', bg: '#ffffff', expectedTuned: '#757575', name: 'Gray on White' },
  { fg: '#3b82f6', bg: '#ffffff', expectedTuned: '#2b72e5', name: 'Blue on White' },
  { fg: '#e11d48', bg: '#000000', expectedTuned: '#e3214a', name: 'Crimson on Black' },
  { fg: '#6366f1', bg: '#121212', expectedTuned: '#686cf7', name: 'Indigo on Dark' },
  { fg: '#facc15', bg: '#ffffff', expectedTuned: '#957100', name: 'Yellow on White' }
];

let passed = 0;
for (const tc of testCases) {
  const result = makeReadable(tc.fg, tc.bg);
  const match = result.color.toLowerCase() === tc.expectedTuned.toLowerCase();
  console.log(`[${match ? 'PASS' : 'FAIL'}] ${tc.name}:`);
  console.log(`  Initial: ${tc.fg} on ${tc.bg} (Contrast: ${getContrast(tc.fg, tc.bg)} -> ${getWcagLevel(tc.fg, tc.bg)})`);
  console.log(`  Tuned:   ${result.color} (Contrast: ${result.finalContrast} -> ${result.wcagLevel}, DeltaE: ${result.deltaE})`);
  if (match) passed++;
}

console.log(`\nTests passed: ${passed}/${testCases.length}`);
if (passed !== testCases.length) {
  process.exit(1);
}
