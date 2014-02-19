// test/env-1/es6-module-transpiler/a.js.es6
define("es6-module-transpiler/a",
["jquery","exports"],
function(__dependency1__, __exports__) {
  "use strict";
  var $ = __dependency1__["default"];
  var app = {
    init: function () {}
  };
  $(app.init);
  __exports__["default"] = app;
});
