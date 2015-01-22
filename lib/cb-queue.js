var _ = require('underscore');

var getQueue = function (store) {
  if (!store.cbQueue) store.cbQueue = [];
  return store.cbQueue;
};

var setQueue = function (store, queue) {
  store.cbQueue = queue;
};

var filter = function (store, key) {
  return _.filter(
    getQueue(store),
    _.compose(_.partial(_.isEqual, key), _.property('key'))
  );
};

exports.push = function (store, key, cb) {
  getQueue(store).push({key: key, cb: cb});
  return filter(store, key).length > 1;
};

exports.call = function (store, key) {
  var queued = filter(store, key);
  setQueue(store, _.difference(getQueue(store), queued));
  _.invoke(_.map(queued, 'cb'), 'apply', null, _.rest(arguments, 2));
};
