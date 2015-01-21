var _ = require('underscore');

var queue = [];

var filter = function (key) {
  return _.filter(
    queue,
    _.compose(_.partial(_.isEqual, key), _.property('key'))
  );
};

exports.push = function (key, cb) {
  queue.push({key: key, cb: cb});
  return filter(key).length > 1;
};

exports.call = function (key) {
  var queued = filter(key);
  queue = _.difference(queue, queued);
  _.invoke(_.map(queued, 'cb'), 'apply', null, _.rest(arguments));
};
