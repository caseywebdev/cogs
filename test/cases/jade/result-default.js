// test/cases/jade/a.jade
(window.jst = window.jst || {})['jade/a'] = function (locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<!DOCTYPE html><html><head></head><body></body></html>');
}
return buf.join("");
}
