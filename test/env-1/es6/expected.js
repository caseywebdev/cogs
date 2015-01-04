// test/env-1/es6/a.es6
"use strict";
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "jquery", "react"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("jquery"), require("react"));
  }
})(function (exports, _jquery, _react) {
  var _interopRequire = function (obj) {
    return obj && (obj["default"] || obj);
  };
  var $ = _interopRequire(_jquery);
  var React = _interopRequire(_react);
  var app = {
    init: function () {
      $("body");
    }
  };
  $(app.init);
  React.createElement("div", null);
  exports["default"] = app;
});
