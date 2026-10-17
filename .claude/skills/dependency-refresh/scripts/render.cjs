// Server-renders a seeded word cloud and writes the markup to out-<mode>.html.
// Usage (inside a project with react, react-dom, jsdom, canvas and
// react-d3-cloud-modern installed): node render.cjs <cjs|esm>
const fs = require('fs');
const { JSDOM } = require('jsdom');

// d3-cloud measures text on a canvas created through `document`.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

let seed = 1;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const data =
  'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu'
    .split(' ')
    .map((text, i) => ({ text, value: (i + 1) * 40 }));

(async () => {
  const mode = process.argv[2];
  const mod =
    mode === 'esm'
      ? await import('react-d3-cloud-modern')
      : require('react-d3-cloud-modern');
  // CJS-in-ESM interop nests the component one level deeper on old builds.
  const WordCloud = mod.default.default ?? mod.default;
  const html = renderToStaticMarkup(
    React.createElement(WordCloud, { data, random, rotate: 0 })
  );
  const texts = (html.match(/<text/g) || []).length;
  console.log(
    `React ${React.version} ${mode}: ${texts} words, ${html.length} bytes`
  );
  fs.writeFileSync(`out-${mode}.html`, html);
})().catch((e) => {
  console.error(`FAIL ${process.argv[2]}: ${e.message}`);
  process.exit(1);
});
