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

DIRECTIVE_LINE_PATTERN = /^[^\w\n]*=\s*\w+(\s+\S+(,\s*\S+)*)?(\n|$)/gm

DIRECTIVE_PATTERN = /\=\s*(\S*)\s*(.*)/

module.exports = class Directive

  constructor: (@asset, @action, @argument, cb) ->
    @asset = asset
    @argument = argument
    if @[@action]
      @[@action] (er, dependencies) =>
        return cb er if er
        @dependencies = dependencies
        cb null, @
    else
      cb new Error "'#{@action}' is not a valid directive action in '#{asset.abs}'"

  @scan: (asset, cb) ->

    # Reset the directives
    asset.directives = []

    # Grab the header of the file where any directives would be
    header = asset.raw.match(HEADER_PATTERN) or ['']

    # Pull out the specific directive lines
    lines = header[0].match(DIRECTIVE_LINE_PATTERN) or []
    actions = []
    for line in lines

      # Trim extra space
      line = line.trim()

      # Split the directive and argument
      directive = line.match DIRECTIVE_PATTERN

      # Normalize the directive action. This allows the use of any of
      #     = require_self
      #     = requireSelf
      #     = requireself
      # etc...
      action = directive[1].toLowerCase().replace /[^a-z]/g, ''

      # Should be undefined for `requireself`, but exist for everything else
      argument = directive[2]

      # Erase the directive line in the source
      asset.raw = asset.raw.replace line, ''

      # Push the action
      actions.push [action, argument]

    # Push a requireself action to ensure the root file is included
    actions.push ['requireself']

    done = _.after actions.length, cb

    for action, i in actions then do (action, i) ->

      # Add the directive to the assets directives list
      new Directive asset, action[0], action[1], (er, directive) ->
        return cb er if er
        asset.directives[i] = directive if directive
        done()

  # Require a single file
  require: (logical, cb) ->
    if typeof logical is 'function'
      cb = logical
      logical = @argument
    @asset.env.asset logical, (er, asset) ->
      return cb er if er
      cb null, [asset]

  # Require many files
  requiremany: (logicals, cb) ->
    if typeof logicals is 'function'
      cb = logicals
      logicals = @argument.split ','
    assets = []
    done = _.after logicals.length, -> cb null, assets
    for logical in logicals
      @require logical.trim(), (er, asset) ->
        return cb er if er
        assets = assets.concat asset
        done null, assets

  # A special case require for the current asset
  requireself: (cb) ->
    cb null, [@asset]

  # Require an entire directory, recursively
  requiretree: (cb) ->
    base = path.dirname @asset.abs
    target = path.resolve base, @argument
    glob "#{target}/**/*.*", (er, files) =>
      return cb er if er
      @requiremany files, cb

  # Require a directory, just the first level
  requiredir: (cb) ->
    base = path.dirname @asset.abs
    target = path.resolve base, @argument
    fs.readdir target, (er, files) =>
      return cb er if er
      @requiremany files, cb
