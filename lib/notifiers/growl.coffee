# Growl Notifier
growl = require 'growl'
path = require 'path'
images =
  done: path.resolve 'gfx', 'done.png'
  fail: path.resolve 'gfx', 'fail.png'
  progress: path.resolve 'gfx', 'progress.png'

exports.notify = (options = {}) ->
  growl options.message,
    name: 'xl8'
    title: options.title or 'xl8'
    image: images[options.image] or options.image or images['done']
    sticky: options.sticky or false
