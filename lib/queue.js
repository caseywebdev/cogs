var _ = require('underscore');

var queue = [];

var filter = function (method, fileName, config) {
  return _.filter(queue, {'0': method, '1': fileName, '2': config});
};

exports.push = function (method, fileName, config, cb) {
  queue.push([method, fileName, config, cb]);
  return filter(method, fileName, config).length > 1;
};

exports.call = function (method, fileName, config, er, res) {
  var queued = filter(method, fileName, config);
  queue = _.difference(queue, queued);
  if (er) er.message += '\n  ' + fileName;
  _.invoke(_.map(queued, 3), 'call', null, er, res);
};
