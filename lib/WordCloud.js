"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_faux_dom_1 = __importDefault(require("react-faux-dom"));
const d3_cloud_1 = __importDefault(require("d3-cloud"));
const react_fast_compare_1 = __importDefault(require("react-fast-compare"));
const d3_selection_1 = require("d3-selection");
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
function WordCloud({ data, width = 700, height = 600, font = 'serif', fontStyle = 'normal', fontWeight = 'normal', fontSize = (d) => Math.sqrt(d.value), 
// eslint-disable-next-line no-bitwise
rotate = () => (~~(Math.random() * 6) - 3) * 30, spiral = 'archimedean', padding = 1, random = Math.random, fill = (_, i) => defaultColors[i % defaultColors.length], onWordClick, onWordMouseOver, onWordMouseOut, }) {
    const elementRef = react_1.default.useRef(null);
    if (!elementRef.current) {
        elementRef.current = react_faux_dom_1.default.createElement('div');
    }
    const el = elementRef.current;
    // clear old words
    (0, d3_selection_1.select)(el).selectAll('*').remove();
    // render based on new data
    const layout = (0, d3_cloud_1.default)()
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
        const texts = (0, d3_selection_1.select)(el)
            .append('svg')
            .attr('viewBox', `0 0 ${w} ${h}`)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .append('g')
            .attr('transform', `translate(${w / 2},${h / 2})`)
            .selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-family', ((d) => d.font))
            .style('font-style', ((d) => d.style))
            .style('font-weight', ((d) => d.weight))
            .style('font-size', ((d) => `${d.size}px`))
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
exports.default = react_1.default.memo(WordCloud, react_fast_compare_1.default);
