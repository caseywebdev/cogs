// test/cases/mustache-jst/a.jst.mustache
(window.jst || (window.jst = {}))['mustache-jst/a'] = function (data) { return Mustache.render("<h1>hello {{{name}}}</h1>\n", data); };
