import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

// Recursively get .svg files from directories
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

// Dynamically import a .ts config file
export const loadSpriteConfig = async () => {
  const configPath = path.resolve(process.cwd(), 'sprites.config.ts');
  if (!fs.existsSync(configPath)) {
    throw new Error('sprites.config.ts not found.');
  }
  const config = (await import(configPath)).default;
  return config;
};

// Clean unnecessary attributes from <svg>
export const cleanSvgAttributes = (svg: any) => {
  ['xmlns', 'width', 'height', 'style', 'id', 'version'].forEach((attr) =>
    svg.removeAttribute(attr)
  );
};
