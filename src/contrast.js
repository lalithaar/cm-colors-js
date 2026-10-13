/**
 * CM-Colors JS - WCAG Contrast Calculations
 */

import { srgbToLinear, parseColor } from "./conversions.js";

export function calculateRelativeLuminance(rgb) {
  const c = Array.isArray(rgb) ? rgb : parseColor(rgb);
  const [r, g, b] = c.map(x => x / 255.0);
  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function calculateContrastRatio(textRgb, bgRgb) {
  const tRgb = Array.isArray(textRgb) ? textRgb : parseColor(textRgb);
  const bRgb = Array.isArray(bgRgb) ? bgRgb : parseColor(bgRgb);
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
