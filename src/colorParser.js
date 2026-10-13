/**
 * CM-Colors JS - Color Parser & Format Detection
 * Complete 100% parity with cm_colors.core.color_parser.
 */

import { CSS_NAMED_COLORS } from "./namedColors.js";
import {
  isValidRgb,
  hexToRgb,
  rgbaToRgb,
  hslaToRgb,
  hslToRgb,
  rgbToHex,
  rgbintToString,
  rgbToHsl
} from "./conversions.js";

const NUM_RE = /[-+]?\d*\.?\d+%?/g;

export function _extractNumberTokens(s) {
  const matches = s.match(NUM_RE);
  return matches ? matches.filter(Boolean) : [];
}

export function _parseNumberToken(tok, component = true) {
  const str = String(tok).trim();
  if (str.endsWith("%")) {
    const v = parseFloat(str.slice(0, -1));
    if (isNaN(v)) throw new Error(`Invalid percentage value: '${tok}'`);
    if (component) {
      return Math.max(0.0, Math.min(255.0, (v * 255.0) / 100.0));
    } else {
      return Math.max(0.0, Math.min(1.0, v / 100.0));
    }
  }

  const v = parseFloat(str);
  if (isNaN(v)) throw new Error(`Invalid numeric value: '${tok}'`);

  if (component) {
    if (v >= 0.0 && v <= 255.0) {
      return v;
    }
    throw new Error(`RGB component out of range: ${v}`);
  } else {
    if (v >= 0.0 && v <= 1.0) {
      return v;
    }
    if (v > 1.0 && v <= 100.0) {
      return Math.max(0.0, Math.min(1.0, v / 100.0));
    }
    throw new Error(`Alpha value out of range: ${v}`);
  }
}

export function parseColorToRgb(color, background = null) {
  if (color === null || color === undefined) {
    throw new Error("Color cannot be null or undefined");
  }

  // 1. Tuple / array inputs
  if (Array.isArray(color)) {
    const ln = color.length;

    if (ln === 3) {
      // Always try RGB first
      try {
        const comps = [];
        for (const c of color) {
          if (typeof c === "number") {
            if (Number.isInteger(c) && c >= 0 && c <= 255) {
              comps.push(c);
            } else if (c >= 0.0 && c <= 1.0 && !Number.isInteger(c)) {
              comps.push(Math.round(c * 255.0));
            } else if (c >= 0.0 && c <= 255.0) {
              comps.push(Math.round(c));
            } else {
              throw new Error(`RGB component out of range or invalid: ${c}`);
            }
          } else if (typeof c === "string") {
            comps.push(Math.round(_parseNumberToken(c, true)));
          } else {
            throw new Error(`Unsupported RGB component type: ${typeof c}`);
          }
        }

        const rgb = [comps[0], comps[1], comps[2]];
        if (!isValidRgb(rgb)) {
          throw new Error(`RGB component out of range or invalid: ${rgb}`);
        }
        return rgb;
      } catch (e) {
        if (e.message && e.message.includes("out of range")) {
          throw e;
        }
        // Fallback to HSL
        try {
          return hslToRgb(color);
        } catch {
          throw new Error("Invalid color tuple. If you intended HSL, use hsl(...) syntax.");
        }
      }
    } else if (ln === 4) {
      const [rRaw, gRaw, bRaw, aRaw] = color;

      const looksLikeRgb =
        (Number.isInteger(rRaw) && rRaw > 1) ||
        (Number.isInteger(gRaw) && gRaw > 1) ||
        (Number.isInteger(bRaw) && bRaw > 1) ||
        (typeof rRaw === "number" && rRaw > 1.0) ||
        (typeof gRaw === "number" && gRaw > 1.0) ||
        (typeof bRaw === "number" && bRaw > 1.0);

      if (looksLikeRgb) {
        const r = Math.round(_parseNumberToken(String(rRaw), true));
        const g = Math.round(_parseNumberToken(String(gRaw), true));
        const b = Math.round(_parseNumberToken(String(bRaw), true));
        const a = _parseNumberToken(String(aRaw), false);

        const bgRgb = background === null ? [255, 255, 255] : parseColorToRgb(background);
        return rgbaToRgb([r, g, b, a], bgRgb);
      } else {
        let bgRgb = null;
        if (background !== null) {
          if (Array.isArray(background) && background.length === 3) {
            bgRgb = background;
          } else {
            bgRgb = parseColorToRgb(background);
          }
        }
        return hslaToRgb(color, bgRgb);
      }
    } else {
      throw new Error(`Tuple/list color must have length 3 (RGB/HSL) or 4 (RGBA/HSLA). Got length ${ln}`);
    }
  }

  // 2. Strings
  if (typeof color === "string") {
    const s = color.trim();
    const sLower = s.toLowerCase();

    // CSS named color lookup
    if (CSS_NAMED_COLORS[sLower]) {
      return hexToRgb(CSS_NAMED_COLORS[sLower]);
    }

    // Hex with or without '#'
    if (sLower.startsWith("#") || /^[0-9a-f]{3}$/i.test(sLower) || /^[0-9a-f]{6}$/i.test(sLower)) {
      const hex = sLower.startsWith("#") ? s : "#" + s;
      return hexToRgb(hex);
    }

    // HSL/HSLA functional notation
    if (sLower.startsWith("hsl(") || sLower.startsWith("hsla(")) {
      if (sLower.startsWith("hsla(")) {
        let bgRgb = null;
        if (background !== null) {
          if (Array.isArray(background) && background.length === 3) {
            bgRgb = background;
          } else {
            bgRgb = parseColorToRgb(background);
          }
        }
        return hslaToRgb(s, bgRgb);
      } else {
        return hslToRgb(s);
      }
    }

    // RGB/RGBA functional notation and informal formats
    if (
      sLower.startsWith("rgb(") ||
      sLower.startsWith("rgba(") ||
      sLower.startsWith("rgb ") ||
      sLower.startsWith("(") ||
      s.includes(",") ||
      s.includes(" ")
    ) {
      const tokens = _extractNumberTokens(sLower);
      if (!tokens || tokens.length === 0) {
        throw new Error(`Could not parse numeric components from '${s}'`);
      }

      if (tokens.length >= 4) {
        // RGBA
        const r = Math.round(_parseNumberToken(tokens[0], true));
        const g = Math.round(_parseNumberToken(tokens[1], true));
        const b = Math.round(_parseNumberToken(tokens[2], true));
        const a = _parseNumberToken(tokens[3], false);

        const bgRgb = background === null ? [255, 255, 255] : parseColorToRgb(background);
        return rgbaToRgb([r, g, b, a], bgRgb);
      } else if (tokens.length === 3) {
        // RGB
        const r = Math.round(_parseNumberToken(tokens[0], true));
        const g = Math.round(_parseNumberToken(tokens[1], true));
        const b = Math.round(_parseNumberToken(tokens[2], true));
        const rgb = [
          Math.max(0, Math.min(255, r)),
          Math.max(0, Math.min(255, g)),
          Math.max(0, Math.min(255, b))
        ];
        if (!isValidRgb(rgb)) {
          throw new Error(`Invalid RGB values parsed from '${s}': ${rgb}`);
        }
        return rgb;
      } else {
        throw new Error(`Unrecognized color format: '${s}'`);
      }
    }

    throw new Error(`Unrecognized color string format: '${s}'`);
  }

  throw new Error(`Unsupported color input type: ${typeof color}. Expected string or array.`);
}

export function detectColorFormat(color) {
  if (typeof color === "string") {
    const s = color.trim().toLowerCase();
    if (CSS_NAMED_COLORS[s]) return "named";
    if (s.startsWith("#")) return "hex";
    if (s.startsWith("rgb(")) return "rgb";
    if (s.startsWith("rgba(")) return "rgba";
    if (s.startsWith("hsl(")) return "hsl";
    if (s.startsWith("hsla(")) return "hsla";
    if (/^[0-9a-f]{3}$/i.test(s) || /^[0-9a-f]{6}$/i.test(s)) return "hex";
    if (s.includes(",") || s.includes(" ")) return "rgb";
  } else if (Array.isArray(color)) {
    if (color.length === 3) return "rgb_tuple";
    if (color.length === 4) return "rgba_tuple";
  }
  return "unknown";
}

export function formatColor(rgb, formatType) {
  if (formatType === "hex") {
    return rgbToHex(rgb);
  }
  if (formatType === "rgb") {
    return rgbintToString(rgb);
  }
  if (formatType === "hsl") {
    return rgbToHsl(rgb);
  }
  if (formatType === "rgb_tuple") {
    return rgb;
  }
  // Default to hex for named, rgba, hsla, and unknown types
  return rgbToHex(rgb);
}

// Snake-case aliases
export const parse_color_to_rgb = parseColorToRgb;
export const detect_color_format = detectColorFormat;
export const format_color = formatColor;
