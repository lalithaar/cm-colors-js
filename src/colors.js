/**
 * CM-Colors JS - Color & ColorPair Classes
 * 100% full parity with cm_colors.core.colors.
 */

import { parseColorToRgb, detectColorFormat, formatColor } from "./colorParser.js";
import { getWcagLevel } from "./contrast.js";
import { rgbintToString } from "./conversions.js";
import { checkAndFixContrast } from "./optimisation.js";
import { toConsole, toHtmlBulk } from "./visualiser.js";

export class Color {
  constructor(colorInput, backgroundContext = null) {
    this.original = colorInput;
    this.background_context = backgroundContext;
    this.backgroundContext = backgroundContext;
    this._rgb = null;
    this._error = null;
    this._parsed = false;
    this._format = "unknown";

    this._parse();
  }

  _parse() {
    if (this._parsed) return;

    try {
      this._format = detectColorFormat(this.original);
      let bgRgb = null;
      if (this.background_context && this.background_context.isValid) {
        bgRgb = this.background_context.rgb;
      }
      this._rgb = parseColorToRgb(this.original, bgRgb);
      this._parsed = true;
    } catch (e) {
      this._error = e.message;
      this._parsed = true;
    }
  }

  get is_valid() {
    return this._rgb !== null;
  }

  get isValid() {
    return this.is_valid;
  }

  get rgb() {
    return this._rgb;
  }

  get error() {
    return this._error;
  }

  get format() {
    return this._format;
  }

  to_hex() {
    if (!this.isValid) return null;
    const [r, g, b] = this._rgb;
    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");
    return `#${hexR}${hexG}${hexB}`;
  }

  toHex() {
    return this.to_hex();
  }

  toString() {
    return this.toHex() || String(this.original);
  }
}

export class ColorPair {
  constructor(textColor, bgColor, largeText = false) {
    this.bg = new Color(bgColor);
    this.text = new Color(textColor, this.bg);
    this.large = Boolean(largeText);
  }

  get is_valid() {
    return this.text.isValid && this.bg.isValid;
  }

  get isValid() {
    return this.is_valid;
  }

  get errors() {
    const errs = [];
    if (!this.text.isValid) errs.push(`Text: ${this.text.error}`);
    if (!this.bg.isValid) errs.push(`Background: ${this.bg.error}`);
    return errs;
  }

  get is_readable() {
    if (!this.isValid) return "Not Readable";
    const level = getWcagLevel(this.text.rgb, this.bg.rgb, this.large);
    if (level === "AAA") {
      return "Very Readable";
    } else if (level === "AA" || level === "AA Large") {
      return "Readable";
    } else {
      return "Not Readable";
    }
  }

  get isReadable() {
    return this.is_readable;
  }

  make_readable(mode = 1, very_readable = false, show = false, save_report = false) {
    // Also support options object: make_readable({ mode, very_readable, show, save_report })
    if (typeof mode === "object" && mode !== null) {
      const opts = mode;
      mode = opts.mode !== undefined ? opts.mode : 1;
      very_readable = opts.very_readable !== undefined ? opts.very_readable : Boolean(opts.veryReadable);
      show = Boolean(opts.show);
      save_report = opts.save_report !== undefined ? opts.save_report : Boolean(opts.saveReport);
    }

    if (!this.isValid) {
      return [null, false];
    }

    const premium = Boolean(very_readable);
    const [tunedRgbStr, success] = checkAndFixContrast(
      this.text._rgb,
      this.bg._rgb,
      this.large,
      mode,
      premium
    );

    let result = [tunedRgbStr, success];

    // Always convert to original format, matching Python
    if (tunedRgbStr) {
      try {
        const c = new Color(tunedRgbStr);
        if (c.isValid) {
          const formattedColor = formatColor(c.rgb, this.text._format);
          result = [formattedColor, success];
        }
      } catch {
        // Keep tunedRgbStr
      }
    }

    const [tunedColor] = result;

    if (show || save_report) {
      const originalLevel = getWcagLevel(this.text.rgb, this.bg.rgb, this.large);
      let newLevel = "FAIL";

      if (tunedColor) {
        try {
          const cTuned = new Color(String(tunedColor));
          if (cTuned.isValid) {
            newLevel = getWcagLevel(cTuned.rgb, this.bg.rgb, this.large);
          }
        } catch {
          // ignore
        }
      }

      if (show) {
        const fgHex = this.text.toHex();
        const bgHex = this.bg.toHex();
        let tunedHex = tunedColor;
        if (Array.isArray(tunedColor) && tunedColor.length === 3) {
          const [r, g, b] = tunedColor;
          tunedHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        } else {
          try {
            const c = new Color(String(tunedColor));
            if (c.isValid) tunedHex = c.toHex();
          } catch {
            // ignore
          }
        }

        if (
          typeof fgHex === "string" &&
          typeof tunedHex === "string" &&
          fgHex.toLowerCase() === tunedHex.toLowerCase()
        ) {
          console.log("Colors are already accessible. No changes needed.");
        } else {
          toConsole(fgHex, bgHex, tunedHex, originalLevel, newLevel);
        }
      }

      if (save_report) {
        const pairData = {
          fg: this.text.isValid ? rgbintToString(this.text.rgb) : "Invalid",
          bg: this.bg.isValid ? rgbintToString(this.bg.rgb) : "Invalid",
          tuned_fg: String(tunedColor),
          original_level: originalLevel,
          new_level: newLevel,
          selector: "Manual Check",
          file: "JS API"
        };
        const reportPath = toHtmlBulk([pairData], "cm_colors_quick_report.html");
        console.log(`Report generated: ${reportPath}`);
      }
    }

    return result;
  }

  makeReadable(mode = 1, veryReadable = false, show = false, saveReport = false) {
    return this.make_readable(mode, veryReadable, show, saveReport);
  }
}
