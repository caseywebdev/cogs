// test/cases/jade-jst/a.jst.jade
(window.jst || (window.jst = {}))['jade-jst/a'] = function anonymous(locals) {
  var buf = [];
  var locals_ = (locals || {}),title = locals_.title,body = locals_.body;buf.push("<!DOCTYPE html><html><head><title>" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</title></head><body><body>" + (jade.escape(null == (jade.interp = body) ? "" : jade.interp)) + "</body></body></html>");;return buf.join("");
};
