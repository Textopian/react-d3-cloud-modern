"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactFauxDom = _interopRequireDefault(require("react-faux-dom"));
var _d3Cloud = _interopRequireDefault(require("d3-cloud"));
var _reactFastCompare = _interopRequireDefault(require("react-fast-compare"));
var _d3Selection = require("d3-selection");
var _d3Scale = require("d3-scale");
var _d3ScaleChromatic = require("d3-scale-chromatic");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var defaultScaleOrdinal = (0, _d3Scale.scaleOrdinal)(_d3ScaleChromatic.schemeCategory10);
function WordCloud(_ref) {
  var data = _ref.data,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 700 : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 600 : _ref$height,
    _ref$font = _ref.font,
    font = _ref$font === void 0 ? 'serif' : _ref$font,
    _ref$fontStyle = _ref.fontStyle,
    fontStyle = _ref$fontStyle === void 0 ? 'normal' : _ref$fontStyle,
    _ref$fontWeight = _ref.fontWeight,
    fontWeight = _ref$fontWeight === void 0 ? 'normal' : _ref$fontWeight,
    _ref$fontSize = _ref.fontSize,
    fontSize = _ref$fontSize === void 0 ? function (d) {
      return Math.sqrt(d.value);
    } : _ref$fontSize,
    _ref$rotate = _ref.rotate,
    rotate = _ref$rotate === void 0 ? function () {
      return (~~(Math.random() * 6) - 3) * 30;
    } : _ref$rotate,
    _ref$spiral = _ref.spiral,
    spiral = _ref$spiral === void 0 ? 'archimedean' : _ref$spiral,
    _ref$padding = _ref.padding,
    padding = _ref$padding === void 0 ? 1 : _ref$padding,
    _ref$random = _ref.random,
    random = _ref$random === void 0 ? Math.random : _ref$random,
    _ref$fill = _ref.fill,
    fill = _ref$fill === void 0 ? function (_, i) {
      return defaultScaleOrdinal(i);
    } : _ref$fill,
    onWordClick = _ref.onWordClick,
    onWordMouseOver = _ref.onWordMouseOver,
    onWordMouseOut = _ref.onWordMouseOut;
  var elementRef = (0, _react.useRef)();
  if (!elementRef.current) {
    elementRef.current = _reactFauxDom["default"].createElement('div');
  }
  var el = elementRef.current;

  // clear old words
  (0, _d3Selection.select)(el).selectAll('*').remove();

  // render based on new data
  var layout = (0, _d3Cloud["default"])().words(data).size([width, height]).font(font).fontStyle(fontStyle).fontWeight(fontWeight).fontSize(fontSize).rotate(rotate).spiral(spiral).padding(padding).random(random).on('end', function (words) {
    var _layout$size = layout.size(),
      _layout$size2 = _slicedToArray(_layout$size, 2),
      w = _layout$size2[0],
      h = _layout$size2[1];
    var texts = (0, _d3Selection.select)(el).append('svg').attr('viewBox', "0 0 ".concat(w, " ").concat(h)).attr('preserveAspectRatio', 'xMinYMin meet').append('g').attr('transform', "translate(".concat(w / 2, ",").concat(h / 2, ")")).selectAll('text').data(words).enter().append('text').style('font-family', function (d) {
      return d.font;
    }).style('font-style', function (d) {
      return d.style;
    }).style('font-weight', function (d) {
      return d.weight;
    }).style('font-size', function (d) {
      return "".concat(d.size, "px");
    }).style('fill', fill).attr('text-anchor', 'middle').attr('transform', function (d) {
      return "translate(".concat([d.x, d.y], ")rotate(").concat(d.rotate, ")");
    }).text(function (d) {
      return d.text;
    });
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
var _default = exports["default"] = /*#__PURE__*/_react["default"].memo(WordCloud, _reactFastCompare["default"]);