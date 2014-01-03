// test/cases/mustache-jst/a.jst.mustache
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('mustache-jst/a', ['jade', 'mustache', 'underscore'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('jade'), require('mustache'), require('underscore'));
  } else {
    (root.JST || (root.JST = {}))['mustache-jst/a'] = factory(root['jade'], root['Mustache'], root['_']);
  }
})(this, function (jade, Mustache, _) {
  return ((function () {
    var source = "<h1>hello {{{name}}}</h1>\n";
    var fn = function (data, partials) {
      return Mustache.render(source, data, partials);
    };
    fn.source = source;
    return fn;
  })());
});
