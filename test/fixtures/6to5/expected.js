// test/fixtures/6to5/a.es6
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "jquery", "react"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("jquery"), require("react"));
  }
})(function (exports, module, _jquery, _react) {
  "use strict";

  var _interopRequire = function (obj) {
    return obj && (obj["default"] || obj);
  };

  var $ = _interopRequire(_jquery);

  var React = _interopRequire(_react);

  var app = {
    init: function init() {
      $("body");
    }
  };

  $(app.init);

  React.createElement("div", null);

  module.exports = app;
});
