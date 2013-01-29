fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Directive = require './directive'

module.exports = class Asset
  constructor: (@env, @abs, cb) ->
    @readFile (er) =>
      return cb er if er
      cb null, @

  readFile: (cb) ->
    fs.stat @abs, (er, stats) =>
      return cb er if er
      unless @mtime and @mtime is stats.mtime
        @mtime = stats.mtime
        fs.readFile @abs, (er, data) =>
          return cb er if er
          @raw = data.toString()
          @compressed = ''
          @concat = ''
          i = 1 + (base = path.basename @abs).indexOf '.'
          @exts = if i then base[i..-1].toLowerCase().split '.' else []

          # Gather directives and store in @directives
          @scanDirectives cb
      else
        cb null

  scanDirectives: (cb) ->
    Directive.scan @, (er) =>
      return cb er if er
      @process cb

  process: (cb) ->
    processor = @env.processors[@ext()]
    if processor
      @exts.pop()
      processor.process @, (er) =>
        return cb er if er and er.asset = @
        @process cb
    else

      # Ensure every JS raw file ends with a semicolon and new line. Without
      # this, concatenated scripts (especially minified ones) can cause
      # syntax errors.
      if @ext() is 'js' and not @raw.match /;\n$/
        @raw = @raw.replace /[\s;]*$/, ';\n'
      cb null

  dependencies: (visited = [], required = []) ->
    if @directives
      ext = @ext()
      visited.push @
      for directive in @directives
        for dependency in directive.dependencies
          if dependency in visited
            unless dependency in required or ext isnt dependency.ext()
              required.push dependency
          else
            required = dependency.dependencies visited, required
    required

  concatDependencies: (cb) ->
    dependencies = @dependencies()

    done = _.after dependencies.length - 1, =>

      # Check if sub-dependencies have changed since file reloads
      if _.isEqual dependencies, @dependencies()
        return cb null, _.map(dependencies, (asset) ->
          raw = "#{asset.raw.trim()}\n";
          relative = path.relative(process.cwd(), asset.abs)
          switch asset.ext()
            when 'js'
              raw = "// #{relative}\n#{raw}"
            when 'css'
              raw = "/* #{relative} */\n#{raw}"
            when 'html'
              raw = "<!-- #{relative} -->\n#{raw}"
          raw
        ).join '\n'

      # If the dependency tree has changed, recurse
      @concatDependencies cb

    for dependency in dependencies when dependency isnt @

      # readFile dependencies before including them
      dependency.readFile (er) ->
        return cb er if er
        done()

  build: (cb) ->

    # Check the file for changes
    @readFile (er) =>
      return cb er if er

      @concatDependencies (er, str) =>
        return cb er if er

        @concat = str

        return cb null, @ unless compress = @compress()

        # Compress if necessary or return the uncompressed
        compress @concat, (er, str) =>
          return cb er if er
          @compressed = str
          cb null, @

  saveToDir: (dir, cb) ->
    @build (er) =>
      return cb er if er
      @outPath (er, p) =>
        return cb er if er
        target = path.resolve dir, p
        fs.writeFile target, @toString(), (er) =>
          return cb er if er
          cb null

  saveAs: (p, cb) ->
    @build (er) =>
      return cb er if er
      target = path.resolve process.cwd(), p
      fs.writeFile target, @toString(), (er) =>
        return cb er if er
        cb null

  logical: (cb) ->
    @env.logical @abs, (er, logical) =>
      return cb er if er
      cb null, logical

  outPath: (cb) ->
    @logical (er, logical) =>
      return cb er if er
      cb null, logical +
        (if @exts.length then '.' else '') +
        @exts.join '.'

  ext: ->
    @exts[@exts.length - 1]

  compress: ->
    (compressor = @env.compressors[@ext()])?.compress?.bind compressor

  toString: ->
    if @compress() then @compressed else @concat or @raw
