import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  target: 'node16',
  splitting: false,
  clean: true,
  minify: false,
  shims: false,
  outDir: 'dist',
});
