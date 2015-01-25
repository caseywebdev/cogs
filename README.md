# Cogs

The fast file transform pipeline. [![Build Status](https://secure.travis-ci.org/caseywebdev/cogs.png)](http://travis-ci.org/caseywebdev/cogs)

> George Jetson's workweek is typical of his era: an hour a day, two days a
> week. His boss is Cosmo Spacely, the diminutive yet bombastic owner of Spacely
> Space Sprockets. Spacely has a competitor, H. G. Cogswell, owner of the rival
> company Cogswell Cogs (sometimes known as Cogswell's Cosmic Cogs).

##Install


```bash
npm install -g cogs
```

## Usage

Cogs leverages a simple command line interface paired with a powerful
declarative config file.

```bash
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
```

## Test

```bash
git clone git@github.com:caseywebdev/cogs
cd cogs
npm install
make test
```
