cogs('scripts/index.es6', {
  concatAmd: true,
  in: {
    es6: {
      out: 'js',
      steps: [
        '6to5'
      ]
      name: '6to5',
      options: {

      }
    }],

    scss: 'scss',
    vert: 'txt',
    frag: 'txt'
  },
  compressors: {
    js: {
      name: 'uglify-js',
      options: {
        ignore: [
          'ckeditor'
        ]
      }
    }
  }
}, cb);

var CACHE = {};

var cogs = function (file, options, cb) {
  var abs = path.resolve(file);
};

var getTargetDir = function (source) {

};

//cogs.json
{
  client: {

  },
  server: {

  }
}

cogs('scripts/index.es6', {
  manifest: {
    __COGS_VERSION__: require('./package.json').version,
    __CONFIG__: '123abc',
    'scripts/index.es6': {
      target: 'public/index.js'
      hashes: {

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
