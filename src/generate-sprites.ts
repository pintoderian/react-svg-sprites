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
 * @param iconDirs Raw .svg folders to include.
 * @param iconComponents Component groups or flat list of icons.
 * @param outputDir Where to write the generated sprite(s).
 * @param flatOutput If true, outputs everything to a single file in root.
 * @param spriteFileName Custom name for the output file (only used in flat mode).
 * @param optimize Run svgo to minify and clean SVGs.
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
    iconComponents = [],
    outputDir,
    flatOutput = false,
    spriteFileName = 'sprite',
    optimize: shouldOptimize = false,
    includeTitle = false,
  } = config;

  const flatFileName = `${spriteFileName}.svg`;

  const allGroups: { name: string; items: SpriteIconSource[] }[] = [];

  if (Array.isArray(iconComponents)) {
    allGroups.push({ name: spriteFileName, items: iconComponents });
  } else {
    for (const [group, items] of Object.entries(iconComponents)) {
      allGroups.push({ name: group, items });
    }
  }

  if (flatOutput && (allGroups.length > 1 || iconDirs.length > 1)) {
    spinner.warn(
      '[Warning] flatOutput is true but multiple sources detected — output may be overwritten!'
    );
  }

  const addedSymbols = new Set<string>();

  // Process component-based groups
  for (const group of allGroups) {
    const spritePath = flatOutput
      ? path.join(outputDir, flatFileName)
      : path.join(outputDir, group.name, `${group.name}.svg`);

    const spriter = new SVGSpriter({
      mode: {
        symbol: {
          sprite: spritePath,
        },
      },
    });

    for (const { name, component } of group.items) {
      spinner.text = `Rendering icon: ${name}`;

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
          spriter.add(name, null, svgContent);
          addedSymbols.add(name);
        }
      } catch (err) {
        spinner.fail(`Render error for "${name}": ${(err as Error).message}`);
      }
    }

    spriter.compile((err, result) => {
      if (err) {
        spinner.fail(`Error generating sprite for group: ${group.name}`);
        console.error(err);
        return;
      }

      for (const mode in result) {
        for (const res in result[mode]) {
          const outPath = result[mode][res].path;
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, result[mode][res].contents);
          spinner.succeed(`✅ Sprite created: ${outPath}`);
        }
      }
    });
  }

  // Process folders of raw SVG files
  for (const dir of iconDirs) {
    const folder = path.basename(dir);
    const files = getSvgFiles(dir);

    const spritePath = flatOutput
      ? path.join(outputDir, flatFileName)
      : path.join(outputDir, folder, `${folder}.svg`);

    const spriter = new SVGSpriter({
      mode: {
        symbol: {
          sprite: spritePath,
        },
      },
    });

    for (const filePath of files) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = parse(raw);
        const svg = parsed.querySelector('svg');
        if (!svg) throw new Error('Invalid SVG');

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
          spriter.add(fileName, null, svgContent);
          addedSymbols.add(fileName);
        }
      } catch (err) {
        spinner.fail(`Parse error for file: ${filePath}`);
        console.error(err);
      }
    }

    spriter.compile((err, result) => {
      if (err) {
        spinner.fail(`Error generating sprite for folder: ${folder}`);
        console.error(err);
        return;
      }

      for (const mode in result) {
        for (const res in result[mode]) {
          const outPath = result[mode][res].path;
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, result[mode][res].contents);
          spinner.succeed(`✅ Sprite created: ${outPath}`);
        }
      }
    });
  }
};
