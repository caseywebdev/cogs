fs = require 'fs'
path = require 'path'
_ = require 'underscore'
should = require 'should'
xl8 = require '../lib'

describe 'Env', ->

  describe '#constructor()', ->
    it 'should initialize with no args', ->
      env = new xl8.Env
    it 'should initialize with compressors and save them', ->
      jsCompressor = require '../lib/compressors/uglifyjs'
      cssCompressor = require '../lib/compressors/clean-css'
      env = new xl8.Env
        compressors:
          js: jsCompressor
          css: cssCompressor
      env.compressors.js.should.equal jsCompressor
      env.compressors.css.should.equal cssCompressor

  describe 'path functions', ->
    root = path.resolve "#{__dirname}/../"
    paths = [
      'lib'
      'lib/compressors'
      'lib/processors'
    ]
    env = new xl8.Env paths: paths

    describe '#abs()', (done) ->
      it 'should convert logical to absolute correctly', ->
        tests =
          'index': "#{root}/lib/index.coffee"
          'index.coffee': "#{root}/lib/index.coffee"
          'inde': ''
          'coffee': "#{root}/lib/processors/coffee.coffee"
          'index.js': ''

        n = 0
        _.each tests, (abs, logical) ->
          env.abs logical, (err, abs2) ->
            if err
              (abs2 is undefined).should.be.true
            else
              abs.should.equal abs2
            done() if ++n is tests.length

    describe '#logical()', (done) ->
      it 'should convert absolute paths to logical paths correctly', ->
        tests =
          'index': "#{root}/lib/index.coffee"
          'dne': '/does/not/exist'
          'dne2': ''
          'processors/coffee': "#{root}/lib/processors/coffee.coffee"

        n = 0
        _.each tests, (abs, logical) ->
          env.logical abs, (err, logical2) ->
            if err
              (logical2 is undefined).should.be.true
            else
              logical.should.equal logical2
            done() if ++n is tests.length
