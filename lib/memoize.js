var _ = require('underscore');

var memoize = module.exports = function (fn) {
  var cache = {};
  memoize.caches.push(cache);
  var memoized = function () {
    var key = _.first(arguments);
    var cached = cache[key];
    var cb = _.last(arguments);
    if (_.isArray(cached)) return cached.push(cb);
    if (cached !== void 0) return cb(null, cached);
    var queue = cache[key] = [cb];
    fn.apply(null, _.initial(arguments).concat(function (er, val) {
      if (er) delete cache[key];
      else cache[key] = val;
      _.invoke(queue, 'call', null, er, val);
    }));
  };
  memoized.cache = {};
  return memoized;
};

memoize.caches = [];
