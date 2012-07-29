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

        unless @mtime and @mtime - (@mtime = stats.mtime) is 0
          fs.readFile @abs, (err, data) =>
            return callback err if err
            @raw = data.toString()
            @compressed = ''
            @concat = ''
            i = 1 + abs.indexOf '.'
            @exts = if i then abs[i..-1].toLowerCase().split '.' else []

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
        callback null

    concatDependencies = =>
      _.pluck(@dependencies(), 'raw').join ''

    compress = =>
      @env.compressors[@ext()]?.compress

    # Public Methods

    @toString = ->
      if compress() then @compressed else @concat or @raw

    @xl8 = (callback) ->

      # Update the file if it has changed
      readFile (err) =>
        return callback err if err

        @concat = concatDependencies()

        return callback null, @concat unless compress()

        # Compress if necessary or return the uncompressed
        compress() @concat, (err, str) =>
          return callback err if err
          callback null, @compressed = str

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
      @outPath (err, p) =>
        return callback err if err
        target = path.resolve dir, p
        fs.writeFile target, @toString(), (err) ->
          return callback err if err
          callback null

    @dependencies = (visited = [], required = []) ->
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

    readFile (err) =>
      return callback err if err
      callback null, @
