/**
 * CM-Colors JS - Color Space Conversions
 * Complete mathematical conversions between sRGB, Linear RGB, XYZ, LAB, OKLab, OKLCH, and HSL.
 * Exact 100% parity with Python cm_colors.core.conversions.
 */

export function srgbToLinear(channel) {
  if (channel <= 0.04045) {
    return channel / 12.92;
  } else {
    return Math.pow((channel + 0.055) / 1.055, 2.4);
  }
}

export function linearToSrgb(channel) {
  if (channel <= 0.0031308) {
    return 12.92 * channel;
  } else {
    return 1.055 * Math.pow(channel, 1.0 / 2.4) - 0.055;
  }
}

export function rgbToLinear(channel) {
  return srgbToLinear(channel / 255.0);
}

export function hexToRgb(hexStr, string = false) {
  if (typeof hexStr !== "string") {
    throw new Error(`Invalid hex color: ${hexStr}`);
  }
  let h = hexStr.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h.split("").map(c => c + c).join("");
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hexStr}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (string) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return [r, g, b];
}

export function rgbToHex(rgb) {
  let r, g, b;
  if (typeof rgb === "string") {
    const match = rgb.trim().match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (!match) {
      throw new Error(`Invalid CSS rgb() string: ${rgb}`);
    }
    r = parseInt(match[1], 10);
    g = parseInt(match[2], 10);
    b = parseInt(match[3], 10);
  } else if (Array.isArray(rgb) && rgb.length === 3) {
    [r, g, b] = rgb;
  } else {
    throw new Error(`Invalid RGB input: ${rgb}`);
  }

  for (const x of [r, g, b]) {
    if (typeof x !== "number" || isNaN(x) || x < 0 || x > 255) {
      throw new Error(`RGB values must be integers in 0-255: ${rgb}`);
    }
  }

  const hexR = Math.round(r).toString(16).padStart(2, "0");
  const hexG = Math.round(g).toString(16).padStart(2, "0");
  const hexB = Math.round(b).toString(16).padStart(2, "0");
  return `#${hexR}${hexG}${hexB}`;
}

export function calculateHueAngle(a, b) {
  if (a === 0 && b === 0) return 0.0;
  let hue = (Math.atan2(b, a) * 180.0) / Math.PI;
  return hue < 0 ? hue + 360.0 : hue;
}

function safeCbrt(x) {
  return x >= 0 ? Math.pow(x, 1.0 / 3.0) : -Math.pow(-x, 1.0 / 3.0);
}

function safeCube(x) {
  return x >= 0 ? x * x * x : -((-x) * (-x) * (-x));
}

export function rgbToOklch(rgb) {
  const [r, g, b] = [rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0];

  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);

  const lCone = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const mCone = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const sCone = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;

  const lPrime = safeCbrt(lCone);
  const mPrime = safeCbrt(mCone);
  const sPrime = safeCbrt(sCone);

  let L = 0.2104542553 * lPrime + 0.7936177850 * mPrime - 0.0040720468 * sPrime;
  const a = 1.9779984951 * lPrime - 2.4285922050 * mPrime + 0.4505937099 * sPrime;
  const bLab = 0.0259040371 * lPrime + 0.7827717662 * mPrime - 0.8086757660 * sPrime;

  const C = Math.sqrt(a * a + bLab * bLab);
  const H = C < 1e-10 ? 0.0 : calculateHueAngle(a, bLab);

  L = Math.max(0.0, Math.min(1.0, L));
  return [L, C, H];
}

export function oklchToRgb(oklch) {
  const [L, C, H] = oklch;
  const hRad = (H * Math.PI) / 180.0;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const lPrime = L + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = L - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = L - 0.0894841775 * a - 1.2914855480 * b;

  const lCone = safeCube(lPrime);
  const mCone = safeCube(mPrime);
  const sCone = safeCube(sPrime);

  let rLinear = 4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone;
  let gLinear = -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone;
  let bLinear = -0.0041960863 * lCone - 0.7034186147 * mCone + 1.7076147010 * sCone;

  rLinear = Math.max(0.0, Math.min(1.0, rLinear));
  gLinear = Math.max(0.0, Math.min(1.0, gLinear));
  bLinear = Math.max(0.0, Math.min(1.0, bLinear));

  const rSrgb = linearToSrgb(rLinear);
  const gSrgb = linearToSrgb(gLinear);
  const bSrgb = linearToSrgb(bLinear);

  const r8bit = Math.max(0, Math.min(255, Math.round(rSrgb * 255)));
  const g8bit = Math.max(0, Math.min(255, Math.round(gSrgb * 255)));
  const b8bit = Math.max(0, Math.min(255, Math.round(bSrgb * 255)));

  return [r8bit, g8bit, b8bit];
}

export function isValidRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3) return false;
  return rgb.every(v => typeof v === "number" && !isNaN(v) && v >= 0 && v <= 255);
}

export function isValidOklch(oklch) {
  if (!Array.isArray(oklch) || oklch.length !== 3) return false;
  const [L, C, H] = oklch;
  if (typeof L !== "number" || L < 0 || L > 1) return false;
  if (typeof C !== "number" || C < 0) return false;
  if (typeof H !== "number" || H < 0 || H > 360) return false;
  return true;
}

export function rgbToOklchSafe(rgb) {
  try {
    if (!isValidRgb(rgb)) throw new Error(`Invalid RGB values: ${rgb}`);
    const oklch = rgbToOklch(rgb);
    if (!isValidOklch(oklch)) throw new Error(`Invalid OKLCH: ${oklch}`);
    return oklch;
  } catch {
    const [r, g, b] = rgb || [0, 0, 0];
    const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    return [gray, 0.0, 0.0];
  }
}

export function oklchToRgbSafe(oklch) {
  try {
    if (!isValidOklch(oklch)) throw new Error(`Invalid OKLCH values: ${oklch}`);
    const rgb = oklchToRgb(oklch);
    if (!isValidRgb(rgb)) throw new Error(`Invalid RGB conversion result: ${rgb}`);
    return rgb;
  } catch {
    const L = oklch ? oklch[0] : 0;
    const gray = Math.max(0, Math.min(255, Math.round(L * 255)));
    return [gray, gray, gray];
  }
}

export function rgbToXyz(rgb) {
  const rLinear = srgbToLinear(rgb[0] / 255.0);
  const gLinear = srgbToLinear(rgb[1] / 255.0);
  const bLinear = srgbToLinear(rgb[2] / 255.0);

  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
  const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

export function xyzToLab(xyz) {
  const [x, y, z] = xyz;
  const xn = 95.047, yn = 100.0, zn = 108.883;

  function labTransform(t) {
    return t > 0.008856 ? Math.pow(t, 1.0 / 3.0) : 7.787 * t + 16.0 / 116.0;
  }

  const fx = labTransform(x / xn);
  const fy = labTransform(y / yn);
  const fz = labTransform(z / zn);

  const L = Math.max(0, Math.min(100, 116 * fy - 16));
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

export function rgbToLab(rgb) {
  return xyzToLab(rgbToXyz(rgb));
}

export function rgbaToRgb(rgba, background = [255, 255, 255]) {
  if (!Array.isArray(rgba) || rgba.length !== 4) {
    throw new Error("RGBA must be an array of 4 values.");
  }
  const [r, g, b, a] = rgba;
  for (const v of [r, g, b]) {
    if (typeof v !== "number" || v < 0 || v > 255) {
      throw new Error("RGBA r, g, b must be integers in 0–255.");
    }
  }
  if (typeof a !== "number" || a < 0.0 || a > 1.0) {
    throw new Error("RGBA a must be a float in 0–1.");
  }
  if (!Array.isArray(background) || background.length !== 3) {
    throw new Error("background must be an array of 3 values.");
  }
  for (const v of background) {
    if (typeof v !== "number" || v < 0 || v > 255) {
      throw new Error("background r, g, b must be integers in 0–255.");
    }
  }

  const [bgR, bgG, bgB] = background;
  const rOut = Math.round(r * a + bgR * (1 - a));
  const gOut = Math.round(g * a + bgG * (1 - a));
  const bOut = Math.round(b * a + bgB * (1 - a));
  return [rOut, gOut, bOut];
}

export function rgbintToString(rgb) {
  if (!isValidRgb(rgb)) {
    throw new Error(`Invalid RGB values: ${rgb}`);
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function _parseRgbComponent(v) {
  const str = String(v).trim();
  if (str.endsWith("%")) {
    return parseFloat(str.slice(0, -1)) * 2.55;
  }
  return parseFloat(str);
}

function _parseHslPercentageOrDecimal(v) {
  const str = String(v).trim();
  if (str.endsWith("%")) {
    return parseFloat(str.slice(0, -1)) / 100.0;
  }
  const x = parseFloat(str);
  if (x >= 0 && x <= 1) return x;
  throw new Error(`S/L must be either percentage or decimal 0–1: ${v}`);
}

function _parseHue(v) {
  let hue = parseFloat(String(v).trim()) % 360;
  return hue < 0 ? hue + 360 : hue;
}

export function rgbToHsl(rgbColor) {
  let r, g, b;
  if (typeof rgbColor === "string") {
    let text = rgbColor.trim().toLowerCase();
    if (!text.startsWith("rgb(") && !text.startsWith("rgba(")) {
      throw new Error(`Invalid RGB/RGBA string: ${rgbColor}`);
    }
    let inside = text.slice(text.indexOf("(") + 1, text.lastIndexOf(")")).trim();
    inside = inside.replace(/,/g, " ");
    if (inside.includes("/")) {
      inside = inside.split("/")[0].trim();
    }
    const parts = inside.split(/\s+/).filter(Boolean);
    if (parts.length < 3) {
      throw new Error(`Invalid RGB (missing components): ${rgbColor}`);
    }
    r = _parseRgbComponent(parts[0]);
    g = _parseRgbComponent(parts[1]);
    b = _parseRgbComponent(parts[2]);
  } else if (Array.isArray(rgbColor)) {
    if (rgbColor.length < 3) {
      throw new Error("RGB tuple must have ≥ 3 components");
    }
    [r, g, b] = rgbColor.slice(0, 3);
  } else {
    throw new Error("Unsupported RGB format");
  }

  for (const c of [r, g, b]) {
    if (c < 0 || c > 255) throw new Error(`RGB component out of range: ${c}`);
  }

  r /= 255.0;
  g /= 255.0;
  b /= 255.0;

  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const diff = mx - mn;
  const l = (mx + mn) / 2.0;

  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = diff / (1.0 - Math.abs(2.0 * l - 1.0));
    if (mx === r) {
      h = ((g - b) / diff) % 6;
    } else if (mx === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const roundH = Math.round(h * 10) / 10;
  const roundS = Math.round(s * 100 * 10) / 10;
  const roundL = Math.round(l * 100 * 10) / 10;
  return `hsl(${roundH}, ${roundS}%, ${roundL}%)`;
}

export function hslToRgb(hslColor) {
  let h, s, l;

  if (typeof hslColor === "string") {
    const text = hslColor.trim().toLowerCase();
    if (!text.startsWith("hsl(") || !text.endsWith(")")) {
      throw new Error(`Invalid HSL string: ${hslColor}`);
    }
    let inside = text.slice(4, -1).trim();
    inside = inside.replace(/,/g, " ").replace(/%/g, "% ");
    const parts = inside.split(/\s+/).filter(Boolean);
    if (parts.length < 3) {
      throw new Error(`Invalid HSL string components: ${hslColor}`);
    }
    h = _parseHue(parts[0]);
    s = _parseHslPercentageOrDecimal(parts[1]);
    l = _parseHslPercentageOrDecimal(parts[2]);
  } else if (Array.isArray(hslColor)) {
    if (hslColor.length !== 3) {
      throw new Error("HSL tuple must be length 3");
    }
    const [rawH, rawS, rawL] = hslColor;
    h = _parseHue(rawH);
    s = _parseHslPercentageOrDecimal(rawS);
    l = _parseHslPercentageOrDecimal(rawL);
  } else {
    throw new Error("Unsupported HSL format");
  }

  if (s < 0 || s > 1 || l < 0 || l > 1) {
    throw new Error("S and L must be in [0, 1] after parsing");
  }

  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }

  function f(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1.0 / 6.0) return p + (q - p) * 6 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6;
    return p;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360.0;

  const r = f(p, q, hNorm + 1.0 / 3.0);
  const g = f(p, q, hNorm);
  const b = f(p, q, hNorm - 1.0 / 3.0);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function hslaToRgb(hslaColor, background = null) {
  let h, s, l, a;

  if (typeof hslaColor === "string") {
    let text = hslaColor.trim().toLowerCase();
    if (text.startsWith("hsla(") && text.endsWith(")")) {
      let content = text.slice(5, -1).trim().replace(/\//g, ",");
      const parts = content.split(",").map(p => p.trim().replace(/%/g, ""));
      if (parts.length === 4) {
        h = parseFloat(parts[0]) % 360;
        if (h < 0) h += 360;
        s = parts[1] ? parseFloat(parts[1]) / 100.0 : 0.0;
        l = parts[2] ? parseFloat(parts[2]) / 100.0 : 0.0;
        const rawA = parseFloat(parts[3]);
        a = rawA <= 1.0 ? rawA : rawA / 100.0;
      } else {
        throw new Error("Invalid HSLA CSS string format");
      }
    } else {
      throw new Error("Invalid HSLA string format - must start with 'hsla('");
    }
  } else if (Array.isArray(hslaColor)) {
    if (hslaColor.length === 4) {
      [h, s, l, a] = hslaColor;
      h = parseFloat(h) % 360;
      if (h < 0) h += 360;
      s = parseFloat(s);
      l = parseFloat(l);
      a = parseFloat(a);
    } else {
      throw new Error("Invalid HSLA tuple/list - must have 4 components");
    }
  } else {
    throw new Error("HSLA color must be string, tuple, or list");
  }

  if (s < 0 || s > 1 || l < 0 || l > 1 || a < 0 || a > 1) {
    throw new Error("HSLA values out of range: s, l, a must be in [0, 1]");
  }

  const rgb = hslToRgb([h, s, l]);
  if (a >= 1.0) return rgb;

  const bgRgb = background ? background : [255, 255, 255];
  return rgbaToRgb([rgb[0], rgb[1], rgb[2], a], bgRgb);
}

export function rgbToHsla(rgbTuple, alpha = 1.0) {
  if (!Array.isArray(rgbTuple) || rgbTuple.length !== 3) {
    throw new Error("RGB must be an array of 3 values");
  }
  for (const val of rgbTuple) {
    if (val < 0 || val > 255) throw new Error("RGB values must be in range [0, 255]");
  }
  if (alpha < 0 || alpha > 1) {
    throw new Error("Alpha must be in range [0, 1]");
  }
  const hslStr = rgbToHsl(rgbTuple);
  const content = hslStr.slice(4, -1);
  const [hPart, sPart, lPart] = content.split(", ");
  return `hsla(${hPart}, ${sPart}, ${lPart}, ${alpha})`;
}

// Snake-case aliases matching Python cm_colors.core.conversions
export const srgb_to_linear = srgbToLinear;
export const linear_to_srgb = linearToSrgb;
export const rgb_to_linear = rgbToLinear;
export const hex_to_rgb = hexToRgb;
export const rgb_to_hex = rgbToHex;
export const rgb_to_oklch = rgbToOklch;
export const oklch_to_rgb = oklchToRgb;
export const calculate_hue_angle = calculateHueAngle;
export const is_valid_rgb = isValidRgb;
export const is_valid_oklch = isValidOklch;
export const rgb_to_oklch_safe = rgbToOklchSafe;
export const oklch_to_rgb_safe = oklchToRgbSafe;
export const rgb_to_xyz = rgbToXyz;
export const xyz_to_lab = xyzToLab;
export const rgb_to_lab = rgbToLab;
export const rgba_to_rgb = rgbaToRgb;
export const rgbint_to_string = rgbintToString;
export const rgb_to_hsl = rgbToHsl;
export const hsl_to_rgb = hslToRgb;
export const hsla_to_rgb = hslaToRgb;
export const rgb_to_hsla = rgbToHsla;
