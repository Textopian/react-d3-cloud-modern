import React from 'react';
interface Datum {
    text: string;
    value: number;
}
/** A word as accessors and handlers see it: your datum plus layout fields. */
export interface Word extends Datum {
    font?: string;
    style?: string;
    weight?: string | number;
    rotate?: number;
    size?: number;
    padding?: number;
    x?: number;
    y?: number;
}
type WordHandler = (event: any, word: Word) => void;
export type WordCloudProps = {
    data: Datum[];
    width?: number;
    height?: number;
    font?: string | ((word: Word, index: number) => string);
    fontStyle?: string | ((word: Word, index: number) => string);
    fontWeight?: string | number | ((word: Word, index: number) => string | number);
    fontSize?: number | ((word: Word, index: number) => number);
    rotate?: number | ((word: Word, index: number) => number);
    spiral?: 'archimedean' | 'rectangular' | ((size: [number, number]) => (t: number) => [number, number]);
    padding?: number | ((word: Word, index: number) => number);
    random?: () => number;
    fill?: (word: Word, index: number) => string;
    onWordClick?: WordHandler;
    onWordMouseOver?: WordHandler;
    onWordMouseOut?: WordHandler;
};
declare function WordCloud({ data, width, height, font, fontStyle, fontWeight, fontSize, rotate, spiral, padding, random, fill, onWordClick, onWordMouseOver, onWordMouseOut, }: WordCloudProps): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
declare const _default: React.MemoExoticComponent<typeof WordCloud>;
export default _default;
