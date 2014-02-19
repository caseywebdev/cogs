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
define('fib', ['memoize'], (function (root) {
return function () {
return root['Fib'];
};
})(this));
// test/env-2/amd/sum.es6
define(
'amd/sum', ["exports"],
function(__exports__) {
"use strict";
__exports__["default"] = function () {
return [].reduce.call(arguments, function (sum, n) { return sum + n; }, 0);
}
});
// test/env-2/amd/a.es6
define(
'amd/a', ["fib","amd/sum","exports"],
function(__dependency1__, __dependency2__, __exports__) {
"use strict";
var fib = __dependency1__["default"];
var sum = __dependency2__["default"];
__exports__.fib = fib;
__exports__.sum = sum;
});
