/**
 * CM-Colors JS - CIEDE2000 Color Difference Metric
 * Full mathematical rigor matching CIEDE2000 specification.
 * Complete parity with Python cm_colors.core.color_metrics.
 */

import { rgbToLab, calculateHueAngle } from "./conversions.js";

export function calculateDeltaE2000(rgb1, rgb2) {
  if (rgb1[0] === rgb2[0] && rgb1[1] === rgb2[1] && rgb1[2] === rgb2[2]) {
    return 0.0;
  }

  const [L1, a1, b1] = rgbToLab(rgb1);
  const [L2, a2, b2] = rgbToLab(rgb2);

  const deltaL = L2 - L1;
  const Lmean = (L1 + L2) / 2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cmean = (C1 + C2) / 2;

  const Cmean7 = Math.pow(Cmean, 7);
  const G = 0.5 * (1 - Math.sqrt(Cmean7 / (Cmean7 + Math.pow(25, 7))));
  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
  const CmeanPrime = (C1Prime + C2Prime) / 2;

  const h1Prime = calculateHueAngle(a1Prime, b1);
  const h2Prime = calculateHueAngle(a2Prime, b2);

  let deltahPrime = 0;
  if (C1Prime === 0 || C2Prime === 0) {
    deltahPrime = 0;
  } else if (Math.abs(h2Prime - h1Prime) <= 180) {
    deltahPrime = h2Prime - h1Prime;
  } else if (h2Prime - h1Prime > 180) {
    deltahPrime = h2Prime - h1Prime - 360;
  } else {
    deltahPrime = h2Prime - h1Prime + 360;
  }

  const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(((deltahPrime / 2) * Math.PI) / 180);
  const deltaCPrime = C2Prime - C1Prime;

  let HmeanPrime = 0;
  if (C1Prime === 0 || C2Prime === 0) {
    HmeanPrime = h1Prime + h2Prime;
  } else if (Math.abs(h1Prime - h2Prime) <= 180) {
    HmeanPrime = (h1Prime + h2Prime) / 2;
  } else if (Math.abs(h1Prime - h2Prime) > 180 && h1Prime + h2Prime < 360) {
    HmeanPrime = (h1Prime + h2Prime + 360) / 2;
  } else {
    HmeanPrime = (h1Prime + h2Prime - 360) / 2;
  }

  const rad = Math.PI / 180;
  const T = 1
    - 0.17 * Math.cos((HmeanPrime - 30) * rad)
    + 0.24 * Math.cos(2 * HmeanPrime * rad)
    + 0.32 * Math.cos((3 * HmeanPrime + 6) * rad)
    - 0.20 * Math.cos((4 * HmeanPrime - 63) * rad);

  const deltaTheta = 30 * Math.exp(-Math.pow((HmeanPrime - 275) / 25, 2));

  const CmeanPrime7 = Math.pow(CmeanPrime, 7);
  const RC = 2 * Math.sqrt(CmeanPrime7 / (CmeanPrime7 + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(Lmean - 50, 2)) / Math.sqrt(20 + Math.pow(Lmean - 50, 2));
  const SC = 1 + 0.045 * CmeanPrime;
  const SH = 1 + 0.015 * CmeanPrime * T;

  const RT = -Math.sin(2 * deltaTheta * rad) * RC;

  const kL = 1.0, kC = 1.0, kH = 1.0;

  const deltaE = Math.sqrt(
    Math.pow(deltaL / (kL * SL), 2) +
    Math.pow(deltaCPrime / (kC * SC), 2) +
    Math.pow(deltaHPrime / (kH * SH), 2) +
    RT * (deltaCPrime / (kC * SC)) * (deltaHPrime / (kH * SH))
  );

  return deltaE;
}

// Aliases
export const calculate_delta_e_2000 = calculateDeltaE2000;
export const deltaE = calculateDeltaE2000;
