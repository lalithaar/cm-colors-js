/**
 * CM-Colors JS - Optimization & Accessibility Tuning Engine
 * Port of cm_colors core optimization algorithms.
 */

import {
  rgbToOklch,
  oklchToRgb,
  isValidRgb,
  parseColor,
  rgbToHex
} from "./conversions.js";
import { calculateContrastRatio, getWcagLevel } from "./contrast.js";
import { calculateDeltaE2000 } from "./colorMetrics.js";

export function binarySearchLightness(textRgb, bgRgb, deltaEThreshold = 2.0, targetContrast = 7.0, largeText = false) {
  try {
    const [l, c, h] = rgbToOklch(textRgb);
    const [bgL] = rgbToOklch(bgRgb);
    const searchUp = bgL < 0.5; // Lighten text on dark bg, darken on light bg

    let low = searchUp ? l : 0.0;
    let high = searchUp ? 1.0 : l;

    let bestRgb = null;
    let bestDeltaE = Infinity;
    let bestContrast = 0.0;

    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2.0;
      const candidateOklch = [mid, c, h];
      const candidateRgb = oklchToRgb(candidateOklch);

      if (!isValidRgb(candidateRgb)) {
        if (searchUp) high = mid;
        else low = mid;
        continue;
      }

      const deltaE = calculateDeltaE2000(textRgb, candidateRgb);
      const contrast = calculateContrastRatio(candidateRgb, bgRgb);

      if (deltaE > deltaEThreshold) {
        if (searchUp) high = mid;
        else low = mid;
        continue;
      }

      if (contrast >= targetContrast) {
        if (deltaE < bestDeltaE) {
          bestRgb = candidateRgb;
          bestDeltaE = deltaE;
          bestContrast = contrast;
        }
        if (searchUp) high = mid;
        else low = mid;
      } else {
        if (searchUp) low = mid;
        else high = mid;
        if (contrast > bestContrast) {
          bestContrast = contrast;
          bestRgb = candidateRgb;
          bestDeltaE = deltaE;
        }
      }
    }

    return bestRgb;
  } catch {
    return null;
  }
}

export function gradientDescentOklch(textRgb, bgRgb, deltaEThreshold = 2.0, targetContrast = 7.0, largeText = false, maxIter = 50) {
  try {
    const [l, c, h] = rgbToOklch(textRgb);
    let learningRate = 0.02;
    let current = [l, c];

    function costFunction(params) {
      const newL = Math.max(0.0, Math.min(1.0, params[0]));
      const newC = Math.max(0.0, Math.min(0.5, params[1]));

      const candidateOklch = [newL, newC, h];
      const candidateRgb = oklchToRgb(candidateOklch);

      if (!isValidRgb(candidateRgb)) return 1e6;

      const deltaE = calculateDeltaE2000(textRgb, candidateRgb);
      const contrast = calculateContrastRatio(candidateRgb, bgRgb);

      const contrastPenalty = Math.max(0, targetContrast - contrast) * 1000;
      const deltaEPenalty = Math.max(0, deltaE - deltaEThreshold) * 10000;
      const distancePenalty = deltaE * 100;

      return contrastPenalty + deltaEPenalty + distancePenalty;
    }

    function computeGradient(params) {
      const gradient = [0.0, 0.0];
      const epsilon = 1e-4;

      for (let i = 0; i < 2; i++) {
        const paramsPlus = [...params];
        const paramsMinus = [...params];
        paramsPlus[i] += epsilon;
        paramsMinus[i] -= epsilon;

        gradient[i] = (costFunction(paramsPlus) - costFunction(paramsMinus)) / (2 * epsilon);
      }
      return gradient;
    }

    for (let iteration = 0; iteration < maxIter; iteration++) {
      const gradient = computeGradient(current);
      const adaptiveLr = learningRate * Math.pow(0.95, Math.floor(iteration / 10));

      const nextParams = [
        Math.max(0.0, Math.min(1.0, current[0] - adaptiveLr * gradient[0])),
        Math.max(0.0, Math.min(0.5, current[1] - adaptiveLr * gradient[1]))
      ];

      if (Math.abs(costFunction(current) - costFunction(nextParams)) < 1e-6) {
        break;
      }
      current = nextParams;
    }

    const finalRgb = oklchToRgb([current[0], current[1], h]);
    if (isValidRgb(finalRgb)) {
      const finalDeltaE = calculateDeltaE2000(textRgb, finalRgb);
      if (finalDeltaE <= deltaEThreshold) {
        return finalRgb;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function generateAccessibleColor(
  textRgb,
  bgRgb,
  large = false,
  targetContrast = null,
  minContrast = null,
  deltaESequence = null
) {
  if (targetContrast === null) targetContrast = large ? 4.5 : 7.0;
  if (minContrast === null) minContrast = large ? 3.0 : 4.5;

  const currentContrast = calculateContrastRatio(textRgb, bgRgb);
  if (currentContrast >= targetContrast) {
    return textRgb;
  }

  if (deltaESequence === null) {
    deltaESequence = [
      0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 3.0, 3.5, 4.0, 5.0
    ];
  }

  let bestCandidate = null;
  let bestContrast = currentContrast;
  let bestDeltaE = Infinity;

  for (const maxDeltaE of deltaESequence) {
    // Phase 1: Binary search on lightness
    const binaryResult = binarySearchLightness(textRgb, bgRgb, maxDeltaE, targetContrast, large);
    if (binaryResult) {
      const resultContrast = calculateContrastRatio(binaryResult, bgRgb);
      const resultDeltaE = calculateDeltaE2000(textRgb, binaryResult);

      if (resultContrast >= targetContrast) {
        return binaryResult;
      }

      if (resultContrast > bestContrast) {
        bestContrast = resultContrast;
        bestCandidate = binaryResult;
        bestDeltaE = resultDeltaE;
      }
    }

    // Phase 2: Gradient descent
    const gradientResult = gradientDescentOklch(textRgb, bgRgb, maxDeltaE, targetContrast, large);
    if (gradientResult) {
      const resultContrast = calculateContrastRatio(gradientResult, bgRgb);
      const resultDeltaE = calculateDeltaE2000(textRgb, gradientResult);

      if (resultContrast >= targetContrast) {
        return gradientResult;
      }

      if (resultContrast > bestContrast || (resultContrast === bestContrast && resultDeltaE < bestDeltaE)) {
        bestContrast = resultContrast;
        bestCandidate = gradientResult;
        bestDeltaE = resultDeltaE;
      }
    }

    // Early termination with strict DeltaE
    if (
      bestCandidate &&
      bestContrast >= minContrast &&
      maxDeltaE <= 2.5 &&
      deltaESequence[deltaESequence.length - 1] <= 5.0
    ) {
      return bestCandidate;
    }
  }

  return bestCandidate ? bestCandidate : textRgb;
}

export function strategyStrict(textRgb, bgRgb, large, targetContrast, minContrast) {
  const tunedRgb = generateAccessibleColor(textRgb, bgRgb, large, targetContrast, minContrast);
  const finalContrast = calculateContrastRatio(tunedRgb, bgRgb);
  return { tunedRgb, success: finalContrast >= minContrast };
}

export function strategyRecursive(textRgb, bgRgb, large, targetContrast, minContrast) {
  let currentRgb = textRgb;
  const maxIterations = 10;
  const strictSequence = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0];

  for (let i = 0; i < maxIterations; i++) {
    const currentContrast = calculateContrastRatio(currentRgb, bgRgb);
    if (currentContrast >= minContrast) {
      return { tunedRgb: currentRgb, success: true };
    }

    const nextRgb = generateAccessibleColor(
      currentRgb,
      bgRgb,
      large,
      targetContrast,
      minContrast,
      strictSequence
    );

    if (nextRgb[0] === currentRgb[0] && nextRgb[1] === currentRgb[1] && nextRgb[2] === currentRgb[2]) {
      if (calculateContrastRatio(nextRgb, bgRgb) >= minContrast) {
        return { tunedRgb: nextRgb, success: true };
      }
      return { tunedRgb: nextRgb, success: false };
    }

    currentRgb = nextRgb;
    if (calculateContrastRatio(currentRgb, bgRgb) >= minContrast) {
      return { tunedRgb: currentRgb, success: true };
    }
  }

  return { tunedRgb: currentRgb, success: false };
}

export function strategyRelaxed(textRgb, bgRgb, large, targetContrast, minContrast) {
  const rec = strategyRecursive(textRgb, bgRgb, large, targetContrast, minContrast);
  if (rec.success) return rec;

  // Option A: Extended iterations
  let optARgb = textRgb;
  let optASuccess = false;
  const strictSequence = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0];

  for (let i = 0; i < 15; i++) {
    if (calculateContrastRatio(optARgb, bgRgb) >= minContrast) {
      optASuccess = true;
      break;
    }
    const nextRgb = generateAccessibleColor(optARgb, bgRgb, large, targetContrast, minContrast, strictSequence);
    if (nextRgb[0] === optARgb[0] && nextRgb[1] === optARgb[1] && nextRgb[2] === optARgb[2]) {
      if (calculateContrastRatio(nextRgb, bgRgb) >= minContrast) optASuccess = true;
      break;
    }
    optARgb = nextRgb;
    if (calculateContrastRatio(optARgb, bgRgb) >= minContrast) {
      optASuccess = true;
      break;
    }
  }

  // Option B: Delta E relaxation up to 15.0
  const relaxedSequence = [
    0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 15.0
  ];
  const optBRgb = generateAccessibleColor(textRgb, bgRgb, large, targetContrast, minContrast, relaxedSequence);
  const optBSuccess = calculateContrastRatio(optBRgb, bgRgb) >= minContrast;

  if (optASuccess && optBSuccess) {
    const deltaA = calculateDeltaE2000(textRgb, optARgb);
    const deltaB = calculateDeltaE2000(textRgb, optBRgb);
    return deltaA <= deltaB ? { tunedRgb: optARgb, success: true } : { tunedRgb: optBRgb, success: true };
  } else if (optASuccess) {
    return { tunedRgb: optARgb, success: true };
  } else if (optBSuccess) {
    return { tunedRgb: optBRgb, success: true };
  }
  return { tunedRgb: rec.tunedRgb, success: false };
}

export function checkAndFixContrast(text, bg, options = {}) {
  const large = options.large || false;
  const mode = options.mode !== undefined ? options.mode : 1;
  const premium = options.premium || false;

  const textRgb = parseColor(text);
  const bgRgb = parseColor(bg);

  const currentContrast = calculateContrastRatio(textRgb, bgRgb);

  let minContrast, targetContrast;
  if (premium) {
    minContrast = large ? 4.5 : 7.0;
    targetContrast = minContrast;
  } else {
    minContrast = large ? 3.0 : 4.5;
    targetContrast = large ? 4.5 : 7.0;
  }

  if (currentContrast >= minContrast) {
    return {
      tunedColor: typeof text === "string" ? text : rgbToHex(textRgb),
      tunedRgb: textRgb,
      success: true,
      originalContrast: currentContrast,
      finalContrast: currentContrast,
      deltaE: 0.0,
      wcagLevel: getWcagLevel(textRgb, bgRgb, large)
    };
  }

  let result;
  if (mode === 0) {
    result = strategyStrict(textRgb, bgRgb, large, targetContrast, minContrast);
  } else if (mode === 2) {
    result = strategyRelaxed(textRgb, bgRgb, large, targetContrast, minContrast);
  } else {
    result = strategyRecursive(textRgb, bgRgb, large, targetContrast, minContrast);
  }

  const finalContrast = calculateContrastRatio(result.tunedRgb, bgRgb);
  const deltaE = calculateDeltaE2000(textRgb, result.tunedRgb);
  const wcagLevel = getWcagLevel(result.tunedRgb, bgRgb, large);

  return {
    tunedColor: rgbToHex(result.tunedRgb),
    tunedRgb: result.tunedRgb,
    success: result.success,
    originalContrast: currentContrast,
    finalContrast: finalContrast,
    deltaE: deltaE,
    wcagLevel: wcagLevel
  };
}
