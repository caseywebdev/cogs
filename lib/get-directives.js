var _ = require('underscore');

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

module.exports = _.memoize(function (source) {

  // Grab the header of the file where any directives would be.
  var header = (source.match(HEADER) || [''])[0];

  // Pull out the specific directive lines.
  var lines = header.match(DIRECTIVE_LINE) || [];

  // Extract the directive from each line and ensure 'requireself' is present.
  return _.map(lines, getDirectiveFromLine).concat([['requireself']]);
}, _.property('hash'));
