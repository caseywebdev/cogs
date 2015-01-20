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
  var base = pattern[0] === '.' ? path.dirname(file.path) : '';
  pattern = path.relative('.', path.resolve(base, pattern));
  glob(pattern, {nodir: true}, function (er, paths) {
    if (er) return cb(er);
    return cb(null, [{
      path: pattern,
      type: 'glob'
    }].concat(_.map(paths, function (p) {
      return {path: p, type: type};
    })));
  });
};

var DIRECTIVES = {
  requireself: function (__, file, cb) {
    cb(null, [{path: file.path, type: 'include'}]);
  },
  require: _.partial(directiveGlob, _, _, 'include'),
  link: _.partial(directiveGlob, _, _, 'link')
};

var getDependencies = function (directive, file, cb) {
  var action = directive[0];
  var fn = DIRECTIVES[action];
  if (!fn) return cb(new Error('Invalid directive: "' + action + '"'));
  fn(directive[1], file, cb);
};

module.exports = function (file, options, cb) {
  var extracted = extractDirectives(file.buffer.toString());
  async.map(extracted.directives, function (directive, cb) {
    getDependencies(directive, file, cb);
  }, function (er, dependencies) {
    var type = _.groupBy(_.flatten(dependencies), 'type');
    cb(er, {
      buffer: new Buffer(extracted.source),
      includes: _.map(type.include, 'path').concat(file.includes),
      links: _.map(type.link, 'path').concat(file.links),
      globs: _.map(type.glob, 'path').concat(file.globs)
    });
  });
};
