# Cogs

The fast file transform pipeline. [![Build Status](https://secure.travis-ci.org/caseywebdev/cogs.png)](http://travis-ci.org/caseywebdev/cogs)

> George Jetson's workweek is typical of his era: an hour a day, two days a
> week. His boss is Cosmo Spacely, the diminutive yet bombastic owner of Spacely
> Space Sprockets. Spacely has a competitor, H. G. Cogswell, owner of the rival
> company Cogswell Cogs (sometimes known as Cogswell's Cosmic Cogs).

## Install


```bash
npm install cogs
```

## Usage

Cogs leverages a simple command line interface paired with a powerful
declarative config file.

```
Usage: cogs [options]

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -c, --config-path [path]  load config from [path] [default cogs.js]
  -d, --dir [path]          run in [path] instead of current directory
  -w, --watch [path]        build when [path] changes, can be specified multiple times
  -p, --use-polling         use stat polling instead of fsevents
  -s, --silent              do not output build information, only errors
  -C, --no-color            disable colored output
```

## Config

Every good project needs a Cogs config file. This file can be JavaScript or
JSON, as long as `require`ing the file returns the config object. Here's an
example in JavaScript (mainly so comments can be added in this case):

```js
module.exports = {

  // Define the transformer pipeline here.
  transformers: [
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

    // Impromptu transformers are as easy as specifying a function.
    {
      fn: ({file: {buffer}, options}) => ({buffer: Buffer.from(`${buffer}!`)),
      only: '**/*.exciting'
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

    // Save to public dir and rename .es6 files to .js
    'src/foo/**/*': {
      dir: 'public',
      ext: {
        '.es6': '.js'
      }
    }
  }
};
```

## Transformers

Transformers are generally node modules that can be downloaded from npm.
Alternatively, you can create your own transformers for your projects and
reference them in the transformers array.

[Here are some transformers to get you started](https://github.com/search?q=cogs-transformer&type=Repositories)

## Develop

```bash
git clone git@github.com:caseywebdev/cogs
cd cogs
bin/watch-test
```
