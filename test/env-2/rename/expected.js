// test/vendor/rename.js
define('good-name', function () {
  // I need a good name;
});
// test/vendor/double-define.js
define('internal', function () {
  // I'm used internally.
});
define('double-define', ['internal'], function () {
  // I should be 'double-define';
});
// test/vendor/rename-2.js
define("good-name-2", ["good-name", "double-define"], function () {
  // I need a good name also;
});
// test/env-2/rename/a.es6
"use strict";
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define('rename/a', ["exports", "good-name-2"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("good-name-2"));
  }
})(function (exports, _goodName2) {
  var _interopRequire = function (obj) {
    return obj && (obj["default"] || obj);
  };
  var goodName2 = _interopRequire(_goodName2);
});
