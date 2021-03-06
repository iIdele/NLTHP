'use strict';

exports.__esModule = true;

var _d3Array = require('d3-array');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinearScale = function () {
  function LinearScale() {
    _classCallCheck(this, LinearScale);

    this.domain = [0, 1];
    this.range = [0, 1];
    this.interpolator = null;
  }

  LinearScale.prototype.createInterpolator = function createInterpolator(domain, range) {
    var d0 = domain[0];
    var d1 = domain[1];

    var r0 = range[0];
    var r1 = range[1];

    if (d1 < d0) {
      d0 = this.deinterpolateValue(d1, d0);
      r0 = this.interpolateValue(r1, r0);
    } else {
      d0 = this.deinterpolateValue(d0, d1);
      r0 = this.interpolateValue(r0, r1);
    }

    return function (x) {
      return r0(d0(x));
    };
  };

  LinearScale.prototype.interpolateValue = function interpolateValue(a, b) {
    return a = +a, b -= a, function i(t) {
      return a + b * t;
    };
  };

  LinearScale.prototype.deinterpolateValue = function deinterpolateValue(a, b) {
    return (b -= a = +a) ? function (x) {
      return (x - a) / b;
    } : function () {
      return b;
    }; // eslint-disable-line
  };

  LinearScale.prototype.rescale = function rescale() {
    this.interpolator = null;
    return this;
  };

  LinearScale.prototype.getValue = function getValue(x) {
    var domain = this.domain,
        range = this.range;

    return (this.interpolator || (this.interpolator = this.createInterpolator(domain, range)))(+x);
  };

  LinearScale.prototype.setDomain = function setDomain(val) {
    this.domain = val.map(function (d) {
      return +d;
    });
    this.rescale();

    return this;
  };

  LinearScale.prototype.getDomain = function getDomain() {
    return this.domain;
  };

  LinearScale.prototype.setRange = function setRange(val) {
    this.range = val.map(function (d) {
      return +d;
    });

    return this;
  };

  LinearScale.prototype.getTicks = function getTicks(count) {
    var d = this.domain;
    return (0, _d3Array.ticks)(d[0], d[d.length - 1], count ? count : 10);
  };

  return LinearScale;
}();

exports.default = LinearScale;