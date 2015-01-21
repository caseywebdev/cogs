(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  }
})(function (exports, module) {
  "use strict";

  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [],
        __capture = function (callback) {
      var out = __out,
          result;
      __out = [];
      callback.call(this);
      result = __out.join("");
      __out = out;
      return __safe(result);
    },
        __sanitize = function (value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== "undefined" && value != null) {
        return __escape(value);
      } else {
        return "";
      }
    },
        __safe,
        __objSafe = __obj.safe,
        __escape = __obj.escape;
    __safe = __obj.safe = function (value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== "undefined" && value != null)) value = "";
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function (value) {
        return ("" + value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      };
    }
    (function () {
      (function () {
        __out.push("<h1>hello</h1>\n");
      }).call(this);
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join("");
  };
});
