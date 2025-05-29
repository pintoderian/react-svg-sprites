import fs from 'fs';
import type { SpriteConfig } from './types';
import * as esbuild from 'esbuild';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

/**
 * Load sprites.config.ts or .js interchangeably.
 * Supports Windows, macOS, Linux.
 *
 * @returns SpriteConfig object with validated settings
 */
export const loadSpriteConfig = async (): Promise<SpriteConfig> => {
  const cwd = process.cwd();
  const tsPath = path.resolve(cwd, 'sprites.config.ts');
  const jsPath = path.resolve(cwd, 'sprites.config.js');
  let config: any;

  if (fs.existsSync(tsPath)) {
    const source = fs.readFileSync(tsPath, 'utf8');
    const { code } = await esbuild.transform(source, {
      loader: 'ts',
      format: 'cjs',
      target: 'node16',
      sourcemap: false,
    });

    const hash = crypto.createHash('sha1').update(tsPath).digest('hex');
    const tempFile = path.join(os.tmpdir(), `sprites-config-${hash}.cjs`);
    fs.writeFileSync(tempFile, code, 'utf8');

    config = require(tempFile);
  } else if (fs.existsSync(jsPath)) {
    config = require(jsPath);
  } else {
    throw new Error(
      '❌ sprites.config.ts or sprites.config.js not found in project root.'
    );
  }

  // If it was an ES module with default export, unwrap it
  config = config.default ?? config;

  if (!config.outputDir) {
    throw new Error('❌ Missing required "outputDir" in your config.');
  }

  return config as SpriteConfig;
};

/**
 * Recursively collects all `.svg` files from a directory.
 *
 * @param dir Target directory
 * @param files (internal) accumulator
 * @returns Array of absolute .svg file paths
 */
export const getSvgFiles = (dir: string, files: string[] = []): string[] => {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getSvgFiles(fullPath, files);
    } else if (path.extname(fullPath).toLowerCase() === '.svg') {
      files.push(fullPath);
    }
  }

  return files;
};

/**
 * Removes unnecessary attributes from a <svg> tag to clean up output.
 *
 * @param svg Root <svg> tag from node-html-parser
 */
export const cleanSvgAttributes = (svg: any): void => {
  const attrsToRemove = [
    'xmlns',
    'xmlns:xlink',
    'xml:space',
    'version',
    'width',
    'height',
    'style',
    'id',
  ];

  for (const attr of attrsToRemove) {
    svg.removeAttribute(attr);
  }
};
