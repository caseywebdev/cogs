define('a', ["exports", "b"], function (exports, _b) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var b = _interopRequire(_b);
});
define('b', ['a'], function () {
  return "I'm b!";
});
