# resolve-tspaths

[![package](https://badge.fury.io/js/resolve-tspaths.svg)](https://www.npmjs.com/package/resolve-tspaths)
[![license](https://img.shields.io/:license-mit-blue.svg)](LICENSE)

If you use Typescript's
[path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
feature to avoid `../../../../../` in your imports, you may have found that
compiling with `tsc` doesn't convert your aliases to proper relative paths. This
causes problems as the compiled JavaScript code can't actually run with those
path aliases - you'll get a "module not found" error. If your project exports
type definitions, your `.d.ts` files will also be broken if they are shipped
with path aliases.

Use this package after `tsc` builds your code to replace any path aliases with
relative paths - this means that you can develop using path aliases whilst still
being able to ship working JavaScript code.

_Yes, there are plugins that can handle this when you use bundlers such as
Webpack or Rollup. But if you dont' want to use a bundler, this package is a
convenient solution._

## Usage

`resolve-tspaths` is a command line utility.

1. Install as a dev dependency using npm or yarn.

   ```sh
   yarn add -D resolve-tspaths
   ```

   ```sh
   npm install --save-dev resolve-tspaths
   ```

2. Add it as a part of your build script in `package.json` after `tsc`.

   ```json
   {
     "scripts": {
       "build": "tsc && resolve-tspaths"
     }
   }
   ```

## Options

_`resolve-tspaths` uses some reasonable defaults. For most cases, you probably
won't need to specify any options._

#### `--project, -p`

Specify the `tsconfig` that the program should use. If not provided, it defaults
to `tsconfig.json`.

#### `--src, -s`

Specify the source directory. If not provided, it defaults to `./src`.

#### `--out, -o`

Specify the output directory of the compiled code where `resolve-tspaths` should
perform its changes. If not provided, it will default to
`compilerOptions.outDir` from your `tsconfig`.

#### `--ext`

Provide a comma separated list of file extensions in the output directory that
the program should process. Defaults to `js,d.ts`, which will process `.js` and
`.d.ts` files.

#### `--verbose`

Use this flag to print verbose logs to the console.

#### `--noEmit`

Use this flag to not emit any changes to your files. Recommended to be used with
`--verbose` for debugging which files the program will change if you don't use
`--noEmit`.

## Comparison to existing packages

### [tsconfig-paths](https://github.com/dividab/tsconfig-paths)

`tsconfig-paths` is a runtime dependency. This package is used at **build
time**, which means your shipped code doesn't need to have this package
included, and can run natively using Node or in the browser.

### [tscpaths](https://github.com/joonhocho/tscpaths)

Performs the same function as **tscpaths** - but that project is no longer
maintained. A pain point with that package was also that it no control over the
logging which was extremely verbose. This package provides several more options
for better control. It is also well tested.

## Inspiration

This project was heavily inspired by
[tscpaths by joonhocho](https://github.com/joonhocho/tscpaths), but it is sadly
no longer maintained. My first attempt at building this library was based on a
fork of `tscpaths`. Since the project has matured, it was moved out to its own
repository.

## License

See [LICENSE](LICENSE).
