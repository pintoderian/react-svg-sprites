import fs from 'fs';
import path from 'path';
import type { SpriteConfig } from './types';

/**
 * Loads the user's sprites.config.ts file dynamically.
 * @returns Parsed SpriteConfig object
 */
export const loadSpriteConfig = async (): Promise<SpriteConfig> => {
  const configPath = path.resolve(process.cwd(), 'sprites.config.ts');
  if (!fs.existsSync(configPath)) {
    throw new Error('❌ sprites.config.ts not found in the project root.');
  }

  const config = (await import(configPath)).default as SpriteConfig;

  if (!config.outputDir) {
    throw new Error('❌ Missing required "outputDir" in sprites.config.ts.');
  }

  return config;
};

/**
 * Recursively gathers all .svg files from a given directory.
 * @param dir Directory to scan for SVG files
 * @param files Accumulator array (used internally)
 * @returns Array of absolute file paths
 */
export const getSvgFiles = (dir: string, files: string[] = []): string[] => {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getSvgFiles(fullPath, files);
    } else if (path.extname(fullPath) === '.svg') {
      files.push(fullPath);
    }
  }
  return files;
};

/**
 * Removes unnecessary attributes from an SVG tag to clean up the sprite.
 * @param svg The root <svg> element parsed by node-html-parser
 */
export const cleanSvgAttributes = (svg: any): void => {
  const attributesToRemove = [
    'xmlns',
    'xmlns:xlink',
    'xml:space',
    'version',
    'width',
    'height',
    'style',
    'id',
  ];
  for (const attr of attributesToRemove) {
    svg.removeAttribute(attr);
  }
};
