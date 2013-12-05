// test/cases/jade-default/a.jade
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/jade-default/a', [], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    (root.JST || (root.JST = {}))['test/cases/jade-default/a'] = factory();
  }
})(this, function () {
  return function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),title = locals_.title,body = locals_.body;buf.push("<!DOCTYPE html><html><head><title>" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</title></head><body><body>" + (jade.escape(null == (jade.interp = body) ? "" : jade.interp)) + "</body></body></html>");;return buf.join("");
};
});
