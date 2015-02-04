var _ = require('underscore');

var memoize = module.exports = function (fn) {
  var queues = {};
  var memoized = function () {
    var key = _.first(arguments);
    var cached = memoized.cache[key];
    var cb = _.last(arguments);
    if (cached) return cb(null, cached);
    var queue = queues[key] || (queues[key] = []);
    queue.push(cb);
    if (queue.length > 1) return;
    fn.apply(null, _.initial(arguments).concat(function (er, val) {
      if (!er) memoized.cache[key] = val;
      queues[key] = [];
      _.invoke(queue, 'call', null, er, val);
    }));
  };
  memoized.cache = {};
  memoize.all.push(memoized);
  return memoized;
};

memoize.all = [];
