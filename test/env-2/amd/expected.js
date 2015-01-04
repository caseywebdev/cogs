// test/vendor/memoize.es6
"use strict";
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define('memoize', ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  }
})(function (exports) {
  exports["default"] = function (fn) {
    var cache = {};
    return function (arg) {
      if (arg in cache) return cache[arg];
      return fn.apply(this, arguments);
    };
  };
});
// test/env-2/amd/fib.coffee
(function() {
  this.Fib = memoize(function(n) {
    if (n < 2) {
      return 1;
    } else {
      return fib(n - 1) + fib(n - 2);
    }
  });
}).call(this);
(function (root) {
  var value = root['Fib'];
  if (typeof define === 'function' && define.amd) {
    define('fib', ['memoize'], function () { return value; });
  } else if (typeof exports !== 'undefined') {
    module.exports = value;
  }
})(this);
// test/env-2/amd/sum.es6
"use strict";
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define('amd/sum', ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  }
})(function (exports) {
  exports["default"] = function () {
    return [].reduce.call(arguments, function (sum, n) {
      return sum + n;
    }, 0);
  };
});
// test/env-2/amd/just-the-factory.js
var Factory = function () {};
define('amd/just-the-factory', Factory);
// test/env-2/amd/a.es6
"use strict";
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define('amd/a', ["exports", "fib", "amd/sum", "amd/just-the-factory"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("fib"), require("amd/sum"), require("amd/just-the-factory"));
  }
})(function (exports, _fib, _amdSum, _amdJustTheFactory) {
  var _interopRequire = function (obj) {
    return obj && (obj["default"] || obj);
  };
  var fib = _interopRequire(_fib);
  var sum = _interopRequire(_amdSum);
  var jtf = _interopRequire(_amdJustTheFactory);
  exports.fib = fib;
  exports.sum = sum;
  exports.jtf = jtf;
});
