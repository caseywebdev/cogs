fs = require 'fs'
path = require 'path'
_ = require 'underscore'
should = require('chai').should()
xl8 = require '../lib'
uglifyjs = require '../lib/compressors/uglifyjs'
cleanCss = require '../lib/compressors/clean-css'
env = new xl8.Env
  paths: 'test/cases'

describe 'Asset', ->

  describe '#process', ->
    it 'should process `.coffee`', (done) ->
      env.asset 'coffee.coffee', (err, asset) ->
        return done err if err

        asset.process (err) ->
          return done err if err

          done()

    it 'should process `.styl`', (done) ->
      env.asset 'styl.styl', (err, asset) ->
        return done err if err

        asset.process (err) ->
          return done err if err

          done()

  describe '#outPath', ->
    it 'should give `.coffee` a `.js`', (done) ->
      env.asset 'coffee.coffee', (err, asset) ->
        asset.outPath (err, p) ->
          return done err if err

          p.should.equal 'coffee.js'
          done()

    it 'should give `.styl` a `.css`', (done) ->
      env.asset 'styl.styl', (err, asset) ->
        asset.outPath (err, p) ->
          return done err if err

          p.should.equal 'styl.css'
          done()

  describe '#xl8', ->
    it 'should translate `.coffee` to `.js`', (done) ->
      env.asset 'coffee.coffee', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          env.asset 'coffee.js', (err, asset2) ->
            return done err if err

            asset.toString().should.equal asset2.toString()
            done()

    it 'should translate `.styl` to `.css`', (done) ->
      env.asset 'styl.styl', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          env.asset 'styl.css', (err, asset2) ->
            return done err if err

            asset.toString().should.equal asset2.toString()
            done()
