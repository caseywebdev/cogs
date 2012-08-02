# Growl Notifier
growl = require 'growl'

module.exports = class GrowlNotifier extends (require './notifier')

  notify: (options = {}) ->
    growl options.message,
      name: 'xl8'
      title: options.title or 'xl8'
      image: @images[options.image] or options.image or @images.done
      sticky: options.sticky or false
