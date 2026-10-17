import React from 'react';
import ReactFauxDom from 'react-faux-dom';
import cloud from 'd3-cloud';
import isDeepEqual from 'react-fast-compare';
import { BaseType, ValueFn, select } from 'd3-selection';

interface Datum {
  text: string;
  value: number;
}

export interface Word extends cloud.Word {
  text: string;
  value: number;
}

type WordCloudProps = {
  data: Datum[];
  width?: number;
  height?: number;
  font?: string | ((word: Word, index: number) => string);
  fontStyle?: string | ((word: Word, index: number) => string);
  fontWeight?:
    string | number | ((word: Word, index: number) => string | number);
  fontSize?: number | ((word: Word, index: number) => number);
  rotate?: number | ((word: Word, index: number) => number);
  spiral?:
    | 'archimedean'
    | 'rectangular'
    | ((size: [number, number]) => (t: number) => [number, number]);
  padding?: number | ((word: Word, index: number) => number);
  random?: () => number;
  fill?: ValueFn<SVGTextElement, Word, string>;
  onWordClick?: (this: BaseType, event: any, d: Word) => void;
  onWordMouseOver?: (this: BaseType, event: any, d: Word) => void;
  onWordMouseOut?: (this: BaseType, event: any, d: Word) => void;
};

// d3's schemeCategory10, inlined so the default fill doesn't pull in d3-scale.
const defaultColors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

function WordCloud({
  data,
  width = 700,
  height = 600,
  font = 'serif',
  fontStyle = 'normal',
  fontWeight = 'normal',
  fontSize = (d) => Math.sqrt(d.value),
  // eslint-disable-next-line no-bitwise
  rotate = () => (~~(Math.random() * 6) - 3) * 30,
  spiral = 'archimedean',
  padding = 1,
  random = Math.random,
  fill = (_, i) => defaultColors[i % defaultColors.length]!,
  onWordClick,
  onWordMouseOver,
  onWordMouseOut,
}: WordCloudProps) {
  const elementRef = React.useRef<ReactFauxDom.Element | null>(null);

  if (!elementRef.current) {
    elementRef.current = ReactFauxDom.createElement('div');
  }

  const el = elementRef.current;

  // clear old words
  select(el).selectAll('*').remove();

  // render based on new data
  const layout = cloud<Word>()
    .words(data)
    .size([width, height])
    .font(font)
    .fontStyle(fontStyle)
    .fontWeight(fontWeight)
    .fontSize(fontSize)
    .rotate(rotate)
    .spiral(spiral)
    .padding(padding)
    .random(random)
    .on('end', (words) => {
      const [w, h] = layout.size();

      const texts = select(el)
        .append('svg')
        .attr('viewBox', `0 0 ${w} ${h}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .append('g')
        .attr('transform', `translate(${w / 2},${h / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style(
          'font-family',
          ((d) => d.font) as ValueFn<SVGTextElement, Word, string>
        )
        .style(
          'font-style',
          ((d) => d.style) as ValueFn<SVGTextElement, Word, string>
        )
        .style(
          'font-weight',
          ((d) => d.weight) as ValueFn<SVGTextElement, Word, string | number>
        )
        .style(
          'font-size',
          ((d) => `${d.size}px`) as ValueFn<SVGTextElement, Word, string>
        )
        .style('fill', fill)
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text((d) => d.text);

      if (onWordClick) {
        texts.on('click', onWordClick);
      }
      if (onWordMouseOver) {
        texts.on('mouseover', onWordMouseOver);
      }
      if (onWordMouseOut) {
        texts.on('mouseout', onWordMouseOut);
      }
    });

  layout.start();

  return el.toReact();
}

export default React.memo(WordCloud, isDeepEqual);
