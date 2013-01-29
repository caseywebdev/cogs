// test/cases/coffee/b.coffee
(function() {
  var requireMe;

  requireMe = true;

}).call(this);

// test/cases/coffee/a.coffee
(function() {
  var a;

  a = function() {
    b(1);
    return 2;
  };

}).call(this);
