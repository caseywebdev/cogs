cogs('scripts/index.es6', {
  manifest: {
    __VERSION__: require('./package.json').version,
    __IN__: {},
    'scripts/index.es6': {
      target: 'public/index.js',
      hash: '123abc',
      includes: {
        'bower_components': '123123'
      },
      links: {

      },
      globs: {
        'blah/blah/**/*': 'hash'
      }
    }
  },
  in: {
    es6: {
      out: 'js',
      transformers: {
        name: '6to5',
        options: {
          modules: 'amd'
        }
      }
    },
    js: {
      transformers: [
        'concat-amd', {
        name: 'uglify-js',
        options: {
          ignore: 'bower_components/jquery/jquery.min.js'
        }
      }]
    }
  }
});

Use cached if
 - manifest[source] exists
 - __COGS_VERSION__ matches
 - __CONFIG__ _.isEqual
 - target matches
 - target file exists and matches hash
 - every dependency hash matches
 - every glob entry matches
