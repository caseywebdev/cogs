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
  // build times. This value can also be set/overridden with the command line.
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
  pipe: [
    {
      // This is the name of the transformer to use for this piece of the
      // pipeline. It can be shorthand like this, or the fully-qualified package
      // name like 'cogs-transformer-babel'.
      name: 'babel',

      // The "only" key can be used to define a glob or array of globs, one of
      // which must be matched for the file to go through this transformer.
      only: 'src/**/*.js',

      // "except" is the opposite of only. Paths that match these globs will not
      // go through the transformer.
      except: [
        'src/some/outlier/file.js',
        'src/more/outliers/**/*.js'
      ],

      // "options" will be passed directly to the transformer.
      options: {
        presets: ['stage-0', 'es2015', 'react']
      }
    },

    // Some other examples...
    {
      name: 'uglify-js',
      only: '**/*.js',
      except: '**/*+(-|_|.)min.js'
    },
    {
      name: 'sass',
      only: 'src/**/*.scss'
    },
    {
      name: 'clean-css',
      only: '**/*.+(css|scss)'
    }
  ],

  // Define source globs and targets here. This is where you define what to
  // transform and where it should go.
  builds: {
    'src/index.es6': 'public/index.js',

    'src/public/**/*': {dir: 'public'},

    'styles/**/*': (file, sourceGlob) => {
      return 'public/foo/bar/' + file.path;
    },

    // Use the fingerprint: true option to fingerprint saved files.
    'src/foo/**/*': {
      dir: 'public',
      fingerprint: true
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
