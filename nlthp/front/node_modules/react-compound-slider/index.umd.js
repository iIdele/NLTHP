'use strict';

exports.__esModule = true;

var _Slider = require('./Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _Rail = require('./Rail');

var _Rail2 = _interopRequireDefault(_Rail);

var _Ticks = require('./Ticks');

var _Ticks2 = _interopRequireDefault(_Ticks);

var _Tracks = require('./Tracks');

var _Tracks2 = _interopRequireDefault(_Tracks);

var _Handles = require('./Handles');

var _Handles2 = _interopRequireDefault(_Handles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_Slider2.default.Rail = _Rail2.default;
_Slider2.default.Ticks = _Ticks2.default;
_Slider2.default.Tracks = _Tracks2.default;
_Slider2.default.Handles = _Handles2.default;

exports.default = _Slider2.default;