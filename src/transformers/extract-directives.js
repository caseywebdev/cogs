var _ = require('underscore');
var async = require('async');
var glob = require('glob');
var path = require('path');

var HEADER = new RegExp(
  '^(' +
    '\\s*(' +
      '(/\\*[\\s\\S]*?\\*/)|' + // Multi-line /* comment */
      '(###[\\s\\S]*?###)|' +   // Multi-line ### comment ###
      '(<!--[\\s\\S]*?-->)|' +  // HTML <!-- comment -->
      '(//.*)|' +               // Single-line // comment
      '(#.*)' +                 // Single-line # comment
    ')\\n?' +                   // Grab the trailing newline
  ')+'
);
var DIRECTIVE_LINE = /^[^\w\n]*=[ \t]*\w+([ \t]+\S+(,[ \t]*\S+)*)?(\n|$)/gm;
var DIRECTIVE = /\=[ \t]*(\S*)[ \t]*(.*)/;

var getDirectiveFromLine = function (line) {
  return _.compact(line.match(DIRECTIVE).slice(1));
};

var removeDirectiveLine = function (source, line) {
  return source.replace(line, '\n');
};

var extractDirectives = function (source) {

  // Grab the header of the file where any directives would be.
  var header = (source.match(HEADER) || [''])[0];

  // Pull out the specific directive lines.
  var lines = header.match(DIRECTIVE_LINE) || [];

  // Extract the directive from each line and ensure 'requireself' is present.
  return {
    source: _.reduce(lines, removeDirectiveLine, source),
    directives: _.map(lines, getDirectiveFromLine)
  };
};

var directiveGlob = function (pattern, file, type, cb) {
  if (!pattern) return cb(new Error("'" + type + "' requires a glob pattern"));
  var base = pattern[0] === '.' ? path.dirname(file.path) : '';
  pattern = path.relative('.', path.resolve(base, pattern));
  glob(pattern, {nodir: true}, function (er, paths) {
    if (er) return cb(er);
    if (!paths.length) return cb(new Error("No files match '" + pattern + "'"));
    var obj = {globs: [pattern]};
    obj[type] = paths;
    cb(null, obj);
  });
};

var DIRECTIVES = {
  requireself: function (__, file, cb) { cb(null, {requires: [file.path]}); },
  require: _.partial(directiveGlob, _, _, 'requires'),
  link: _.partial(directiveGlob, _, _, 'links')
};

var getDependencies = function (directive, file, cb) {
  var action = directive[0];
  var fn = DIRECTIVES[action];
  if (!fn) return cb(new Error("Invalid directive: '" + action + "'"));
  fn(directive[1], file, cb);
};

module.exports = function (file, options, cb) {
  var extracted = extractDirectives(file.buffer.toString());
  async.waterfall([
    function (cb) {
      async.map(extracted.directives, function (directive, cb) {
        getDependencies(directive, file, cb);
      }, cb);
    },
    function (dependencies, cb) {
      dependencies = _.reduce(dependencies, function (a, b) {
        return {
          requires: a.requires.concat(b.requires || []),
          links: a.links.concat(b.links || []),
          globs: a.globs.concat(b.globs || []),
        };
      }, {requires: [], links: [], globs: []});
      return cb(null, {
        buffer: new Buffer(extracted.source),
        requires: dependencies.requires.concat(file.requires),
        links: dependencies.links.concat(file.links),
        globs: dependencies.globs.concat(file.globs)
      });
    }
  ], cb);
};
