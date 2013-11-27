// test/cases/coffee-script/c.coffee
(function() {
  var c;

  c = 3;

}).call(this);

// test/cases/coffee-script/b.js
(function() {
  var b;

  b = 2;

}).call(this);

// test/cases/coffee-script/b.c.coffee
(function() {
  var b;

  b = 2;

}).call(this);

// test/cases/coffee-script/a/a.coffee
(function() {
  var a;

  a = 4;

}).call(this);

// test/cases/coffee-script/a.coffee
(function() {
  var a;

  a = 1;

}).call(this);
