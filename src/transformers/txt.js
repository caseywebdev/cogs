var _ = require('underscore');
var to5 = require('cogs-transformer-6to5');

var DEFAULTS = {
  modules: 'umd'
};

module.exports = function (file, options, cb) {
  var source =  'export default ' + JSON.stringify(file.buffer.toString());
  options = _.extend({}, DEFAULTS, options);
  to5(_.extend({}, file, {buffer: new Buffer(source)}), options, cb);
};
