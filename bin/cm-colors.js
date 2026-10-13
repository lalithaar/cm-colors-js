#!/usr/bin/env node

/**
 * CM-Colors CLI - Accessible Color Science
 * Command line interface for cm-colors matching Python cm_colors.cli.
 */

import fs from "node:fs";
import path from "node:path";
import {
  ColorPair,
  calculateContrastRatio,
  getWcagLevel,
  version
} from "../dist/index.js";

const args = process.argv.slice(2);

if (args.includes("-v") || args.includes("--version")) {
  console.log(`cm-colors ${version}`);
  process.exit(0);
}

if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  console.log(`
cm-colors - Accessible Color Science CLI (v${version})

Usage:
  cm-colors <fg> <bg> [options]
  cm-colors fix <fg> <bg> [options]
  cm-colors contrast <fg> <bg> [options]

Commands:
  fix <fg> <bg>       Fix color contrast to meet WCAG AA or AAA
  contrast <fg> <bg>  Check WCAG contrast ratio without modifying

Options:
  --large             Evaluate using large text thresholds (AA >= 3.0, AAA >= 4.5)
  --mode <0|1|2>      Strictness mode: 0=Strict, 1=Default (Recursive), 2=Relaxed
  --very-readable     Aim for AAA compliance (default: AA)
  --json              Output result as JSON
  -v, --version       Show version
  -h, --help          Show this help message

Examples:
  cm-colors "#777" "#fff"
  cm-colors fix "#3b82f6" "#ffffff" --very-readable
  cm-colors contrast "#777777" "#ffffff" --json
`);
  process.exit(0);
}

let command = "fix";
let positionalArgs = [];

if (args[0] === "fix" || args[0] === "contrast") {
  command = args[0];
  positionalArgs = args.slice(1);
} else {
  positionalArgs = args;
}

// Parse flags
let large = false;
let mode = 1;
let veryReadable = false;
let asJson = false;
let pairs = [];
let pairsFile = null;

const colors = [];

for (let i = 0; i < positionalArgs.length; i++) {
  const arg = positionalArgs[i];
  if (arg === "--large") {
    large = true;
  } else if (arg === "--json") {
    asJson = true;
  } else if (arg === "--very-readable" || arg === "--aaa") {
    veryReadable = true;
  } else if (arg === "--mode" && i + 1 < positionalArgs.length) {
    mode = parseInt(positionalArgs[++i], 10);
  } else if (arg === "--pairs" && i + 1 < positionalArgs.length) {
    pairs.push(positionalArgs[++i]);
  } else if (arg === "--file" && i + 1 < positionalArgs.length) {
    pairsFile = positionalArgs[++i];
  } else if (!arg.startsWith("-")) {
    colors.push(arg);
  }
}

if (pairsFile && fs.existsSync(pairsFile)) {
  const content = fs.readFileSync(pairsFile, "utf-8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        pairs.push(`${parts[0]} ${parts[1]}`);
      }
    }
  }
}

if (colors.length >= 2) {
  pairs.unshift(`${colors[0]} ${colors[1]}`);
}

if (pairs.length === 0) {
  console.error("Error: Please provide FG and BG arguments or use --pairs / --file. See --help.");
  process.exit(2);
}

const parsedPairs = pairs.map(p => {
  const parts = p.trim().split(/\s+/);
  return [parts[0], parts[1]];
});

if (command === "contrast") {
  const results = parsedPairs.map(([fg, bg]) => {
    try {
      const ratio = calculateContrastRatio(fg, bg);
      const level = getWcagLevel(fg, bg, large);
      const minRatio = large ? 3.0 : 4.5;
      const isPass = ratio >= minRatio;
      return {
        fg,
        bg,
        ratio: Math.round(ratio * 100) / 100,
        level,
        pass: isPass
      };
    } catch (e) {
      return { fg, bg, error: e.message, pass: false };
    }
  });

  const anyFail = results.some(r => !r.pass);

  if (asJson) {
    if (results.length === 1) {
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      const passed = results.filter(r => r.pass).length;
      console.log(
        JSON.stringify(
          {
            results,
            summary: { total: results.length, pass: passed, fail: results.length - passed }
          },
          null,
          2
        )
      );
    }
  } else {
    for (const r of results) {
      if (r.error) {
        console.log(`${r.fg} on ${r.bg} -> ERROR: ${r.error}`);
      } else {
        const status = r.pass ? "[PASS]" : "[FAIL]";
        console.log(`${status} ${r.fg} on ${r.bg} -> Ratio: ${r.ratio}:1 | Level: ${r.level}`);
      }
    }
  }

  process.exit(anyFail ? 1 : 0);
} else {
  // fix command
  const results = parsedPairs.map(([fg, bg]) => {
    try {
      const pair = new ColorPair(fg, bg, large);
      if (!pair.isValid) {
        return { fg, bg, error: pair.errors.join("; "), success: false };
      }
      const [fixed, success] = pair.makeReadable(mode, veryReadable);
      const ratio = calculateContrastRatio(fixed, bg);
      const level = getWcagLevel(fixed, bg, large);
      return {
        fg,
        bg,
        fixed,
        ratio: Math.round(ratio * 100) / 100,
        level,
        success
      };
    } catch (e) {
      return { fg, bg, error: e.message, success: false };
    }
  });

  const anyFail = results.some(r => !r.success);

  if (asJson) {
    if (results.length === 1) {
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      const succeeded = results.filter(r => r.success).length;
      console.log(
        JSON.stringify(
          {
            results,
            summary: { total: results.length, fixed: succeeded, failed: results.length - succeeded }
          },
          null,
          2
        )
      );
    }
  } else {
    for (const r of results) {
      if (r.error) {
        console.log(`${r.fg} on ${r.bg} -> ERROR: ${r.error}`);
      } else {
        const status = r.success ? "[FIXED]" : "[FAIL]";
        console.log(`${status} ${r.fg} on ${r.bg} -> Fixed: ${r.fixed} | Ratio: ${r.ratio}:1 | Level: ${r.level}`);
      }
    }
  }

  process.exit(anyFail ? 1 : 0);
}
