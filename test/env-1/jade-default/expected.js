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
;var locals_for_with = (locals || {});(function (body, title) {
buf.push("<!DOCTYPE html><html><head><title>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</title></head><body><body>" + (jade.escape(null == (jade_interp = body) ? "" : jade_interp)) + "</body></body></html>");}.call(this,"body" in locals_for_with?locals_for_with.body:typeof body!=="undefined"?body:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
}});
