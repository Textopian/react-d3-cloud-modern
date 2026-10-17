// Source of docs/hero.png. Rendered in headless Chromium at 2x; see
// CONTRIBUTING.md ("Regenerating the README image").
import WordCloud from 'react-d3-cloud-modern';

const words = [
  ['story', 100],
  ['imagine', 74],
  ['words', 66],
  ['wonder', 58],
  ['read', 54],
  ['curious', 47],
  ['chapter', 42],
  ['voice', 39],
  ['journey', 36],
  ['meaning', 33],
  ['dream', 31],
  ['quiet', 29],
  ['library', 27],
  ['author', 25],
  ['poem', 24],
  ['ink', 22],
  ['page', 21],
  ['hero', 20],
  ['letters', 19],
  ['myth', 18],
  ['spark', 17],
  ['clever', 16],
  ['grammar', 15],
  ['metaphor', 15],
  ['novel', 14],
  ['plot', 13],
  ['rhyme', 13],
  ['echo', 12],
  ['prose', 12],
  ['wit', 11],
  ['verse', 11],
  ['tale', 10],
  ['margin', 10],
  ['scribble', 9],
  ['fable', 9],
  ['lexicon', 8],
  ['syllable', 8],
  ['quill', 8],
  ['saga', 7],
  ['epilogue', 7],
].map(([text, value]) => ({ text, value }));

const palette = [
  '#4f46e5',
  '#0d9488',
  '#d97706',
  '#e11d48',
  '#0284c7',
  '#7c3aed',
];

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fontSize = (word) => 15 + Math.pow(word.value / 100, 0.8) * 85;
const fontWeight = (word) =>
  word.value > 30 ? 800 : word.value > 15 ? 700 : 600;
const fill = (word, i) => palette[i % palette.length];
const rotate = (word, i) => (i % 5 === 2 ? 90 : 0);

export default function Hero() {
  return (
    <WordCloud
      data={words}
      width={960}
      height={440}
      font="Inter"
      fontWeight={fontWeight}
      fontSize={fontSize}
      fill={fill}
      rotate={rotate}
      padding={3}
      random={seeded(1)}
    />
  );
}
