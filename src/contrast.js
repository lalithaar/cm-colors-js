/**
 * CM-Colors JS - WCAG Contrast Calculations
 * Complete 100% parity with Python cm_colors.core.contrast.
 */

import { srgbToLinear } from "./conversions.js";
import { parseColorToRgb } from "./colorParser.js";

export function calculateRelativeLuminance(rgb) {
  const c = Array.isArray(rgb) ? rgb : parseColorToRgb(rgb);
  const [r, g, b] = [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0];
  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function calculateContrastRatio(textRgb, bgRgb) {
  const tRgb = Array.isArray(textRgb) ? textRgb : parseColorToRgb(textRgb);
  const bRgb = Array.isArray(bgRgb) ? bgRgb : parseColorToRgb(bgRgb);
  const textLuminance = calculateRelativeLuminance(tRgb);
  const bgLuminance = calculateRelativeLuminance(bRgb);

  const lighter = Math.max(textLuminance, bgLuminance);
  const darker = Math.min(textLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastLevel(contrastRatio, large = false) {
  if (large) {
    if (contrastRatio >= 4.5) return "AAA";
    if (contrastRatio >= 3.0) return "AA";
    return "FAIL";
  } else {
    if (contrastRatio >= 7.0) return "AAA";
    if (contrastRatio >= 4.5) return "AA";
    return "FAIL";
  }
}

export function getWcagLevel(textRgb, bgRgb, large = false) {
  const ratio = calculateContrastRatio(textRgb, bgRgb);
  return getContrastLevel(ratio, large);
}

// Snake-case aliases
export const calculate_relative_luminance = calculateRelativeLuminance;
export const calculate_contrast_ratio = calculateContrastRatio;
export const get_contrast_level = getContrastLevel;
export const get_wcag_level = getWcagLevel;
