var _ = require('underscore');
var minimatch = require('minimatch');

var allMemoized = [];

var memoize = module.exports = function (fn) {
  var cache = {};
  var memoized = function () {
    var key = _.first(arguments);
    var cached = cache[key];
    var cb = _.last(arguments);
    if (_.isArray(cached)) return cached.push(cb);
    if (cached !== void 0) return cb(null, cached);
    var queue = cache[key] = [cb];
    fn.apply(null, _.initial(arguments).concat(function (er, val) {
      if (cache[key] === queue) {
        if (er) delete cache[key];
        else cache[key] = val;
      }
      _.invoke(queue, 'call', null, er, val);
    }));
  };
  memoized.cache = cache;
  allMemoized.push(memoized);
  return memoized;
};

memoize.bust = function (filePath, only) {
  _.each(only || allMemoized, function (memoized) {
    _.each(memoized.cache, function (__, key) {
      if (minimatch(filePath, key)) delete memoized.cache[key];
    });
  });
};
