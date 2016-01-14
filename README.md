# Cogs

The fast file transform pipeline. [![Build Status](https://secure.travis-ci.org/caseywebdev/cogs.png)](http://travis-ci.org/caseywebdev/cogs)

> George Jetson's workweek is typical of his era: an hour a day, two days a
> week. His boss is Cosmo Spacely, the diminutive yet bombastic owner of Spacely
> Space Sprockets. Spacely has a competitor, H. G. Cogswell, owner of the rival
> company Cogswell Cogs (sometimes known as Cogswell's Cosmic Cogs).

## Install


```bash
npm install -g cogs
```

## Usage

Cogs leverages a simple command line interface paired with a powerful
declarative config file.

```
Usage: cogs [options] [source-glob[:target-dir] ...]

Options:

  -h, --help                  output usage information
  -V, --version               output the version number
  -c, --config-path [path]    load config from [path] [default cogs.js]
  -d, --dir [path]            run in [path] instead of current directory
  -m, --manifest-path [path]  load/save build manifest at [path]
  -w, --watch-paths [paths]   rebuild when [paths] change
  -p, --use-polling           use stat polling instead of fsevents
  -s, --silent                do not output build information, only errors
  -C, --no-color              disable colored output
  -D, --debounce [ms]         debounce changes [ms]ms [default 250]
```

## Config

Every good project needs a Cogs config file. This file can be JavaScript or
JSON, as long as `require`ing the file returns the config object. Here's an
example in JavaScript (mainly so comments can be added in this case):

```js
module.exports = {

  // [Optional] Specify a manifest file path for Cogs to load/save to. While not
  // necessary, leveraging a manifest file can drastically improve subsequent
  // build times. This value can also be set/overriden with the command line.
  manifestPath: 'manifest.json',

  // [Optional] Watch the specified paths, and pass the given options along to
  // [chokidar](https://github.com/paulmillr/chokidar).
  watch: {
    paths: ['src', 'styles'],
    options: {

      // Because it is essential for watching over NFS, `usePolling` can be
      // enabled with the command line for convenience.
      usePolling: true
    }
  },

  // Define the transformer pipeline here.
  in: {

    // This key specifies the file extension to match.
    es6: {

      // `out` specifies what the output extension should be after
      // transformations in this section are done. If no `out` is specified, the
      // extension does not change.
      out: 'js',

      // Define transformers to take this extension from `es6` to `js`. See all
      // of the transformers in the Transformers section.
      transformers: [{

        // This is the name of the transformer.
        name: 'babel',

        // [Optional] Only apply this transformer to files that match this/these
        // glob(s).
        only: 'my/only/dir/**/*',

        // [Optional] Exclude files that match this/these glob(s) from this
        // transformer.
        except: [
          'skip/this/one',
          'and/all/of/these/**/*'
        ],

        // These are the options to be passed to the transformer.
        options: {
          modules: 'umd'
        }
      }]
    },

    // The es6-transformed files will next pass through this transformer.
    js: {
      transformers: 'uglify-js'
    }
  },

  // Define source globs and targets here. This is where you define what to
  // transform and where it should go.
  builds: {
    'src/index.es6': 'public/index.js',

    'src/public/**/*': {dir: 'public'},

    // Use the fingerprint: true option to fingerprint saved files.
    'styles/**/*': (file, sourceGlob) => {
      return 'public/foo/bar/' + file.path;
    }
  }
};
```

## Transformers

Transformers are generally node modules that can be downloaded from npm.
Alternatively, you can create your own transformers for your projects and
reference them in the transformers array.

[Here are some transformers to get you started](https://github.com/search?q=cogs-transformers&type=Repositories)

## Develop

```bash
# Get situated...
git clone git@github.com:caseywebdev/cogs
cd cogs
npm install

# Run the tests when files are changed.
make

# Run the tests once then exit.
make test
```
