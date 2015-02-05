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
        name: '6to5',

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
    'src/index.es6': 'public',

    // Use the fingerprint: true option to fingerprint saved files.
    'styles/**/*': {dir: 'public', fingerprint: true}
  }
};
```

## Transformers

Don't see a transformer you need? Feel free to open an issue or pull request.

### 6to5

Convert ES6 to ES5.

`options` are passed to [6to5](https://github.com/6to5/6to5).

### coffee-script

Convert CoffeeScript to JavaScript.

`options` are passed to
[coffee-script](https://github.com/jashkenas/coffeescript).

### concat-amd

Pull dependencies from `define` statements.

`options`
- `base` module names are relative to this path

### csso

Minify css with [csso](https://github.com/css/csso).

### eco

Convert an [Eco](https://github.com/sstephenson/eco) template into JavaScript
template function.

### extract-directives

Extract `require` and `link` directives from a file's initial comments.

In the following example, the file itself will be proceeded by every file in the
templates directory.

```js
//= requireself
//= require ./templates/**/*

var foo = 'bar';
```

In this example, the file will be prepended with `normalize.css`.

```css
/*
= require bower_components/normalize/normalize.css
*/

.foo {
  color: blue;
}
```

### json

Convert JSON to a JavaScript module with the JSON as the default export.

### marked

Convert Markdown to HTML.

`options` are passed to [marked](https://github.com/chjj/marked).

### prepend-path

Prepend the file with it's path. This is useful for debugging because the
original file path remains visible even after concatenation.

`options`
- `before` the string to be prepended before the file path (i.e. `'// '`)
- `after` the string to be appended after the file path (i.e. `' */'`)

### sass

Convert Sass to CSS.

`options` are passed to [node-sass](https://github.com/sass/node-sass).

### txt

Convert text to a JavaScript module with the text as the default export.

### uglify-js

Minify JavaScript.

`options` are passed to [uglify-js](https://github.com/mishoo/UglifyJS2).

### imagemin

Compress gif/jpg/png/svg with [Imagemin](https://github.com/imagemin/imagemin).

`options`
- `plugin` specify which plugin to use (`svgo`, `pngquant`, etc...)
- `pluginOptions` specify which options (if any) to pass to the plugin

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
