// test/cases/mustache-default/a.mustache
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/mustache-default/a', [], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    (root.JST || (root.JST = {}))['test/cases/mustache-default/a'] = factory();
  }
})(this, function () {
  return (function () {
    var source = "<h1>hello {{{name}}}</h1>\n";
    var fn = function (data, partials) {
      return Mustache.render(source, data, partials);
    };
    fn.source = source;
    return fn;
  })();
});