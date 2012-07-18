fs = require 'fs'
path = require 'path'
_ = require 'underscore'
should = require 'should'
xl8 = require '../lib'
uglifyjs = require '../lib/compressors/uglifyjs'
cleanCss = require '../lib/compressors/clean-css'
env = new xl8.Env
  paths: 'test/cases'

describe 'Asset', ->

  describe '#process', ->
    it 'should process `.coffee`', (done) ->
      env.asset 'coffee', (err, asset) ->
        return done err if err

        asset.process (err) ->
          return done err if err

          done()

  describe '#outPath', ->
    it 'should give `.coffee` a `.js`', (done) ->
      env.asset 'coffee', (err, asset) ->
        asset.outPath (err, p) ->
          return done err if err

          p.should.equal 'coffee.js'
          done()

  describe '#xl8', ->
    it 'should translate coffeescript', (done) ->
      env.asset 'coffee', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          fs.readFile 'test/cases/coffee.js', (err, data) ->
            return done err if err

            str.should.equal data.toString()
            done()

    it 'should translate stylus', (done) ->
      env.asset 'styl', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          fs.readFile 'test/cases/styl.css', (err, data) ->
            return done err if err

            str.should.equal data.toString()
            done()
