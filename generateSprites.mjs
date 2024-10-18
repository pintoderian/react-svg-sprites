import fs from 'fs';
import { parse } from 'node-html-parser';
import path from 'path';
import SVGSpriter from 'svg-sprite';

const getAllSvgFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllSvgFiles(filePath, arrayOfFiles);
    } else if (path.extname(filePath) === '.svg') {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

const generateSprites = () => {
  const configPath = path.resolve(process.cwd(), 'sprites.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: The sprites.config.json file was not found in the project root.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const { iconsFolders, outputDir } = config;

  iconsFolders.forEach((folderPath) => {
    const outputPath = path.join(outputDir, path.basename(folderPath), `${path.basename(folderPath)}-sprite.svg`);
    const spriter = new SVGSpriter({
      mode: {
        symbol: {
          sprite: outputPath,
        },
      },
    });

    const svgFiles = getAllSvgFiles(folderPath);
    const addedFiles = new Set();

    svgFiles.forEach((filePath) => {
      try {
        const svgInput = fs.readFileSync(filePath, 'utf-8');
        const svgFile = parse(svgInput);

        const svg = svgFile.querySelector("svg");
        if (!svg) throw new Error("No SVG element");

        svg.removeAttribute("xmlns");
        svg.removeAttribute("xml:space");
        svg.removeAttribute("xmlns:xlink");
        svg.removeAttribute("version");
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.removeAttribute("style");
        svg.removeAttribute("id");

        const svgContent = svg.toString().trim();
        const fileNameWithoutExt = path.basename(filePath, '.svg');

        if (!addedFiles.has(fileNameWithoutExt)) {
          spriter.add(fileNameWithoutExt, null, svgContent);
          addedFiles.add(fileNameWithoutExt);
        } else {
          console.warn(`Duplicate SVG ignored: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error parsing SVG file: ${filePath}`, error);
      }
    });

    spriter.compile((error, result) => {
      if (error) {
        console.error('Error generating sprite:', error);
        return;
      }

      for (const mode in result) {
        for (const resource in result[mode]) {
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, result[mode][resource].contents);
          console.log(`Generated sprite: ${outputPath}`);
        }
      }
    });
  });
};

export default generateSprites;
