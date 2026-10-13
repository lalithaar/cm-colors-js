# Contributing to cm-colors (JavaScript / TypeScript) 🌈

*Want to help make the web more accessible? Awesome! Here's how to jump in.*

This project is the JavaScript/TypeScript port of `cm-colors`. It provides mathematical color space transformations, WCAG contrast calculation, and CIEDE2000 optimization with zero runtime dependencies.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/lalithaar/cm-colors-js.git
cd cm-colors-js

# Install dependencies (esbuild for bundling)
npm install

# Run the test suite
npm test

# Build distributions (ESM, CommonJS, Browser IIFE)
npm run build
```

## Guidelines

- **Zero Runtime Dependencies**: The core math in `src/` must remain dependency-free.
- **100% Parity with PyPI**: Color science algorithms (Oklch, CIEDE2000, WCAG luminance) must match the reference mathematical model bit-for-bit.
- **Full Type Safety**: Any API additions must include matching TypeScript declarations in `index.d.ts`.
