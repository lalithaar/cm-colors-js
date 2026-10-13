/**
 * CM-Colors JS - Color Space Conversions
 * Mathematical conversions between sRGB, Linear RGB, XYZ, LAB, OKLab, OKLCH, and HSL.
 */

export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
}

export function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h.split("").map(c => c + c).join("");
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
}

export function rgbToHex(rgb) {
  const [r, g, b] = rgb.map(x => Math.max(0, Math.min(255, Math.round(x))));
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

export function rgbToLinear(channel) {
  return srgbToLinear(channel / 255.0);
}

export function calculateHueAngle(a, b) {
  if (a === 0 && b === 0) return 0;
  let hue = (Math.atan2(b, a) * 180) / Math.PI;
  return hue < 0 ? hue + 360 : hue;
}

function safeCbrt(x) {
  return x >= 0 ? Math.pow(x, 1 / 3) : -Math.pow(-x, 1 / 3);
}

function safeCube(x) {
  return x >= 0 ? x * x * x : -((-x) * (-x) * (-x));
}

export function rgbToOklch(rgb) {
  const rLinear = srgbToLinear(rgb[0] / 255.0);
  const gLinear = srgbToLinear(rgb[1] / 255.0);
  const bLinear = srgbToLinear(rgb[2] / 255.0);

  // Linear RGB to LMS cone response
  const lCone = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const mCone = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const sCone = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;

  const lPrime = safeCbrt(lCone);
  const mPrime = safeCbrt(mCone);
  const sPrime = safeCbrt(sCone);

  const L = 0.2104542553 * lPrime + 0.7936177850 * mPrime - 0.0040720468 * sPrime;
  const a = 1.9779984951 * lPrime - 2.4285922050 * mPrime + 0.4505937099 * sPrime;
  const b = 0.0259040371 * lPrime + 0.7827717662 * mPrime - 0.8086757660 * sPrime;

  const C = Math.sqrt(a * a + b * b);
  const H = C < 1e-10 ? 0.0 : calculateHueAngle(a, b);

  return [Math.max(0.0, Math.min(1.0, L)), C, H];
}

export function oklchToRgb(oklch) {
  const [L, C, H] = oklch;
  const hRad = (H * Math.PI) / 180.0;
  const aLab = C * Math.cos(hRad);
  const bLab = C * Math.sin(hRad);

  const lPrime = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const mPrime = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const sPrime = L - 0.0894841775 * aLab - 1.2914855480 * bLab;

  const lCone = safeCube(lPrime);
  const mCone = safeCube(mPrime);
  const sCone = safeCube(sPrime);

  let rLinear = 4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone;
  let gLinear = -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone;
  let bLinear = -0.0041960863 * lCone - 0.7034186147 * mCone + 1.7076147010 * sCone;

  rLinear = Math.max(0.0, Math.min(1.0, rLinear));
  gLinear = Math.max(0.0, Math.min(1.0, gLinear));
  bLinear = Math.max(0.0, Math.min(1.0, bLinear));

  const r = Math.max(0, Math.min(255, Math.round(linearToSrgb(rLinear) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(linearToSrgb(gLinear) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(linearToSrgb(bLinear) * 255)));

  return [r, g, b];
}

export function isValidRgb(rgb) {
  return Array.isArray(rgb) && rgb.length === 3 && rgb.every(x => x >= 0 && x <= 255);
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
    return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
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

export function parseColor(colorInput) {
  if (Array.isArray(colorInput) && colorInput.length >= 3) {
    return [Math.round(colorInput[0]), Math.round(colorInput[1]), Math.round(colorInput[2])];
  }
  if (typeof colorInput !== "string") {
    throw new Error(`Unsupported color format: ${colorInput}`);
  }
  const str = colorInput.trim().toLowerCase();

  // Hex
  if (str.startsWith("#")) {
    return hexToRgb(str);
  }

  // rgb(...) or rgba(...)
  const rgbMatch = str.match(/^rgba?\(\s*([0-9.%]+)\s*,\s*([0-9.%]+)\s*,\s*([0-9.%]+)(?:\s*,\s*([0-9.%]+))?\s*\)$/)
    || str.match(/^rgba?\(\s*([0-9.%]+)\s+([0-9.%]+)\s+([0-9.%]+)(?:\s*\/\s*([0-9.%]+))?\s*\)$/);
  if (rgbMatch) {
    const parseComp = v => v.endsWith("%") ? (parseFloat(v) * 2.55) : parseFloat(v);
    const r = Math.round(parseComp(rgbMatch[1]));
    const g = Math.round(parseComp(rgbMatch[2]));
    const b = Math.round(parseComp(rgbMatch[3]));
    return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
  }

  // Named colors map (common basics)
  const named = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    cyan: [0, 255, 255],
    magenta: [255, 0, 255],
    gray: [128, 128, 128],
    grey: [128, 128, 128]
  };
  if (named[str]) return named[str];

  // Try hex without hash if 6 hex chars
  if (/^[0-9a-f]{6}$/.test(str)) {
    return hexToRgb("#" + str);
  }

  throw new Error(`Unable to parse color string: ${colorInput}`);
}
