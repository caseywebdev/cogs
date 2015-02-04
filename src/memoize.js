var _ = require('underscore');

var memoize = module.exports = function (fn, comparator) {
  var memoized = function () {
    var key = _.first(arguments);
    var cached = memoized.cache[key];
    var cb = _.last(arguments);
    if (_.isArray(cached)) return cached.push(cb);
    if (cached !== void 0) return cb(null, cached);
    var queue = memoized.cache[key] = [cb];
    fn.apply(null, _.initial(arguments).concat(function (er, val) {
      if (memoized.cache[key] === queue) {
        if (er) delete memoized.cache[key];
        else memoized.cache[key] = val;
      }
      _.invoke(queue, 'call', null, er, val);
    }));
  };
  memoized.cache = {};
  memoized.comparator = comparator || _.isEqual;
  memoize.all.push(memoized);
  return memoized;
};

memoize.all = [];
