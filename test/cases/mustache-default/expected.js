// test/cases/mustache-default/a.mustache
(window.jst || (window.jst = {}))['mustache-default/a'] = function (data) { return Mustache.render("<h1>hello {{{name}}}</h1>\n", data); };
