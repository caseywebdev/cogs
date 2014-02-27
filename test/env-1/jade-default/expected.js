// test/env-1/jade-default/a.jade
(function (root, factory) {
if (typeof define === 'function' && define.amd) {
define('jade-default/a', ['jade', 'mustache', 'underscore'], factory);
} else if (typeof exports !== 'undefined') {
module.exports = factory(require('jade'), require('mustache'), require('underscore'));
} else {
root['jade-default/a'] = factory(root['jade'], root['Mustache'], root['_']);
}
})(this, function (jade, Mustache, _) {
return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),title = locals_.title,body = locals_.body;
buf.push("<!DOCTYPE html><html><head><title>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</title></head><body><body>" + (jade.escape(null == (jade_interp = body) ? "" : jade_interp)) + "</body></body></html>");;return buf.join("");
}});
