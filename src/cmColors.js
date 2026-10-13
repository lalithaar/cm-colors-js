/**
 * CM-Colors JS - Bulk Optimization API
 * 100% full parity with cm_colors.core.cm_colors.make_readable_bulk.
 */

import { Color, ColorPair } from "./colors.js";
import { toHtmlBulk } from "./visualiser.js";
import { getWcagLevel } from "./contrast.js";
import { rgbintToString } from "./conversions.js";

export function makeReadableBulk(pairs, mode = 1, veryReadable = false, saveReport = false) {
  // Support options object
  if (typeof mode === "object" && mode !== null) {
    const opts = mode;
    mode = opts.mode !== undefined ? opts.mode : 1;
    veryReadable = opts.veryReadable !== undefined ? opts.veryReadable : Boolean(opts.very_readable);
    saveReport = opts.saveReport !== undefined ? opts.saveReport : Boolean(opts.save_report);
  }

  const results = [];
  const reportData = [];

  for (let i = 0; i < pairs.length; i++) {
    const item = pairs[i];
    let text, bg, large = false;

    if (Array.isArray(item)) {
      if (item.length === 3) {
        [text, bg, large] = item;
      } else {
        [text, bg] = item;
      }
    } else if (item && typeof item === "object") {
      text = item.text || item.text_color || item.fg;
      bg = item.bg || item.bg_color;
      large = Boolean(item.large || item.large_text);
    }

    const pair = new ColorPair(text, bg, large);

    if (!pair.isValid) {
      results.push([text, "invalid color"]);
      continue;
    }

    const [tunedColor] = pair.makeReadable(mode, veryReadable);
    const originalLevel = getWcagLevel(pair.text.rgb, pair.bg.rgb, large);
    let newLevel = "FAIL";

    if (tunedColor) {
      const newPair = new ColorPair(tunedColor, bg, large);
      const currentReadability = newPair.isReadable.toLowerCase();

      try {
        const cTuned = new Color(String(tunedColor));
        if (cTuned.isValid) {
          newLevel = getWcagLevel(cTuned.rgb, pair.bg.rgb, large);
        }
      } catch {
        // ignore
      }

      results.push([tunedColor, currentReadability]);
    } else {
      const currentReadability = pair.isReadable.toLowerCase();
      newLevel = originalLevel;
      results.push([text, currentReadability]);
    }

    if (saveReport) {
      let fgStr = String(text);
      let bgStr = String(bg);

      if (Array.isArray(text) && pair.text.isValid) {
        fgStr = rgbintToString(pair.text.rgb);
      }
      if (Array.isArray(bg) && pair.bg.isValid) {
        bgStr = rgbintToString(pair.bg.rgb);
      }

      let tunedFgStr = fgStr;
      if (tunedColor) {
        if (Array.isArray(tunedColor)) {
          tunedFgStr = rgbintToString(tunedColor);
        } else {
          tunedFgStr = String(tunedColor);
        }
      }

      reportData.push({
        fg: fgStr,
        bg: bgStr,
        tuned_fg: tunedFgStr,
        original_level: originalLevel,
        new_level: newLevel,
        selector: `Pair ${i + 1}`,
        file: "Bulk API"
      });
    }
  }

  if (saveReport && reportData.length > 0) {
    const reportPath = toHtmlBulk(reportData, "cm_colors_bulk_report.html");
    console.log(`Report generated: ${reportPath}`);
  }

  return results;
}

// Snake-case alias
export const make_readable_bulk = makeReadableBulk;
