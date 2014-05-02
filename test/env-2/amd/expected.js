// test/vendor/memoize.es6
define(
'memoize', ["exports"],
function(__exports__) {
"use strict";
__exports__["default"] = function (fn) {
var cache = {};
return function (arg) {
if (arg in cache) return cache[arg];
return fn.apply(this, arguments);
};
}
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
define(
'amd/sum', ["exports"],
function(__exports__) {
"use strict";
__exports__["default"] = function () {
return [].reduce.call(arguments, function (sum, n) { return sum + n; }, 0);
}
});
// test/env-2/amd/just-the-factory.js
var Factory = function () {};
define('amd/just-the-factory', Factory);
// test/env-2/amd/a.es6
define(
'amd/a', ["fib","amd/sum","amd/just-the-factory","exports"],
function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
"use strict";
var fib = __dependency1__["default"];
var sum = __dependency2__["default"];
var jtf = __dependency3__["default"];
__exports__.fib = fib;
__exports__.sum = sum;
__exports__.jtf = jtf;
});
