#!/usr/bin/env node

require('esbuild-register/dist/node').register({
  target: 'node16',
  format: 'cjs',
  loader: 'tsx',
});

import { generateSprites } from './generate-sprites';
generateSprites();
