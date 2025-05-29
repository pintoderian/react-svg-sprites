import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    outDir: 'dist',
    splitting: false,
    clean: true,
    format: ['cjs'],
    platform: 'node',
    target: 'node16',
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    noExternal: ['esbuild-register'],
    external: ['esbuild'],
  },
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    splitting: false,
    clean: false,
    format: ['esm', 'cjs'],
    dts: true,
    target: 'node16',
    sourcemap: false,
    shims: false,
    external: ['esbuild-register', 'esbuild'],
  },
]);
