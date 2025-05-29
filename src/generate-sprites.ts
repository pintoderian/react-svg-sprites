import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { parse } from 'node-html-parser';
import SVGSpriter from 'svg-sprite';
import { optimize } from 'svgo';
import { loadSpriteConfig, getSvgFiles, cleanSvgAttributes } from './utils';
import type { SpriteConfig, SpriteIconSource } from './types';

/**
 * Generates SVG sprite sheets from folders and/or grouped components.
 *
 * @param iconDirs Folders with raw .svg icons.
 * @param iconComponents Component groups or flat list of icons.
 * @param outputDir Where to write the generated sprite(s).
 * @param flatOutput If true, outputs everything to the root directory.
 * @param spriteFileName Name to use for iconComponents output (only in flat mode).
 * @param optimize Run SVGO to minify and clean SVGs.
 * @param includeTitle Add <title> to each symbol for accessibility.
 */
export const generateSprites = async () => {
  const spinner = ora('Loading config...').start();

  let config: SpriteConfig;
  try {
    config = await loadSpriteConfig();
  } catch (err) {
    spinner.fail((err as Error).message);
    process.exit(1);
  }

  const {
    iconDirs = [],
    iconComponents,
    outputDir,
    flatOutput = false,
    spriteFileName = 'sprite',
    optimize: shouldOptimize = false,
    includeTitle = false,
  } = config;

  const allGroups: { name: string; items: SpriteIconSource[] }[] = [];

  if (Array.isArray(iconComponents)) {
    allGroups.push({ name: spriteFileName, items: iconComponents });
  } else if (
    typeof iconComponents === 'object' &&
    !Array.isArray(iconComponents) &&
    iconComponents !== null
  ) {
    for (const [group, items] of Object.entries(iconComponents)) {
      if (Array.isArray(items)) {
        allGroups.push({ name: group, items });
      }
    }
  }

  const addedSymbols = new Set<string>();

  for (const group of allGroups) {
    if (!group.items || group.items.length === 0) {
      continue;
    }

    const spriteFile =
      !flatOutput && allGroups.length === 1
        ? `${spriteFileName}.svg`
        : `${group.name}.svg`;

    const spriteDir = flatOutput ? outputDir : path.join(outputDir, group.name);

    const spriter = new SVGSpriter({
      dest: spriteDir,
      mode: {
        symbol: {
          sprite: spriteFile,
          dest: '.',
        },
      },
    });

    for (const { name, component } of group.items) {
      spinner.text = `Rendering component icon: ${name}`;

      try {
        const ReactDOMServer = await import('react-dom/server');
        const React = await import('react');

        const svgHTML = ReactDOMServer.renderToStaticMarkup(
          React.createElement(component)
        );

        const parsed = parse(svgHTML);
        const svg = parsed.querySelector('svg');
        if (!svg) throw new Error('Component must return an <svg> element.');

        cleanSvgAttributes(svg);

        if (includeTitle) {
          svg.prepend(`<title>${name}</title>`);
        }

        let svgContent = svg.toString().trim();

        if (shouldOptimize) {
          const result = optimize(svgContent, { multipass: true });
          svgContent = 'data' in result ? result.data : svgContent;
        }

        if (!addedSymbols.has(name)) {
          spriter.add(`${name}.svg`, null, svgContent);
          addedSymbols.add(name);
        }
      } catch (err) {
        spinner.fail(`Render error: ${name} → ${(err as Error).message}`);
      }
    }

    spriter.compile((err, result) => {
      if (err) {
        spinner.fail(`Sprite generation failed for group: ${group.name}`);
        console.error(err);
        return;
      }

      for (const mode in result) {
        for (const file in result[mode]) {
          const outPath = result[mode][file].path;
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, result[mode][file].contents);
          spinner.succeed(`✅ Sprite created: ${outPath}`);
        }
      }
    });
  }

  // Procesar iconDirs (archivos .svg crudos)
  for (const dir of iconDirs) {
    const folder = path.basename(dir);
    const files = getSvgFiles(dir);

    const spriteDir = flatOutput ? outputDir : path.join(outputDir, folder);
    const spriteFile = `${folder}.svg`;

    const spriter = new SVGSpriter({
      dest: spriteDir,
      mode: {
        symbol: {
          sprite: spriteFile,
          dest: '.',
        },
      },
    });

    for (const filePath of files) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = parse(raw);
        const svg = parsed.querySelector('svg');
        if (!svg) throw new Error('Invalid SVG file');

        cleanSvgAttributes(svg);

        const fileName = path.basename(filePath, '.svg');

        if (includeTitle) {
          svg.prepend(`<title>${fileName}</title>`);
        }

        let svgContent = svg.toString().trim();

        if (shouldOptimize) {
          const result = optimize(svgContent, { multipass: true });
          svgContent = 'data' in result ? result.data : svgContent;
        }

        if (!addedSymbols.has(fileName)) {
          spriter.add(`${fileName}.svg`, null, svgContent);
          addedSymbols.add(fileName);
        }
      } catch (err) {
        spinner.fail(`Parse error: ${filePath}`);
        console.error(err);
      }
    }

    spriter.compile((err, result) => {
      if (err) {
        spinner.fail(`Sprite generation failed for folder: ${folder}`);
        console.error(err);
        return;
      }

      for (const mode in result) {
        for (const file in result[mode]) {
          const outPath = result[mode][file].path;
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, result[mode][file].contents);
          spinner.succeed(`✅ Sprite created: ${outPath}`);
        }
      }
    });
  }
};
