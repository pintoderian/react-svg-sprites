import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { parse } from 'node-html-parser';
import type { SpriteConfig } from './types';

/**
 * Dynamically loads and parses sprites.config.ts from the root directory.
 * Supports Windows, macOS, Linux.
 *
 * @returns SpriteConfig object with validated settings
 */
export const loadSpriteConfig = async (): Promise<SpriteConfig> => {
  const configPath = path.resolve(process.cwd(), 'sprites.config.js');

  if (!fs.existsSync(configPath)) {
    throw new Error('❌ sprites.config.js not found in the project root.');
  }

  const config = require(configPath) as SpriteConfig;

  if (!config.outputDir) {
    throw new Error('❌ Missing required "outputDir" in sprites.config.js.');
  }

  return config;
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
