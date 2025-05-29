import fs from 'fs';
import path from 'path';
import type { SpriteConfig } from './types';
import { pathToFileURL } from 'url';

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
  let filePath: string;

  if (fs.existsSync(tsPath)) {
    filePath = tsPath;
  } else if (fs.existsSync(jsPath)) {
    filePath = jsPath;
  } else {
    throw new Error(
      '❌ sprites.config.ts or sprites.config.js not found in project root.'
    );
  }

  const fileUrl = pathToFileURL(filePath).href;

  const module = await import(fileUrl);
  const config = module.default ?? (module as SpriteConfig);

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
