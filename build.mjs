import fs from 'node:fs';
import path from 'node:path';

const stripImports = (code) => code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');

const conv = stripImports(fs.readFileSync('src/conversions.js', 'utf8')).replace(/export function /g, 'function ').replace(/export /g, '');
const cont = stripImports(fs.readFileSync('src/contrast.js', 'utf8')).replace(/export function /g, 'function ').replace(/export /g, '');
const met = stripImports(fs.readFileSync('src/colorMetrics.js', 'utf8')).replace(/export function /g, 'function ').replace(/export /g, '');
const opt = stripImports(fs.readFileSync('src/optimisation.js', 'utf8')).replace(/export function /g, 'function ').replace(/export /g, '');
const idx = stripImports(fs.readFileSync('src/index.js', 'utf8'))
  .replace(/export class /g, 'class ')
  .replace(/export function /g, 'function ')
  .replace(/export const /g, 'const ')
  .replace(/export default [^;]+;/, '')
  .replace(/export \{[\s\S]*?\};/, '');

const banner = `/*!
 * cm-colors v1.0.0 (JS/TS Port)
 * Accessible Color Science Library
 * Authored by Lalitha A R (https://isrl.in/)
 * Licensed under GPL-3.0
 */
`;

const coreBody = [conv, cont, met, opt, idx].join('\n\n');

// 1. ESM bundle
const esmBundle = `${banner}
${coreBody}

export {
  Color,
  ColorPair,
  makeReadable,
  make_readable,
  getContrast,
  getWcagLevel,
  deltaE,
  calculateContrastRatio,
  calculateRelativeLuminance,
  calculateDeltaE2000,
  checkAndFixContrast,
  parseColor,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  rgbToLab,
  rgbToXyz,
  xyzToLab,
  calculateHueAngle,
  srgbToLinear,
  linearToSrgb
};

export default {
  Color,
  ColorPair,
  makeReadable,
  make_readable,
  getContrast,
  getWcagLevel,
  deltaE,
  calculateContrastRatio,
  calculateDeltaE2000,
  parseColor,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb
};
`;

// 2. CommonJS bundle
const cjsBundle = `${banner}
${coreBody}

module.exports = {
  Color,
  ColorPair,
  makeReadable,
  make_readable,
  getContrast,
  getWcagLevel,
  deltaE,
  calculateContrastRatio,
  calculateRelativeLuminance,
  calculateDeltaE2000,
  checkAndFixContrast,
  parseColor,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  rgbToLab,
  rgbToXyz,
  xyzToLab,
  calculateHueAngle,
  srgbToLinear,
  linearToSrgb
};
module.exports.default = module.exports;
`;

// 3. Browser IIFE Global
const iifeBundle = `${banner}
(function (global) {
  'use strict';
${coreBody}

  const CMColors = {
    Color,
    ColorPair,
    makeReadable,
    make_readable,
    getContrast,
    getWcagLevel,
    deltaE,
    calculateContrastRatio,
    calculateRelativeLuminance,
    calculateDeltaE2000,
    checkAndFixContrast,
    parseColor,
    hexToRgb,
    rgbToHex,
    rgbToOklch,
    oklchToRgb
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CMColors;
  } else {
    global.CMColors = CMColors;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.js', esmBundle, 'utf8');
fs.writeFileSync('dist/index.cjs', cjsBundle, 'utf8');
fs.writeFileSync('dist/cm-colors.global.js', iifeBundle, 'utf8');
fs.copyFileSync('index.d.ts', 'dist/index.d.ts');

console.log('Build complete! Created dist/index.js (ESM), dist/index.cjs (CJS), and dist/cm-colors.global.js (IIFE).');
