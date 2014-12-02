# Cogs

[![Build Status](https://secure.travis-ci.org/caseywebdev/cogs.png)](http://travis-ci.org/caseywebdev/cogs)

> George Jetson's workweek is typical of his era: an hour a day, two days a
> week. His boss is Cosmo Spacely, the diminutive yet bombastic owner of Spacely
> Space Sprockets. Spacely has a competitor, H. G. Cogswell, owner of the rival
> company Cogswell Cogs (sometimes known as Cogswell's Cosmic Cogs).

##Install


```bash
npm install -g cogs
```

To avoid unnecessary dependencies, cogs does not include any of the language
preprocessors in its dependency list. If you'd like to use CoffeeScript and
Stylus, for example, you'll want to

```bash
npm install [-g] coffee-script stylus
```

before trying to compile anything. The same is true for compressors, so if you
want to compress your concatenated JavaScript and CSS files be sure to

```bash
npm install [-g] uglify-js csso
```

## Usage

### Command Line Interface

Cogs comes with a handy command line interface.

```bash
Usage: node ./bin/cogs [options] target-glob:destination-dir

Options:
  --options, -o              JSON for options to be passed to processors and compressors.
  --compress, -c             Compress using UglifyJS and CSSO.                             [default: false]
  --watch, -w                A path or comma-separated paths to watch.
  --ignore, -i               A regex of file paths to ignore.                              [default: "/\\."]
  --config, -C               A config file (JS or JSON) specifying command line options.   [default: "cogs.json"]
  --fingerprint, -f          Fingerprint files with their env.algorithm value.             [default: false]
  --export-fingerprints, -F  Save a JSON file fingerprinted name mappings.
  --silent, -s               Silence build info, errors will still output to stderr.       [default: false]
  --no-color, -n             Do not color output.                                          [default: false]
```

Generally, you'll want to put your options in a `cogs.json` or similar for each
project.

Here is an example of watching all CoffeeScript files in the `src` directory and
exporting their compiled JavaScript results to the `dist` directory everytime
there is a change.

```bash
cogs -w src src/**/*:dist
```

You can also use Sprockets-like directives in your files to make concatenation
simple.

**index.coffee**
```coffee
#= require ./a
#= requireSelf
#= require ./b

sayHi = -> console.log 'Hello!'
```

Now assuming `a.coffee` and `b.coffee` exist in the same directory as
`index.coffee`, we can run

```bash
cogs -cw src src/index.coffee:dist
```

And notice that whenever a change is made to `index.coffee`, `a.coffee`, or
`b.coffee` the resulting `dist/index.js` is updated.

### Node API

Still a WIP, check the tests for some examples.

## Test

```bash
git clone git@github.com:caseywebdev/cogs
cd cogs
npm install
make test
```
