<p align="center">
  <a href="https://www.npmjs.com/package/react-svg-sprites">
    <img src="https://img.shields.io/npm/v/react-svg-sprites?style=for-the-badge&color=0869B8" alt="NPM version">
  </a>
  <a href="https://x.com/dpintoec">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white&labelColor=007BCE" alt="Twitter">
  </a>
</p>

---

# 🧩 react-svg-sprites

A flexible SVG sprite generator and React icon component.  
Supports raw folders, grouped components, flat or structured output, and even SVGO optimization.

## 📦 Installation

```bash
npm install react-svg-sprites
```

## ⚙️ Configuration (`sprites.config.js`)

Create a `sprites.config.js` file in the root of your project:

```js
const path = require('path');
const { ArrowLeft, Folder, Timer } = require('lucide-react');

module.exports = {
  iconDirs: ['./public/icons', './assets/svgs'],

  iconComponents: {
    ui: [
      { name: 'ArrowLeft', component: ArrowLeft },
      { name: 'Timer', component: Timer },
    ],
    system: [{ name: 'Folder', component: Folder }],
  },

  outputDir: path.resolve(__dirname, 'public/sprites'),
  flatOutput: false,
  spriteFileName: 'icons',
  optimize: true,
  includeTitle: true,
};
```

### Available Options

| Option           | Type                                 | Description                                                          |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `iconDirs`       | `string[]`                           | Folders with `.svg` files.                                           |
| `iconComponents` | `Icon[]` or `Record<string, Icon[]>` | Grouped or flat list of icon components.                             |
| `outputDir`      | `string`                             | Directory where sprites will be generated.                           |
| `flatOutput`     | `boolean`                            | If true, outputs all sprites in root without folders.                |
| `spriteFileName` | `string`                             | Custom name for final file (only in flat mode). Default: `"sprite"`. |
| `optimize`       | `boolean`                            | Uses [SVGO](https://github.com/svg/svgo) to optimize SVGs.           |
| `includeTitle`   | `boolean`                            | Adds `<title>` tag to each symbol for accessibility.                 |

---

## 🚀 Sprite generation

```bash
npx react-svg-sprites
```

This command will:

- Parse all configured folders and components.
- Create one or more optimized sprite sheets in `outputDir`.

### Output example

```bash
pnpm generate:sprites

> codegea.com@0.2.0 generate:sprites C:\laragon\www\codegea.com
> npx react-svg-sprites

✔ ✅ Sprite created: C:\laragon\www\codegea.com\public\sprites\bigdata.svg
```

## 🧱 Usage in React

```tsx
import SpriteIcon from 'react-svg-sprites';

<SpriteIcon
  className="text-primary"
  file="/sprites/bigdata.svg"
  symbol="ArrowLeft"
  width={24}
  height={24}
/>;
```

### Output

```html
<svg class="text-primary" width="24" height="24" aria-hidden="true">
  <use href="/sprites/ui/ui.svg#ArrowLeft" />
</svg>
```

---

## 🧾 Props (SpriteIcon)

| Prop        | Type               | Required | Description                  |
| ----------- | ------------------ | -------- | ---------------------------- |
| `file`      | `string`           | ✅       | Path to the sprite file.     |
| `symbol`    | `string`           | ✅       | Symbol ID inside the sprite. |
| `width`     | `number \| string` | ✅       | Width of the icon.           |
| `height`    | `number \| string` | ✅       | Height of the icon.          |
| `className` | `string`           | ❌       | Optional class for styling.  |

---

## 🧑‍💻 Contributing

Feel free to open issues, suggest features or send pull requests.

---

### ☕ Like this project?

Support my work on [Ko-fi](https://ko-fi.com/dpinto) 💙
