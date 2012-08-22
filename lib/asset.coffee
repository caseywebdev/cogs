fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Directive = require './directive'

module.exports = class Asset

  constructor: (env, abs, callback) ->

    # Private Methods

    readFile = (callback) =>
      fs.stat @abs, (err, stats) =>
        return callback err if err
        unless @mtime and @mtime is stats.mtime
          @mtime = stats.mtime
          fs.readFile @abs, (err, data) =>
            return callback err if err
            @raw = data.toString()
            @compressed = ''
            @concat = ''
            i = 1 + (base = path.basename abs).indexOf '.'
            @exts = if i then base[i..-1].toLowerCase().split '.' else []

            # Gather directives and store in @directives
            scanDirectives callback
        else
          callback null

    scanDirectives = (callback) =>
      Directive.scan @, (err) =>
        return callback err if err

        process callback

    process = (callback) =>
      processor = @env.processors[@ext()]
      if processor
        @exts.pop()
        processor.process @, (err) =>
          return callback err if err
          process callback
      else

        # Ensure every JS raw file ends with a semicolon and new line. Without
        # this, concatenated scripts (especially minified ones) can cause
        # syntax errors.
        if @ext() is 'js' and not @raw.match /;\n$/
          @raw = @raw.replace /[\s;]*$/, ';\n'
        callback null

    concatDependencies = (callback) =>
      dependencies = @dependencies()
      n = 0
      m = dependencies.length-1
      if m
        _.each dependencies, (dependency) =>
          unless dependency is @
            # Update dependencies before including them
            dependency.update (err) =>
              return callback err if err

              if ++n is m

                # Check if sub-dependencies have changed since file reloads
                if _.isEqual dependencies, @dependencies()
                  callback null, _.pluck(dependencies, 'raw').join ''
                else

                  # If the dependency tree has changed, recurse
                  concatDependencies callback
      else
        callback null, @raw

    compress = =>
      @env.compressors[@ext()]?.compress

    # Public Methods

    @update = (callback) ->
      readFile callback

    @toString = ->
      if compress() then @compressed else @concat or @raw

    @build = (callback) ->

      # Update the file if it has changed
      @update (err) =>
        return callback err if err

        concatDependencies (err, str) =>
          return callback err if err

          @concat = str

          return callback null, @ unless compress()

          # Compress if necessary or return the uncompressed
          compress() @concat, (err, str) =>
            return callback err if err
            @compressed = str
            callback null, @

    @ext = ->
      _.last @exts

    @logical = (callback) ->
      @env.logical @abs, (err, logical) =>
        return callback err if err
        callback null, logical

    @outPath = (callback) ->
      @logical (err, logical) =>
        return callback err if err
        callback null, logical +
          (if @exts.length then '.' else '') +
          @exts.join '.'

    @saveToDir = (dir, callback) ->
      @build (err) =>
        return callback err if err
        @outPath (err, p) =>
          return callback err if err
          target = path.resolve dir, p
          fs.writeFile target, @toString(), (err) =>
            return callback err if err
            callback null

    @dependencies = (visited = [], required = []) ->
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

    # Constructor Code
    @env = env
    @abs = abs

    @update (err) =>
      return callback err if err
      callback null, @
