// test/env-1/coffee-script/c.coffee
(function() {
  var c;

  c = 3;

}).call(this);

// test/env-1/coffee-script/b.js
(function() {
  var b;

  b = 2;

}).call(this);

// test/env-1/coffee-script/b.c.js.coffee
(function() {
  var b;

  b = 2;

}).call(this);

// test/env-1/coffee-script/a/a.coffee
(function() {
  var a;

  a = 4;

}).call(this);

// test/env-1/coffee-script/a.coffee
(function() {
  var a;

  a = 1;

}).call(this);
