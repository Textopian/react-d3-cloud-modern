# react-d3-cloud-modern

**Beautiful, interactive word clouds for React, in one line of JSX.**

[![npm version](https://img.shields.io/npm/v/react-d3-cloud-modern?color=4f46e5)](https://www.npmjs.com/package/react-d3-cloud-modern)
[![types included](https://img.shields.io/npm/types/react-d3-cloud-modern?color=0ea5e9)](#typescript)
[![React 16.8–19](https://img.shields.io/badge/react-16.8%20%E2%80%93%2019-14b8a6)](#compatibility)
[![license MIT](https://img.shields.io/npm/l/react-d3-cloud-modern?color=64748b)](LICENSE)

![A word cloud rendered by react-d3-cloud-modern](https://raw.githubusercontent.com/Textopian/react-d3-cloud-modern/main/docs/hero.png)

Give it a list of words with weights, and it lays them out with
[d3-cloud](https://github.com/jasondavies/d3-cloud), the classic Wordle-style
algorithm, so that bigger means more important. It is a maintained, modernized
fork of [react-d3-cloud](https://github.com/Yoctol/react-d3-cloud) and a
drop-in replacement for it.

- **Works with your React.** 16.8 through 19, with ES module and CommonJS builds.
- **Typed.** TypeScript definitions are included; nothing extra to install.
- **Small and audited.** Four runtime dependencies, audited at every release.
  Every version is published from CI with
  [npm provenance](https://docs.npmjs.com/generating-provenance-statements).
- **Responsive.** The cloud scales to the width of its container.

## Quick start

```sh
npm install react-d3-cloud-modern
```

```jsx
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'React', value: 2500 },
  { text: 'words', value: 1600 },
  { text: 'cloud', value: 1200 },
  { text: 'beautiful', value: 900 },
  { text: 'simple', value: 600 },
  { text: 'fast', value: 400 },
];

export default function App() {
  return <WordCloud data={words} />;
}
```

That's all you need. A few things to know:

- **`value` sets the size.** By default a word is `√value` pixels tall, so
  `400` → 20px and `2500` → 50px. If your numbers are small counts, like 1–50,
  see [Size words to your data](#size-words-to-your-data).
- **Words that don't fit are left out,** so a large or crowded cloud may show
  fewer words than you passed in. More on that in
  [Troubleshooting](#troubleshooting).
- **It renders in the browser.** For Next.js and other server rendering, see
  [Next.js and SSR](#nextjs-and-ssr).

## Recipes

Each recipe changes one thing. Mix and match.

### Size words to your data

Scale your values into the range of font sizes you want:

```jsx
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'apples', value: 42 },
  { text: 'pears', value: 17 },
  { text: 'plums', value: 9 },
  { text: 'figs', value: 3 },
];
const max = Math.max(...words.map((w) => w.value));
const fontSize = (word) => 14 + (word.value / max) * 58; // 14px–72px

export default function App() {
  return <WordCloud data={words} fontSize={fontSize} />;
}
```

### Colors, fonts and rotation

```jsx
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'indigo', value: 2500 },
  { text: 'teal', value: 1600 },
  { text: 'amber', value: 1200 },
  { text: 'rose', value: 900 },
];
const palette = ['#4f46e5', '#0d9488', '#d97706', '#e11d48'];
const fill = (word, index) => palette[index % palette.length];

export default function App() {
  return (
    <WordCloud
      data={words}
      font="Georgia"
      fontWeight="bold"
      fill={fill}
      rotate={0}
      padding={4}
    />
  );
}
```

- Use `rotate={0}` for all-horizontal words, which read most easily. Use
  `rotate={(word, index) => (index % 3 === 0 ? 90 : 0)}` to mix in vertical
  ones.
- `fill` also accepts a single color: `fill={() => '#334155'}`.

### Click and hover

Handlers receive the DOM event and the word, including its layout position:

```jsx
import { useCallback, useState } from 'react';
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'click', value: 2500 },
  { text: 'any', value: 1600 },
  { text: 'word', value: 1200 },
];

// Handlers that don't need state can live outside the component.
const highlight = (event) => (event.target.style.opacity = '0.6');
const unhighlight = (event) => (event.target.style.opacity = '1');

export default function App() {
  const [picked, setPicked] = useState(null);
  const onWordClick = useCallback((event, word) => setPicked(word.text), []);
  return (
    <>
      <p>{picked ? `You picked “${picked}”` : 'Pick a word'}</p>
      <WordCloud
        data={words}
        rotate={0}
        onWordClick={onWordClick}
        onWordMouseOver={highlight}
        onWordMouseOut={unhighlight}
      />
    </>
  );
}
```

`useCallback` is not decoration here. See why in the next recipe.

### Keep the layout steady

`<WordCloud>` compares its props deeply and only redoes the layout when
something actually changed. Data arrays are compared by content, so
rebuilding `data` on every render is fine. **Functions are compared by
identity**, though, so an inline arrow function like `fill={() => 'red'}`
counts as a new prop on every render. The words then get rearranged whenever
the parent re-renders. Define functions outside the component, or wrap them in
`useCallback`:

```jsx
import { useCallback, useState } from 'react';
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'steady', value: 2500 },
  { text: 'calm', value: 1600 },
  { text: 'stable', value: 1200 },
];

export default function App() {
  const [clicks, setClicks] = useState(0);
  const onWordClick = useCallback(() => setClicks((n) => n + 1), []);
  return (
    <>
      <p>Clicks: {clicks} (the layout stays put)</p>
      <WordCloud data={words} rotate={0} onWordClick={onWordClick} />
    </>
  );
}
```

### The same layout every time

By default, words start at random positions and get random rotations, so each
page load looks a little different. For a repeatable cloud, like screenshots,
reports, or tests, pass a fixed `rotate` and a seeded `random`:

```jsx
import WordCloud from 'react-d3-cloud-modern';

const words = [
  { text: 'same', value: 2500 },
  { text: 'every', value: 1600 },
  { text: 'time', value: 1200 },
];

// Tiny seeded random generator (mulberry32).
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function App() {
  return <WordCloud data={words} rotate={0} random={seeded(42)} />;
}
```

### Next.js and SSR

The layout measures text with a browser canvas, so the cloud must render on
the client. On the server it throws `document is not defined`. In the Next.js
App Router, load it client-side only:

```jsx
'use client';

import dynamic from 'next/dynamic';

const WordCloud = dynamic(() => import('react-d3-cloud-modern'), {
  ssr: false,
});

export default function Cloud({ words }) {
  return <WordCloud data={words} />;
}
```

Anywhere else, render it after mount:

```jsx
import { useEffect, useState } from 'react';
import WordCloud from 'react-d3-cloud-modern';

export default function Cloud({ words }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <WordCloud data={words} /> : null;
}
```

### TypeScript

Types ship with the package. To type your own props or helpers, take them
from the component:

```tsx
import type { ComponentProps } from 'react';
import WordCloud from 'react-d3-cloud-modern';

type WordCloudProps = ComponentProps<typeof WordCloud>;
type Word = WordCloudProps['data'][number]; // { text: string; value: number }

const words: Word[] = [{ text: 'typed', value: 900 }];
```

## API

`<WordCloud>` accepts these props. Only `data` is required.

Accessor props take either a constant or a function
`(word, index) => value`. Inside an accessor, `word` is your datum plus the
layout fields d3-cloud adds (`size`, `x`, `y`, `rotate`, `font`, …).

| Prop              | Type                                                        | Default                                    | What it does                                                                                                          |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `data`            | `{ text: string; value: number }[]`                         | (required)                                 | The words and their weights.                                                                                          |
| `width`           | `number`                                                    | `700`                                      | Layout width in px. The SVG scales to its container; this sets the layout's proportions and how much room words have. |
| `height`          | `number`                                                    | `600`                                      | Layout height in px.                                                                                                  |
| `font`            | `string \| (word, i) => string`                             | `'serif'`                                  | Font family.                                                                                                          |
| `fontStyle`       | `string \| (word, i) => string`                             | `'normal'`                                 | CSS `font-style`, e.g. `'italic'`.                                                                                    |
| `fontWeight`      | `string \| number \| (word, i) => string \| number`         | `'normal'`                                 | CSS `font-weight`, e.g. `'bold'` or `700`.                                                                            |
| `fontSize`        | `number \| (word, i) => number`                             | `(word) => Math.sqrt(word.value)`          | Font size in px.                                                                                                      |
| `rotate`          | `number \| (word, i) => number`                             | random: −90°, −60°, −30°, 0°, 30° or 60°   | Rotation in degrees.                                                                                                  |
| `spiral`          | `'archimedean' \| 'rectangular' \| (size) => (t) => [x, y]` | `'archimedean'`                            | How words spiral outward to find a free spot. `'rectangular'` gives a boxier cloud.                                   |
| `padding`         | `number \| (word, i) => number`                             | `1`                                        | Space around each word, in px.                                                                                        |
| `random`          | `() => number`                                              | `Math.random`                              | Random source in `[0, 1)` for starting positions and spiral direction. Pass a seeded one for repeatable layouts.      |
| `fill`            | `(word, i) => string`                                       | d3's 10-color `schemeCategory10`, by index | Word color.                                                                                                           |
| `onWordClick`     | `(event, word) => void`                                     | none                                       | Called when a word is clicked. `this` is the `<text>` element.                                                        |
| `onWordMouseOver` | `(event, word) => void`                                     | none                                       | Called when the pointer enters a word.                                                                                |
| `onWordMouseOut`  | `(event, word) => void`                                     | none                                       | Called when the pointer leaves a word.                                                                                |

## Troubleshooting

**Some of my words are missing.** d3-cloud leaves out words that don't fit.
Try a smaller `fontSize`, less `padding`, a larger `width`/`height`, or
`rotate={0}`. Very small words (about 1–3px, e.g. `value` under ~10 with the
default size) can also vanish. Scale them up as shown in
[Size words to your data](#size-words-to-your-data).

**The words jump around when my page re-renders.** A function prop is being
recreated on every render. See [Keep the layout steady](#keep-the-layout-steady).

**`document is not defined`.** It's rendering on the server. See
[Next.js and SSR](#nextjs-and-ssr).

**The cloud is too big or too small.** It fills its container's width, so
size the container, for example `<div style={{ maxWidth: 480 }}>`. Change
`width`/`height` to change the shape.

## Compatibility

- **React:** 16.8, 17, 18 and 19, with the matching `react-dom` as a peer.
- **Modules:** ES modules (`import`) and CommonJS (`require`), selected
  automatically.
- **Browsers:** the published code targets ES2018, so any current browser.
- **Rendering:** client-side only (see [Next.js and SSR](#nextjs-and-ssr)).

### Coming from `react-d3-cloud`?

Same props, same output. Swap the package and the import:

```diff
- import WordCloud from 'react-d3-cloud';
+ import WordCloud from 'react-d3-cloud-modern';
```

If your code imports `d3-scale` or `d3-scale-chromatic` (for example, to build
a custom `fill`), add them to your own dependencies. This package no longer
installs them for you.

## More

- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- Questions and bugs: [GitHub issues](https://github.com/Textopian/react-d3-cloud-modern/issues)

Built on [d3-cloud](https://github.com/jasondavies/d3-cloud) by Jason Davies
and [react-d3-cloud](https://github.com/Yoctol/react-d3-cloud) by Yoctol.
Maintained by [Textopian](https://app.textopian.com), which uses it in
production.

MIT licensed.
