// test/cases/umd/a.umd
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    root['umd/a'] = factory();
  }
})(this, function () {
var Foo = function () {
  // foo does stuff
};

return Foo;
});
