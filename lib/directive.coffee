fs = require 'fs'
path = require 'path'
glob = require 'glob'
_ = require 'underscore'

HEADER_PATTERN = ///
  ^ (
    \s* (
      (/\*[\s\S]*?\*/) |        # Multi-line /* comment */
      (###[\s\S]*?###) |        # Multi-line ### comment ###
      (//.*) |                  # Single-line // comment
      (#.*)                     # Single-line # comment
    ) \n?                       # Grab the trailing newline
  )+
///

DIRECTIVE_LINE_PATTERN = /^[^\w\n]*=.*\n?/gm

DIRECTIVE_PATTERN = /\=\s*(\S*)\s*(.*)/

module.exports = class Directive

  constructor: (asset, action, argument, callback) ->

    actions =

      # Require a single file
      require: (logical, callback) =>
        if typeof logical is 'function'
          callback = logical
          logical = @argument
        @asset.env.asset logical, (err, asset) =>
          return callback err if err
          callback null, [asset]

      # Require many files
      requiremany: (logicals, callback) =>
        if typeof logicals is 'function'
          callback = logicals
          logicals = @argument.split ','
        n = 0
        m = logicals.length
        assets = []
        _.each logicals, (logical) =>
          actions.require logical, (err, asset) ->
            return callback err if err
            assets.push asset
            if ++n is m
              callback null, _.flatten assets

      # A special case require for the current asset
      requireself: (callback) =>
        callback null, [@asset]

      # Require an entire directory, recursively
      requiretree: (callback) =>
        base = path.dirname @asset.abs
        target = path.resolve base, @argument
        glob "#{target}/**/*.*", (err, files) =>
          return callback err if err
          actions.requiremany files, callback

      # Require a directory, just the first level
      requiredir: (callback) =>
        base = path.dirname @asset.abs
        target = path.resolve base, @argument
        fs.readdir target, (err, files) =>
          return callback err if err
          actions.requiremany files, callback

    @asset = asset
    @argument = argument
    if actions[action]
      actions[action] (err, dependencies) =>
        return callback err if err
        @dependencies = dependencies
        callback null, @
    else
      callback new Error "'#{action}' is not a valid directive action"

  @scan: (asset, callback) =>

    # Reset the directives
    asset.directives = []

    # Grab the header of the file where any directives would be
    header = asset.raw.match(HEADER_PATTERN) or ['']

    # Pull out the specific directive lines
    directiveLines = header[0].match(DIRECTIVE_LINE_PATTERN) or []

    # Push a requireself to ensure the body is included
    directiveLines.push '=requireself'

    n = 0
    m = directiveLines.length
    _.each directiveLines, (directiveLine, i) =>

      # Split the directive and argument
      directive = directiveLine.match DIRECTIVE_PATTERN

      # Normalize the directive action. This allows the use of any of
      #     = require-self
      #     = require_self
      #     = requireSelf
      #     = requireself
      # etc...
      action = directive[1].toLowerCase().replace /[^a-z]/ig, ''

      # Should be undefined for `requireself`, but exist for everything else
      argument = directive[2]

      # Erase the directive line in the source
      asset.raw = asset.raw.replace directiveLine, ''

      # Add the directive to the assets directives list
      new @ asset, action, argument, (err, directive) ->
        return callback err if err
        asset.directives[i] = directive
        callback null if ++n is m
