// test/env-1/txt/a.txt
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    root['txt/a'] = factory();
  }
})(this, function () {
return "this\nis a\nstring\n'\"\\n\n";
});
