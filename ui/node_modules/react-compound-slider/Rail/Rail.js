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

var Rail = function (_Component) {
  _inherits(Rail, _Component);

  function Rail() {
    var _temp, _this, _ret;

    _classCallCheck(this, Rail);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.getRailProps = function () {
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

  Rail.prototype.render = function render() {
    var getRailProps = this.getRailProps,
        children = this.props.children;


    var renderedChildren = children({ getRailProps: getRailProps });
    return renderedChildren && _react2.default.Children.only(renderedChildren);
  };

  return Rail;
}(_react.Component);

Rail.propTypes = {
  /** @ignore */
  emitMouse: _propTypes2.default.func,
  /** @ignore */
  emitTouch: _propTypes2.default.func,
  /**
   * A function to render the rail. `({ getRailProps }): element`
   */
  children: _propTypes2.default.func.isRequired
};

exports.default = Rail;