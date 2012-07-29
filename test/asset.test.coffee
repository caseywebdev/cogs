fs = require 'fs'
path = require 'path'
_ = require 'underscore'
should = require('chai').should()
xl8 = require '../lib'
Env = require '../lib/env'
Asset = require '../lib/asset'
Directive = require '../lib/directive'
uglifyjs = require '../lib/compressors/uglifyjs'
cleanCss = require '../lib/compressors/clean-css'
env = new xl8.Env
  paths: 'test/cases'

describe 'Asset', ->

  describe 'constructor()', ->
    asset = null
    before (done) ->
      env.asset 'coffee/a', (err, asset2) ->
        return done err if err
        asset = asset2
        done()

    it 'should send the instance in the callback', ->
      asset.should.be.an.instanceof Asset

    it 'should have at least one directive', ->
      asset.directives.length.should.be.above 0
      asset.directives[0].should.be.an.instanceof Directive

    it 'should have a parent environment', ->
      asset.env.should.be.an.instanceof Env

  describe '#xl8', ->
    it 'should translate `.coffee` to `.js`', (done) ->
      env.asset 'coffee/a', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          env.asset 'coffee/result', (err, asset2) ->
            return done err if err

            asset.toString().should.equal asset2.toString()
            done()

    it 'should translate `.styl` to `.css`', (done) ->
      env.asset 'styl/a', (err, asset) ->
        return done err if err

        asset.xl8 (err, str) ->
          return done err if err

          env.asset 'styl/result', (err, asset2) ->
            return done err if err

            asset.toString().should.equal asset2.toString()
            done()

  describe '#outPath', ->
    it 'should give `.coffee` a `.js`', (done) ->
      env.asset 'coffee/a', (err, asset) ->
        return done err if err
        asset.outPath (err, p) ->
          return done err if err

          p.should.equal 'coffee/a.js'
          done()

    it 'should give `.styl` a `.css`', (done) ->
      env.asset 'styl/a', (err, asset) ->
        return done err if err
        asset.outPath (err, p) ->
          return done err if err

          p.should.equal 'styl/a.css'
          done()
