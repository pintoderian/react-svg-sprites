import fs from 'fs';
import path from 'path';
import ora from 'ora';
import SVGSpriter from 'svg-sprite';
import { parse } from 'node-html-parser';
import { SpriteConfig } from './types';
import { getSvgFiles, loadSpriteConfig, cleanSvgAttributes } from './utils';

export const generateSprites = async () => {
  const spinner = ora('Loading configuration...').start();

  let config: SpriteConfig;
  try {
    config = await loadSpriteConfig();
  } catch (error) {
    spinner.fail((error as Error).message);
    process.exit(1);
  }

  const { iconDirs = [], iconComponents = [], outputDir } = config;

  if (!iconDirs.length && !iconComponents.length) {
    spinner.fail('No icon sources provided in sprites.config.ts');
    process.exit(1);
  }

  const spriter = new SVGSpriter({
    mode: {
      symbol: {
        sprite: path.join(outputDir, 'sprite.svg'),
      },
    },
  });

  const addedNames = new Set<string>();

  for (const dir of iconDirs) {
    spinner.text = `Processing directory: ${dir}`;
    const svgFiles = getSvgFiles(dir);

    for (const filePath of svgFiles) {
      try {
        const svgInput = fs.readFileSync(filePath, 'utf-8');
        const parsed = parse(svgInput);
        const svg = parsed.querySelector('svg');
        if (!svg) throw new Error('No <svg> tag');
        cleanSvgAttributes(svg);

        const name = path.basename(filePath, '.svg');
        if (!addedNames.has(name)) {
          spriter.add(name, null, svg.toString().trim());
          addedNames.add(name);
        }
      } catch (err) {
        spinner.fail(`Error parsing ${filePath}: ${(err as Error).message}`);
      }
    }
  }

  for (const { name, component } of iconComponents) {
    spinner.text = `Rendering icon component: ${name}`;
    try {
      const ReactDOMServer = await import('react-dom/server');
      const React = await import('react');

      const svgString = ReactDOMServer.renderToStaticMarkup(
        React.createElement(component)
      );
      const parsed = parse(svgString);
      const svg = parsed.querySelector('svg');
      if (!svg) throw new Error('Component did not return <svg>');
      cleanSvgAttributes(svg);

      if (!addedNames.has(name)) {
        spriter.add(name, null, svg.toString().trim());
        addedNames.add(name);
      }
    } catch (err) {
      spinner.fail(`Error rendering ${name}: ${(err as Error).message}`);
    }
  }

  spinner.text = 'Compiling final sprite...';
  spriter.compile((err: Error | null, result: any) => {
    if (err) {
      spinner.fail('Sprite generation failed.');
      console.error(err);
      return;
    }

    for (const mode in result) {
      for (const resource in result[mode]) {
        const outputPath = result[mode][resource].path;
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result[mode][resource].contents);
        spinner.succeed(`✅ Sprite created at ${outputPath}`);
      }
    }
  });
};
