'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracks = function (_Component) {
  _inherits(Tracks, _Component);

  function Tracks() {
    var _temp, _this, _ret;

    _classCallCheck(this, Tracks);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.getTrackProps = function () {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$props = _this.props,
          emitMouse = _this$props.emitMouse,
          emitTouch = _this$props.emitTouch;


      return _extends({}, props, {
        onMouseDown: (0, _utils.callAll)(props.onMouseDown, emitMouse),
        onTouchStart: (0, _utils.callAll)(props.onTouchStart, emitTouch)
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Tracks.prototype.render = function render() {
    var getTrackProps = this.getTrackProps,
        _props = this.props,
        children = _props.children,
        left = _props.left,
        right = _props.right,
        scale = _props.scale,
        handles = _props.handles;


    var domain = scale.getDomain();
    var tracks = [];

    for (var i = 0; i < handles.length + 1; i++) {
      var source = handles[i - 1];
      var target = handles[i];

      if (i === 0 && left === true) {
        source = { id: '$', value: domain[0], percent: 0 };
      } else if (i === handles.length && right === true) {
        target = { id: '$', value: domain[1], percent: 100 };
      }

      if (source && target) {
        tracks.push({
          id: source.id + '-' + target.id,
          source: source,
          target: target
        });
      }
    }

    var renderedChildren = children({ tracks: tracks, getTrackProps: getTrackProps });
    return renderedChildren && _react2.default.Children.only(renderedChildren);
  };

  return Tracks;
}(_react.Component);

Tracks.propTypes = {
  /**
   * Boolean value to control whether the left most track is included in the tracks array.
   */
  left: _propTypes2.default.bool,
  /**
   * Boolean value to control whether the right most track is included in the tracks array.
   */
  right: _propTypes2.default.bool,
  /** @ignore */
  scale: _propTypes2.default.object,
  /** @ignore */
  handles: _propTypes2.default.array,
  /** @ignore */
  emitMouse: _propTypes2.default.func,
  /** @ignore */
  emitTouch: _propTypes2.default.func,
  /**
   * A function to render the tracks. The function receives an object with an array of tracks and a function to get track props. `({ tracks, getTrackProps }): element`
   */
  children: _propTypes2.default.func.isRequired
};

Tracks.defaultProps = {
  left: true,
  right: true
};

exports.default = Tracks;