'use strict';

exports.__esModule = true;

var _d3Array = require('d3-array');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DiscreteScale = function () {
  function DiscreteScale() {
    var _this = this;

    _classCallCheck(this, DiscreteScale);

    this.getValue = function (x) {
      var range = _this.range,
          domain = _this.domain,
          n = _this.n;

      return range[(0, _d3Array.bisect)(domain, x, 0, n)];
    };

    this.setDomain = function (val) {
      _this.x0 = +val[0];
      _this.x1 = +val[1];
      _this.rescale();

      return _this;
    };

    this.setRange = function (val) {
      _this.range = val.slice();
      _this.n = _this.range.length - 1;

      return _this;
    };

    this.x0 = 0;
    this.x1 = 1;

    this.domain = [0.5];
    this.range = [0, 1];

    this.n = 1;
  }

  DiscreteScale.prototype.rescale = function rescale() {
    var x0 = this.x0,
        x1 = this.x1,
        n = this.n;


    var i = -1;

    this.domain = new Array(n);

    while (++i < n) {
      this.domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    }
  };

  return DiscreteScale;
}();

exports.default = DiscreteScale;