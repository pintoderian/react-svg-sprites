import fs from 'fs';
import type { SpriteConfig } from './types';
import * as esbuild from 'esbuild';
import path from 'path';

const ModuleConstructor = require('module') as {
  _nodeModulePaths: (from: string) => string[];
  new (id: string, parent: any): {
    exports: any;
    paths: string[];
    _compile: (code: string, filename: string) => void;
  };
};
/**
 * Load sprites.config.ts or .js interchangeably.
 * Supports Windows, macOS, Linux.
 *
 * @returns SpriteConfig object with validated settings
 */
export const loadSpriteConfig = (): SpriteConfig => {
  const cwd = process.cwd();
  const tsPath = path.resolve(cwd, 'sprites.config.ts');
  const jsPath = path.resolve(cwd, 'sprites.config.js');
  let code: string, filename: string;

  if (fs.existsSync(tsPath)) {
    const source = fs.readFileSync(tsPath, 'utf8');
    const result = esbuild.transformSync(source, {
      loader: 'ts',
      format: 'cjs',
      target: 'node16',
    });
    code = result.code;
    filename = tsPath;
  } else if (fs.existsSync(jsPath)) {
    code = fs.readFileSync(jsPath, 'utf8');
    filename = jsPath;
  } else {
    throw new Error(
      '❌ sprites.config.ts or sprites.config.js not found in project root.'
    );
  }

  const m = new ModuleConstructor(filename, null);
  m.paths = ModuleConstructor._nodeModulePaths(cwd);
  m._compile(code, filename);

  const config = m.exports.default ?? m.exports;
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
