import fs from 'node:fs';
import { build } from 'esbuild';

const banner = `/*!
 * cm-colors v1.1.1 (JS/TS Port)
 * Accessible Color Science Library
 * Authored by Lalitha A R (https://isrl.in/)
 * Licensed under GPL-3.0
 */
`;

fs.mkdirSync('dist', { recursive: true });

// 1. ESM
await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  external: ['fs', 'node:fs', 'path', 'node:path'],
  banner: { js: banner },
  target: ['es2020']
});

// 2. CommonJS
await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.cjs',
  bundle: true,
  format: 'cjs',
  platform: 'node',
  external: ['fs', 'node:fs', 'path', 'node:path'],
  banner: { js: banner },
  target: ['es2020', 'node16']
});

// 3. Browser IIFE
await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/cm-colors.global.js',
  bundle: true,
  format: 'iife',
  globalName: 'CMColors',
  platform: 'browser',
  external: ['fs', 'node:fs', 'path', 'node:path'],
  banner: { js: banner },
  target: ['es2020']
});

fs.copyFileSync('index.d.ts', 'dist/index.d.ts');

console.log('Build complete! Created dist/index.js (ESM), dist/index.cjs (CJS), and dist/cm-colors.global.js (IIFE).');
