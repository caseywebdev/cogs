// test/cases/jade-default/a.jade
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/jade-default/a', ['jade', 'mustache', 'underscore'], factory);
  }
  if (typeof exports !== 'undefined') {
    module.exports = factory(require('jade'), require('mustache'), require('underscore'));
  }
  (root.JST || (root.JST = {}))['test/cases/jade-default/a'] = factory(root['jade'], root['Mustache'], root['_']);
})(this, function (jade, Mustache, _) {
  return function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),title = locals_.title,body = locals_.body;buf.push("<!DOCTYPE html><html><head><title>" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</title></head><body><body>" + (jade.escape(null == (jade.interp = body) ? "" : jade.interp)) + "</body></body></html>");;return buf.join("");
};
});
