import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    outDir: 'dist',
    format: ['cjs', 'esm'],
    platform: 'node',
    target: 'node16',
    splitting: false,
    clean: true,
    minify: false,
    sourcemap: false,
    banner: { js: '#!/usr/bin/env node' },
    external: ['esbuild'],
  },
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    platform: 'node',
    target: 'node16',
    splitting: false,
    clean: false,
    sourcemap: false,
    shims: false,
    external: ['esbuild'],
  },
]);
