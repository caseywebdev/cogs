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
define(
'rename/a', ["good-name-2"],
function(__dependency1__) {
"use strict";
var goodName2 = __dependency1__["default"];
});
