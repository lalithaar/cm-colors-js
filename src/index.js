/**
 * CM-Colors JS (v1.1.0)
 * Accessible Color Science Library ported from Python cm-colors.
 * Automatically fix colors to be WCAG readable with minimal visual change.
 * 100% full parity with PyPI cm-colors 1.1.0.
 *
 * @license GPL-3.0
 * @author Lalitha A R <https://isrl.in/>
 */

import { Color, ColorPair } from "./colors.js";
import { makeReadableBulk, make_readable_bulk } from "./cmColors.js";
import { CSS_NAMED_COLORS } from "./namedColors.js";
import {
  parseColorToRgb,
  parse_color_to_rgb,
  detectColorFormat,
  detect_color_format,
  formatColor,
  format_color
} from "./colorParser.js";
import {
  srgbToLinear,
  srgb_to_linear,
  linearToSrgb,
  linear_to_srgb,
  rgbToLinear,
  rgb_to_linear,
  hexToRgb,
  hex_to_rgb,
  rgbToHex,
  rgb_to_hex,
  rgbToOklch,
  rgb_to_oklch,
  oklchToRgb,
  oklch_to_rgb,
  rgbToOklchSafe,
  rgb_to_oklch_safe,
  oklchToRgbSafe,
  oklch_to_rgb_safe,
  isValidRgb,
  is_valid_rgb,
  isValidOklch,
  is_valid_oklch,
  calculateHueAngle,
  calculate_hue_angle,
  rgbToXyz,
  rgb_to_xyz,
  xyzToLab,
  xyz_to_lab,
  rgbToLab,
  rgb_to_lab,
  rgbaToRgb,
  rgba_to_rgb,
  rgbintToString,
  rgbint_to_string,
  rgbToHsl,
  rgb_to_hsl,
  hslToRgb,
  hsl_to_rgb,
  hslaToRgb,
  hsla_to_rgb,
  rgbToHsla,
  rgb_to_hsla
} from "./conversions.js";
import {
  calculateRelativeLuminance,
  calculate_relative_luminance,
  calculateContrastRatio,
  calculate_contrast_ratio,
  getContrastLevel,
  get_contrast_level,
  getWcagLevel,
  get_wcag_level
} from "./contrast.js";
import {
  calculateDeltaE2000,
  calculate_delta_e_2000,
  deltaE
} from "./colorMetrics.js";
import {
  binarySearchLightness,
  binary_search_lightness,
  gradientDescentOklch,
  gradient_descent_oklch,
  generateAccessibleColor,
  generate_accessible_color,
  checkAndFixContrast,
  check_and_fix_contrast,
  _strategy_strict,
  _strategy_recursive,
  _strategy_relaxed
} from "./optimisation.js";
import {
  toConsole,
  to_console,
  toHtml,
  to_html,
  toHtmlBulk,
  to_html_bulk,
  _get_level_badge
} from "./visualiser.js";

export const version = "1.1.0";
export const __version__ = "1.1.0";

// Re-exports
export {
  Color,
  ColorPair,
  makeReadableBulk,
  make_readable_bulk,
  CSS_NAMED_COLORS,
  parseColorToRgb,
  parse_color_to_rgb,
  detectColorFormat,
  detect_color_format,
  formatColor,
  format_color,
  srgbToLinear,
  srgb_to_linear,
  linearToSrgb,
  linear_to_srgb,
  rgbToLinear,
  rgb_to_linear,
  hexToRgb,
  hex_to_rgb,
  rgbToHex,
  rgb_to_hex,
  rgbToOklch,
  rgb_to_oklch,
  oklchToRgb,
  oklch_to_rgb,
  rgbToOklchSafe,
  rgb_to_oklch_safe,
  oklchToRgbSafe,
  oklch_to_rgb_safe,
  isValidRgb,
  is_valid_rgb,
  isValidOklch,
  is_valid_oklch,
  calculateHueAngle,
  calculate_hue_angle,
  rgbToXyz,
  rgb_to_xyz,
  xyzToLab,
  xyz_to_lab,
  rgbToLab,
  rgb_to_lab,
  rgbaToRgb,
  rgba_to_rgb,
  rgbintToString,
  rgbint_to_string,
  rgbToHsl,
  rgb_to_hsl,
  hslToRgb,
  hsl_to_rgb,
  hslaToRgb,
  hsla_to_rgb,
  rgbToHsla,
  rgb_to_hsla,
  calculateRelativeLuminance,
  calculate_relative_luminance,
  calculateContrastRatio,
  calculate_contrast_ratio,
  getContrastLevel,
  get_contrast_level,
  getWcagLevel,
  get_wcag_level,
  calculateDeltaE2000,
  calculate_delta_e_2000,
  deltaE,
  binarySearchLightness,
  binary_search_lightness,
  gradientDescentOklch,
  gradient_descent_oklch,
  generateAccessibleColor,
  generate_accessible_color,
  checkAndFixContrast,
  check_and_fix_contrast,
  _strategy_strict,
  _strategy_recursive,
  _strategy_relaxed,
  toConsole,
  to_console,
  toHtml,
  to_html,
  toHtmlBulk,
  to_html_bulk,
  _get_level_badge
};

/**
 * Top-level convenience function: fix a single color pair to make it readable.
 */
export function makeReadable(textColor, bgColor, options = {}) {
  const large = options.large || false;
  const pair = new ColorPair(textColor, bgColor, large);
  const [fixedColor, success] = pair.makeReadable(options);
  return {
    fixedColor,
    success,
    isReadable: pair.isReadable,
    pair
  };
}

export const make_readable = makeReadable;
export const getContrast = calculateContrastRatio;
export const getContrastRatio = calculateContrastRatio;

export default {
  version,
  __version__,
  Color,
  ColorPair,
  makeReadableBulk,
  make_readable_bulk,
  makeReadable,
  make_readable,
  CSS_NAMED_COLORS,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  rgbToXyz,
  xyzToLab,
  rgbToLab,
  rgbToHsl,
  hslToRgb,
  hslaToRgb,
  rgbToHsla,
  rgbaToRgb,
  rgbintToString,
  parseColorToRgb,
  detectColorFormat,
  formatColor,
  calculateRelativeLuminance,
  calculateContrastRatio,
  getContrastLevel,
  getWcagLevel,
  calculateDeltaE2000,
  deltaE,
  binarySearchLightness,
  gradientDescentOklch,
  generateAccessibleColor,
  checkAndFixContrast,
  toConsole,
  toHtml,
  toHtmlBulk
};
