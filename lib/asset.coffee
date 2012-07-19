fs = require 'fs'
path = require 'path'
_ = require 'underscore'

class Asset

  constructor: (env, abs, callback) ->
    @mtime = 0
    @env = env
    @abs = abs
    i = 1 + abs.indexOf '.'
    @originalExts = if i then abs[i..-1].toLowerCase().split '.' else []

    @readFile (err) =>
      if err
        callback err
      else
        callback err, @env.cache[@abs] = @

  toString: ->
    if @compressEnabled() then @compressedStr else @str

  xl8: (callback, asDependency = false) ->

    # Update the file if it has changed
    @readFile (err) =>
      return callback err if err

      # Process the extensions
      @process (err) =>
        return callback err if err

        # Inject dependencies
        # Compress if necessary or return the uncompressed
        if @compressEnabled()
          @compress (err, str) =>
            return callback err if err
            callback err, @compressedStr = str
        else
          callback err, @str

  process: (callback) ->
    processor = @env.processors[@ext()]
    if processor
      @exts.pop()
      processor.process @, (err) =>
        return callback err if err

        @process callback
    else
      callback()

  compressEnabled: ->
    not not @env.compressors[@ext()]

  compress: (callback) ->
    @env.compressors[@ext()].compress @, callback

  ext: ->
    @exts[@exts.length - 1]

  readFile: (callback) ->
    fs.stat @abs, (err, stats) =>
      return callback err if err

      unless @mtime - (@mtime = stats.mtime) is 0
        @str = fs.readFile @abs, (err, data) =>
          return callback err if err

          @str = data.toString()
          @exts = _.clone @originalExts
          callback err
      else
        callback err

  outPath: (callback) ->
    @env.logical @abs, (err, p) =>
      return callback err if err

      callback err, p +
        (if @exts.length then '.' else '') +
        @exts.join '.'

  saveToDir: (dir, callback) ->
    @outPath (err, p) =>
      return callback err if err

      fs.writeFile path.resolve(dir, p), @toString(), (err) ->
        return callback err if err

        callback()


module.exports = Asset
