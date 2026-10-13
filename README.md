# cm-colors (JavaScript / TypeScript)

> **Accessible Color Science Library.** Automatically fix and tune colors to meet WCAG guidelines with minimal perceptual difference, powered by OKLCH color spaces and CIEDE2000 metrics.

Official JavaScript/TypeScript port of the Python [`cm-colors`](https://pypi.org/project/cm-colors/) library.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#)

---

## Features

* **Zero Dependencies**: Lightweight, self-contained mathematical color science.
* **Minimal Perceptual Change**: Uses **CIEDE2000** ($\Delta E_{00}$) to preserve brand identity while satisfying contrast.
* **OKLCH Optimization**: Navigates modern perceptual color spaces (OKLCH) via binary search and gradient descent.
* **Universal**: Runs in Node.js (ESM + CommonJS) and directly in browsers via CDN.
* **Fully Typed**: Shipped with complete TypeScript definitions (`index.d.ts`).

---

## Installation

### Via NPM
```bash
npm install cm-colors
```

### Via CDN (Browser Script)
```html
<script src="https://cdn.jsdelivr.net/npm/cm-colors/dist/cm-colors.global.js"></script>
```

---

## Quickstart

### ES Modules
```javascript
import { makeReadable, getContrast, getWcagLevel } from "cm-colors";

// Check and automatically fix contrast:
const result = makeReadable("#3b82f6", "#ffffff");
console.log(result);
// {
//   color: "#2b72e5",
//   originalContrast: 3.68,
//   finalContrast: 4.52,
//   deltaE: 5.92,
//   wcagLevel: "AA",
//   isReadable: true
// }
```

### CommonJS
```javascript
const { makeReadable, getContrast } = require("cm-colors");

const contrast = getContrast("#3b82f6", "#ffffff"); // 3.68
```

### Class-based API (Python Parity)
```javascript
import { ColorPair } from "cm-colors";

const pair = new ColorPair("#777777", "#ffffff");
console.log(pair.contrast);   // 4.48
console.log(pair.wcagLevel);  // "FAIL"
console.log(pair.isReadable); // "not readable"

const [tunedColor, success] = pair.makeReadable();
console.log(tunedColor);      // "#757575"
console.log(success);         // true
```

---

## API Reference

### `makeReadable(textColor, bgColor, options?)`
Automatically tunes `textColor` against `bgColor` to achieve target WCAG contrast with the smallest $\Delta E_{00}$ change.

**Options**:
* `large` *(boolean, default: false)*: Treat as large text (WCAG 3.0:1 threshold).
* `mode` *(number, default: 1)*:
  * `0`: Strict mode.
  * `1`: Default (Recursive). Best success rate for general web UI.
  * `2`: Relaxed mode with extended tolerance.
* `veryReadable` *(boolean, default: false)*: Target WCAG AAA compliance (7.0:1) instead of AA.

### `getContrast(textColor, bgColor)`
Returns the WCAG contrast ratio between two colors (e.g., `4.52`).

### `getWcagLevel(textColor, bgColor, large?)`
Returns `"AAA"`, `"AA"`, or `"FAIL"`.

### `deltaE(color1, color2)`
Returns the CIEDE2000 perceptual distance between two colors.

---

## CLI Usage (Build Steps & Auditing)

Run `cm-colors` directly via `npx` in your npm scripts or terminal:

```bash
# Fix a single color pair:
npx cm-colors fix "#3b82f6" "#ffffff"

# Check WCAG contrast ratio without modifying:
npx cm-colors contrast "#777777" "#ffffff" --json

# Audit & auto-fix an entire CSS file in your build step:
npx cm-colors fix src/styles.css -o dist/styles.css

# Fix CSS variables and rules in place:
npx cm-colors fix styles.css --write
```

---

## Authors & License

* Authored by [Lalitha A R](https://isrl.in/) ([comfort-mode-toolkit](https://github.com/comfort-mode-toolkit))
* Licensed under GNU General Public License v3.0 (GPL-3.0).
