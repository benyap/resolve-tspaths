# resolve-tspaths

[![npm](https://img.shields.io/npm/v/resolve-tspaths?style=flat-square)](https://www.npmjs.com/package/resolve-tspaths)
[![license](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](LICENSE)

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

**Sample `tsconfig.json`:**

```ts
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
}

```

The following types of paths are currently supported:

**CommonJS imports**

```ts
const { ... } = require("~/some/path");
```

**ESM imports**

```ts
import * as stuff from "~/some/path";
import stuff from "~/some/path";
import { stuff } from "~/some/path.js";
import { stuff as myStuff } from "~/some/path.mjs";
import data from "~/some/data/path.json";
```

_NOTE: When importing JSON files, ensure that you use the `.json` extension. See
issue [#253](https://github.com/benyap/resolve-tspaths/issues/253)._

**ESM dynamic imports**

```ts
const stuff = await import("~/some/path");
```

**ESM exports**

```ts
export * from "~/some/path";
export * as stuff from "~/some/path";
export { stuff } from "~/some/path.js";
export { stuff as myStuff } from "~/some/path.mjs";
```

**Node.JS
[require.resolve](https://nodejs.org/api/modules.html#requireresolverequest-options)**

```ts
const path = require.resolve("~/some/path");
```

## CLI Usage

1. Install as a dev dependency using npm or yarn, along with
   [Typescript](https://www.npmjs.com/package/typescript) 3.x or later.

   ```sh
   yarn add -D resolve-tspaths typescript
   ```

   ```sh
   npm install --save-dev resolve-tspaths typescript
   ```

2. Add it as a part of your build script in `package.json` after `tsc`.

   ```json
   {
     "scripts": {
       "build": "tsc && resolve-tspaths"
     }
   }
   ```

## Programmatic Usage

1. Install as a dev dependency using npm or yarn, along with
   [Typescript](https://www.npmjs.com/package/typescript) 3.x or later.

   ```sh
   yarn add -D resolve-tspaths typescript
   ```

   ```sh
   npm install --save-dev resolve-tspaths typescript
   ```

2. Import the `resolveTsPaths` function and call it with the appropriate
   options.

   ```ts
   import { resolveTsPaths } from "resolve-tspaths";
   ```

## Options

_`resolve-tspaths` uses some reasonable defaults. For most cases, you probably
won't need to specify any options._

#### `--project <path>, -p <path>`

Specify the path to the tsconfig file that the program should use. Defaults to
"tsconfig.json" if not provided.

#### `--src <path>, -s <path>`

Specify the source directory. Defaults to `compilerOptions.rootDir` from your
tsconfig if not provided. If `rootDir` is not defined in your tsconfig, it will
default to "src".

#### `--out <path>, -o <path>`

Specify the output directory of the compiled code where `resolve-tspaths` should
perform its changes. Defaults to `compilerOptions.outDir` from your tsconfig if
not provided.

#### `--ext <extension...>`

Provide a space-delimited list of file extensions in the output directory that
the program should process. Defaults to the following extensions:

- `js`
- `mjs`
- `cjs`
- `d.ts`
- `d.mts`
- `d.cts`

#### `--verbose`

Use this flag to print verbose logs to the console.

_This option is only available when using the CLI._

#### `--noEmit`

Use this flag to not emit any changes to your files. Recommended to be used with
`--verbose` for debugging which files the program will change if you don't use
`--noEmit`.

_This option is only available when using the CLI._

## Comparison to existing packages

### [tsconfig-paths](https://github.com/dividab/tsconfig-paths)

`tsconfig-paths` is a runtime dependency. `resolve-tspaths` is used at **build
time**, which means your shipped code doesn't need to have this package
included, and can run natively using Node or in the browser.

### [tscpaths](https://github.com/joonhocho/tscpaths)

Performs the same function as **tscpaths** - but that project is no longer
maintained. A pain point with that package was also that it no control over the
logging which was extremely verbose. `resolve-tspaths` provides several more
options for better control, and it's also well tested.

## Inspiration

This project was heavily inspired by
[tscpaths by joonhocho](https://github.com/joonhocho/tscpaths), but it is sadly
no longer maintained. My first attempt at building this library was based on a
fork of `tscpaths`. Since the project has matured, it was moved out to its own
repository.

## Contributors

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/benyap"><img src="https://avatars.githubusercontent.com/u/19235373?v=4?s=80" width="80px;" alt="Ben Yap"/><br /><sub><b>Ben Yap</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/commits?author=benyap" title="Code">💻</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=benyap" title="Tests">⚠️</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=benyap" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Chocobozzz"><img src="https://avatars.githubusercontent.com/u/5180488?v=4?s=80" width="80px;" alt="Chocobozzz"/><br /><sub><b>Chocobozzz</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/commits?author=Chocobozzz" title="Code">💻</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=Chocobozzz" title="Tests">⚠️</a> <a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3AChocobozzz" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://qiaoruntao.com"><img src="https://avatars.githubusercontent.com/u/5846433?v=4?s=80" width="80px;" alt="qiaoruntao"/><br /><sub><b>qiaoruntao</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/commits?author=qiaoruntao" title="Code">💻</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=qiaoruntao" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/4nickel"><img src="https://avatars.githubusercontent.com/u/57354511?v=4?s=80" width="80px;" alt="Felix Viernickel"/><br /><sub><b>Felix Viernickel</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3A4nickel" title="Bug reports">🐛</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=4nickel" title="Tests">⚠️</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=4nickel" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://kaic.dev"><img src="https://avatars.githubusercontent.com/u/9873486?v=4?s=80" width="80px;" alt="Kaic Bastidas"/><br /><sub><b>Kaic Bastidas</b></sub></a><br /><a href="#ideas-tcK1" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Atlinx"><img src="https://avatars.githubusercontent.com/u/25368491?v=4?s=80" width="80px;" alt="Atlinx"/><br /><sub><b>Atlinx</b></sub></a><br /><a href="#ideas-Atlinx" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://wintercounter.me"><img src="https://avatars.githubusercontent.com/u/963776?v=4?s=80" width="80px;" alt="Victor Vincent"/><br /><sub><b>Victor Vincent</b></sub></a><br /><a href="#ideas-wintercounter" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3Awintercounter" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/forest-beaver-110965159/"><img src="https://avatars.githubusercontent.com/u/33011274?v=4?s=80" width="80px;" alt="Forest"/><br /><sub><b>Forest</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3AForestBeaver" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://einhorn.jetzt"><img src="https://avatars.githubusercontent.com/u/1557253?v=4?s=80" width="80px;" alt="Zebreus"/><br /><sub><b>Zebreus</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3AZebreus" title="Bug reports">🐛</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=Zebreus" title="Tests">⚠️</a> <a href="https://github.com/benyap/resolve-tspaths/commits?author=Zebreus" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RedMser"><img src="https://avatars.githubusercontent.com/u/5117197?v=4?s=80" width="80px;" alt="RedMser"/><br /><sub><b>RedMser</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/commits?author=RedMser" title="Code">💻</a> <a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3ARedMser" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jokero"><img src="https://avatars.githubusercontent.com/u/434135?v=4?s=80" width="80px;" alt="Dmitry Kirilyuk"/><br /><sub><b>Dmitry Kirilyuk</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/issues?q=author%3AJokero" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jneuendorf-i4h"><img src="https://avatars.githubusercontent.com/u/121858197?v=4?s=80" width="80px;" alt="jneuendorf-i4h"/><br /><sub><b>jneuendorf-i4h</b></sub></a><br /><a href="https://github.com/benyap/resolve-tspaths/commits?author=jneuendorf-i4h" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome! Please follow the
[contributing guidelines](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).
