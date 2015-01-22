var _ = require('underscore');
var async = require('async');
var getDependencyHashes = require('../get-dependency-hashes');
var getExt = require('../get-ext');
var getOutExt = require('../get-out-ext');
var glob = require('glob');
var path = require('path');

var DEFAULTS = {
  base: '.'
};
var ADD_NAME = /(define\s*\(\s*)([^\s'"])/;
var CHANGE_NAME = /(define\s*\(\s*['"]).*?(['"])/;
var DEFINE = /define\s*\(\s*(?:['"](.*?)['"]\s*,\s*)?(?:\[([\s\S]*?)\])?/g;

var getName = function (pathName, options) {
  var ext = getExt(pathName);
  if (ext) pathName = pathName.slice(0, -ext.length - 1);
  return path.relative(options.base, pathName);
};

var getDefines = function (source) {
  var match;
  var matches = [];
  while (match = DEFINE.exec(source)) matches.push(match);
  return matches;
};

var getRequiredIds = function (defines) {
  var definedIds = ['require', 'exports', 'module'];
  var requiredIds = [];
  _.each(defines, function (match) {
    if (match[1]) definedIds.push(match[1]);
    if (match[2]) {
      requiredIds = requiredIds.concat(
        _.invoke(match[2].split(/\s*,\s*/), 'slice', 1, -1)
      );
    }
  });

  // Remove any modules that were defined in the file from the required list.
  // These modules will not be necessary to add as dependencies since they are
  // self-contained.
  return _.difference(requiredIds, definedIds);
};

var getDependencies = function (defines, options, cb) {
  var ids = getRequiredIds(defines);
  async.parallel({
    includes: function (cb) {
      async.map(ids, function (id, cb) {
        var pattern = path.join(options.base, id) + '*';
        async.waterfall([
          _.partial(glob, pattern, {nodir: true}),
          function (matches) {
            var match = _.chain(matches)
              .find(function (match) {
                return getOutExt(getExt(match)) === 'js' &&
                  getName(match, options) === id;
              })
              .value();
            if (!match) return cb(new Error("Cannot find module '" + id + "'"));
            cb(null, {path: path.relative('.', match)});
          }
        ], cb);
      }, cb);
    }
  }, cb);
};

module.exports = function (file, options, cb) {
  options = _.extend({}, DEFAULTS, options);
  var name = getName(file.path, options);
  var source = file.source;
  var defines = getDefines(source);

  // If the source has one named module in it, rename it to what the user
  // expects it to be. This generally only happens with authors release
  // packages that don't follow the best practice of defining themselves
  // anonymously. If that's not the case, simply add the name to the `define`.
  source =
    defines.length === 1 && defines[0][1] ?
    source.replace(CHANGE_NAME, '$1' + name + '$2') :
    source = source.replace(ADD_NAME, "$1'" + name + "', $2");

  async.waterfall([
    _.partial(getDependencies, getDefines(source), options),
    getDependencyHashes,
    function (hashes, cb) {
      var selfInclude = _.find(file.includes, _.pick(file, 'path'));
      var selfIndex = _.indexOf(file.includes, selfInclude);
      cb(null, {
        source: source,
        includes: file.includes.slice(0, selfIndex)
          .concat(hashes.includes)
          .concat(file.includes.slice(selfIndex))
      });
    }
  ], cb);
};
