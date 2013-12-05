// test/cases/mustache-jst/a.jst.mustache
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/mustache-jst/a', [], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    (root.JST || (root.JST = {}))['test/cases/mustache-jst/a'] = factory();
  }
})(this, function () {
  return function (data) { return Mustache.render("<h1>hello {{{name}}}</h1>\n", data); };
});
