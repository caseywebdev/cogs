_ = require 'underscore'
Env = require './env'
processors = require './processors'
compressors = require './compressors'

_(module.exports).extend {Env}, processors, compressors
