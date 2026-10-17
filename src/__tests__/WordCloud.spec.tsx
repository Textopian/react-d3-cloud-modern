import React from 'react';
import {
  RenderResult,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { expect, expectTypeOf, it, vi } from 'vitest';

import WordCloud, { Word } from '../WordCloud';
import PackageWordCloud, {
  type Word as PackageWord,
  type WordCloudProps,
} from '../index.js';

const data = [
  { text: 'Hey', value: 100 },
  { text: 'Ok', value: 500 },
  { text: 'Cool', value: 1000 },
];

function renderInStrictMode(ui: React.ReactElement): RenderResult {
  return render(ui, { wrapper: React.StrictMode });
}

it('should render words', async () => {
  renderInStrictMode(<WordCloud data={data} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toBeInTheDocument();
  expect(screen.getByText('Ok')).toBeInTheDocument();
  expect(screen.getByText('Cool')).toBeInTheDocument();
});

it('should render correct words after re-render', async () => {
  const { rerender } = renderInStrictMode(<WordCloud data={data} />);

  const newData = [
    { text: 'New', value: 100 },
    { text: 'World', value: 500 },
  ];
  rerender(<WordCloud data={newData} />);

  await screen.findByText('New');

  expect(screen.queryByText('Hey')).not.toBeInTheDocument();
  expect(screen.queryByText('Ok')).not.toBeInTheDocument();
  expect(screen.queryByText('Cool')).not.toBeInTheDocument();

  expect(screen.getByText('New')).toBeInTheDocument();
  expect(screen.getByText('World')).toBeInTheDocument();
});

it('should render with custom font', async () => {
  const font = 'sans-serif';

  renderInStrictMode(<WordCloud data={data} font={font} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveStyle('font-family: sans-serif');
  expect(screen.getByText('Ok')).toHaveStyle('font-family: sans-serif');
  expect(screen.getByText('Cool')).toHaveStyle('font-family: sans-serif');
});

it('should render with custom fontStyle', async () => {
  const fontStyle = 'italic';

  renderInStrictMode(<WordCloud data={data} fontStyle={fontStyle} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveStyle('font-style: italic');
  expect(screen.getByText('Ok')).toHaveStyle('font-style: italic');
  expect(screen.getByText('Cool')).toHaveStyle('font-style: italic');
});

it('should render with custom fontWeight', async () => {
  const fontWeight = 900;

  renderInStrictMode(<WordCloud data={data} fontWeight={fontWeight} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveStyle('font-weight: 900');
  expect(screen.getByText('Ok')).toHaveStyle('font-weight: 900');
  expect(screen.getByText('Cool')).toHaveStyle('font-weight: 900');
});

it('should render with custom fontSize', async () => {
  const fontSize = (d: Word) => d.value / 10;

  renderInStrictMode(<WordCloud data={data} fontSize={fontSize} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveStyle('font-size: 10px');
  expect(screen.getByText('Ok')).toHaveStyle('font-size: 50px');
  expect(screen.getByText('Cool')).toHaveStyle('font-size: 100px');
});

it('should render with custom rotate', async () => {
  const rotate = (_: Word, i: number) => (i + 1) * 30;

  renderInStrictMode(<WordCloud data={data} rotate={rotate} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveAttribute(
    'transform',
    expect.stringContaining('rotate(30)')
  );
  expect(screen.getByText('Ok')).toHaveAttribute(
    'transform',
    expect.stringContaining('rotate(60)')
  );
  expect(screen.getByText('Cool')).toHaveAttribute(
    'transform',
    expect.stringContaining('rotate(90)')
  );
});

it('should render with custom fill', async () => {
  const fill = () => '#000000';

  renderInStrictMode(<WordCloud data={data} fill={fill} />);

  await screen.findByText('Hey');

  expect(screen.getByText('Hey')).toHaveStyle('fill: #000000');
  expect(screen.getByText('Ok')).toHaveStyle('fill: #000000');
  expect(screen.getByText('Cool')).toHaveStyle('fill: #000000');
});

it('should support click handler', async () => {
  const onWordClick = vi.fn();

  renderInStrictMode(<WordCloud data={data} onWordClick={onWordClick} />);

  await screen.findByText('Hey');

  fireEvent.click(screen.getByText('Hey'));

  expect(onWordClick).toHaveBeenCalled();
});

it('should support mouse over handler', async () => {
  const onWordMouseOver = vi.fn();

  renderInStrictMode(
    <WordCloud data={data} onWordMouseOver={onWordMouseOver} />
  );

  await screen.findByText('Hey');

  fireEvent.mouseOver(screen.getByText('Hey'));

  expect(onWordMouseOver).toHaveBeenCalled();
});

it('should support mouse out handler', async () => {
  const onWordMouseOut = vi.fn();

  renderInStrictMode(<WordCloud data={data} onWordMouseOut={onWordMouseOut} />);

  await screen.findByText('Hey');

  fireEvent.mouseOut(screen.getByText('Hey'));

  expect(onWordMouseOut).toHaveBeenCalled();
});

it('exports the component and its types from the package entry', () => {
  expect(PackageWordCloud).toBe(WordCloud);

  expectTypeOf<WordCloudProps['data']>().toEqualTypeOf<
    { text: string; value: number }[]
  >();
  expectTypeOf<PackageWord>().toEqualTypeOf<Word>();
  expectTypeOf<PackageWord>().toHaveProperty('size');
  expectTypeOf<WordCloudProps['fontSize']>().toEqualTypeOf<
    number | ((word: Word, index: number) => number) | undefined
  >();
});
