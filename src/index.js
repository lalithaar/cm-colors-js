/**
 * CM-Colors JS
 * Accessible Color Science Library ported from the Python cm-colors toolkit.
 * Automatically fix colors to be readable with minimal visual change using OKLCH and CIEDE2000.
 *
 * Authored by Lalitha A R (https://isrl.in/)
 * Licensed under GPL-3.0
 */

import {
  parseColor,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  rgbToLab,
  calculateHueAngle,
  srgbToLinear,
  linearToSrgb
} from "./conversions.js";
import {
  calculateContrastRatio,
  calculateRelativeLuminance,
  getContrastLevel,
  getWcagLevel
} from "./contrast.js";
import { calculateDeltaE2000 } from "./colorMetrics.js";
import { checkAndFixContrast } from "./optimisation.js";

export class Color {
  constructor(input) {
    this.raw = input;
    try {
      this.rgb = parseColor(input);
      this.isValid = true;
      this.error = null;
    } catch (err) {
      this.rgb = null;
      this.isValid = false;
      this.error = err.message;
    }
  }

  get hex() {
    return this.isValid ? rgbToHex(this.rgb) : null;
  }

  get luminance() {
    return this.isValid ? calculateRelativeLuminance(this.rgb) : null;
  }

  get oklch() {
    return this.isValid ? rgbToOklch(this.rgb) : null;
  }

  get lab() {
    return this.isValid ? rgbToLab(this.rgb) : null;
  }
}

export class ColorPair {
  constructor(text, bg, large = false) {
    this.text = new Color(text);
    this.bg = new Color(bg);
    this.large = large;
  }

  get isValid() {
    return this.text.isValid && this.bg.isValid;
  }

  get contrast() {
    if (!this.isValid) return null;
    return calculateContrastRatio(this.text.rgb, this.bg.rgb);
  }

  get wcagLevel() {
    if (!this.isValid) return "FAIL";
    return getWcagLevel(this.text.rgb, this.bg.rgb, this.large);
  }

  get isReadable() {
    const level = this.wcagLevel;
    if (level === "AAA") return "very readable";
    if (level === "AA") return "readable";
    return "not readable";
  }

  makeReadable(options = {}) {
    if (!this.isValid) {
      throw new Error(`Invalid color pair: text=${this.text.error}, bg=${this.bg.error}`);
    }
    const mode = options.mode !== undefined ? options.mode : 1;
    const veryReadable = options.veryReadable || false;
    const opt = {
      large: this.large,
      mode: mode,
      premium: veryReadable
    };
    const res = checkAndFixContrast(this.text.raw, this.bg.raw, opt);
    return [res.tunedColor, res.success];
  }

  make_readable(options = {}) {
    return this.makeReadable(options);
  }
}

export const make_readable = makeReadable;

export function makeReadable(textColor, bgColor, options = {}) {
  const pair = new ColorPair(textColor, bgColor, options.large || false);
  const result = checkAndFixContrast(textColor, bgColor, options);
  return {
    color: result.tunedColor,
    tunedRgb: result.tunedRgb,
    success: result.success,
    originalContrast: Number(result.originalContrast.toFixed(2)),
    finalContrast: Number(result.finalContrast.toFixed(2)),
    deltaE: Number(result.deltaE.toFixed(2)),
    wcagLevel: result.wcagLevel,
    isReadable: result.wcagLevel !== "FAIL"
  };
}

export function getContrast(textColor, bgColor) {
  const textRgb = parseColor(textColor);
  const bgRgb = parseColor(bgColor);
  return Number(calculateContrastRatio(textRgb, bgRgb).toFixed(2));
}

export function deltaE(color1, color2) {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  return Number(calculateDeltaE2000(rgb1, rgb2).toFixed(2));
}

export {
  parseColor,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  rgbToLab,
  calculateHueAngle,
  calculateRelativeLuminance,
  calculateContrastRatio,
  getContrastLevel,
  getWcagLevel,
  calculateDeltaE2000,
  checkAndFixContrast
};

export default {
  Color,
  ColorPair,
  makeReadable,
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
