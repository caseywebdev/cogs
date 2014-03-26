// test/env-1/json/a.json
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    root['json/a'] = factory();
  }
})(this, function () {
return {
  "this": "is",
  "some": ["json"]
};
});
