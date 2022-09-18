import {
  IMPORT_EXPORT_REGEX,
  aliasToRelativePath,
  replaceAliasPathsInFile,
  generateChanges,
} from "~/steps/generateChanges";
import type { Alias, ProgramPaths } from "~/types";

describe("steps/generateChanges", () => {
  describe("IMPORT_EXPORT_REGEX", () => {
    let regex: RegExp;

    beforeEach(() => {
      regex = new RegExp(IMPORT_EXPORT_REGEX);
    });

    it("matches import * statements", () => {
      const result = regex.exec(`import * as package from 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import * as package from 'package'",
          "import * as package from ",
          "package",
        ]
      `);
    });

    it("matches import {} statements", () => {
      const result = regex.exec(`import { package } from '~/package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import { package } from '~/package'",
          "import { package } from ",
          "~/package",
        ]
      `);
    });

    it("matches import { as } statements", () => {
      const result = regex.exec(
        `import { package as myPackage } from '../package';`
      );
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import { package as myPackage } from '../package'",
          "import { package as myPackage } from ",
          "../package",
        ]
      `);
    });

    it("matches import statements", () => {
      const result = regex.exec(`import 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import 'package'",
          "import ",
          "package",
        ]
      `);
    });

    it("matches export * statements", () => {
      const result = regex.exec(`export * from 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "export * from 'package'",
          "export * from ",
          "package",
        ]
      `);
    });

    it("matches export * as statements", () => {
      const result = regex.exec(`export * as package from 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "export * as package from 'package'",
          "export * as package from ",
          "package",
        ]
      `);
    });

    it("matches export {} statements", () => {
      const result = regex.exec(`export { package } from '~/package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "export { package } from '~/package'",
          "export { package } from ",
          "~/package",
        ]
      `);
    });

    it("matches export { as } statements", () => {
      const result = regex.exec(
        `export { package as myPackage } from '../package';`
      );
      expect(result).toMatchInlineSnapshot(`
        Array [
          "export { package as myPackage } from '../package'",
          "export { package as myPackage } from ",
          "../package",
        ]
      `);
    });

    it("matches export statements", () => {
      const result = regex.exec(`export 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "export 'package'",
          "export ",
          "package",
        ]
      `);
    });

    it("matches require statements", () => {
      const result = regex.exec(`require('package');`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require('package')",
          "require(",
          "package",
        ]
      `);
    });

    it("matches const require statements", () => {
      const result = regex.exec(`const package = require('../package');`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require('../package')",
          "require(",
          "../package",
        ]
      `);
    });

    it("matches const require.resolve statements", () => {
      const result = regex.exec(
        `const package = require.resolve('../package');`
      );
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require.resolve('../package')",
          "require.resolve(",
          "../package",
        ]
      `);
    });

    it("matches const {} require statements", () => {
      const result = regex.exec(
        `const { package } = require('~/package/package');`
      );
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require('~/package/package')",
          "require(",
          "~/package/package",
        ]
      `);
    });

    it("matches dynamic import statements", () => {
      const result = regex.exec(`import('package');`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import('package')",
          "import(",
          "package",
        ]
      `);
    });
  });

  describe(aliasToRelativePath.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
        alias: "~/*",
        prefix: "~/",
        aliasPaths: [`${root}/src`, `${root}/src/alternateSrc`],
      },
    ];
    const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
      srcPath: `${root}/src`,
      outPath: `${root}/out`,
    };

    it("returns the original path for a non-aliased path", () => {
      const result = aliasToRelativePath(
        "path",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "path",
        }
      `);
    });

    it("returns the original path for an alias path that does not exist", () => {
      const result = aliasToRelativePath(
        "~/non-existent",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/non-existent",
        }
      `);
    });

    it("returns the correct relative path for an aliased path at the root", () => {
      const result = aliasToRelativePath(
        "~/root",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/root",
          "replacement": "./root",
        }
      `);
    });

    it("returns the correct file extension for esm modules", () => {
      const result = aliasToRelativePath(
        "~/root",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths,
        true
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/root",
          "replacement": "./root.js",
        }
      `);
    });

    it("returns the correct file extension for already relative esm modules", () => {
      const result = aliasToRelativePath(
        "./root",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths,
        true
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "./root",
          "replacement": "./root.js",
        }
      `);
    });

    it("returns the correct path for esm imports with extension", () => {
      const result = aliasToRelativePath(
        "~/root.js",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths,
        true
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/root.js",
          "replacement": "./root.js",
        }
      `);
    });

    it("returns the correct relative path for an aliased path at the root using a secondary alias", () => {
      const result = aliasToRelativePath(
        "~/alternate",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/alternate",
          "replacement": "./alternateSrc/alternate",
        }
      `);
    });

    it("returns the correct relative path for a nested aliased path", () => {
      const result = aliasToRelativePath(
        "~/nested/nested-path",
        "test/fixtures/change/out/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/imports.js",
          "original": "~/nested/nested-path",
          "replacement": "./nested/nested-path",
        }
      `);
    });

    it("returns the correct relative path for an aliased path from a nested directory", () => {
      const result = aliasToRelativePath(
        "~/root",
        "test/fixtures/change/out/nested/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/imports.js",
          "original": "~/root",
          "replacement": "../root",
        }
      `);
    });

    it("does not replace paths that are already relative", () => {
      const result = aliasToRelativePath(
        "../..",
        "test/fixtures/change/out/nested/imports.js",
        [{ alias: "*", prefix: "", aliasPaths: [`${root}/src`] }],
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/imports.js",
          "original": "../..",
        }
      `);
    });

    it("returns the correct relative path for an aliased path from a nested directory using a secondary alias", () => {
      const result = aliasToRelativePath(
        "~/alternate",
        "test/fixtures/change/out/nested/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/imports.js",
          "original": "~/alternate",
          "replacement": "../alternateSrc/alternate",
        }
        `);
    });

    it("does replace paths for json imports", () => {
      const result = aliasToRelativePath(
        "~/data.json",
        "test/fixtures/change/out/nested/imports.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/imports.js",
          "original": "~/data.json",
          "replacement": "../data.json",
        }
      `);
    });

    it("does replace paths for imports with the same name as the directory", () => {
      const result = aliasToRelativePath(
        "~/directory",
        "test/fixtures/change/out/directory/file.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/directory/file.js",
          "original": "~/directory",
          "replacement": "../directory",
        }
      `);
    });

    it("does replace paths for imports with the same name as the directory with esm", () => {
      const result = aliasToRelativePath(
        "~/directory",
        "test/fixtures/change/out/directory/file.js",
        aliases,
        programPaths,
        true
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/directory/file.js",
          "original": "~/directory",
          "replacement": "../directory.js",
        }
      `);
    });

    it("does not mangle imports ending with ts", () => {
      const result = aliasToRelativePath(
        "./constants",
        "test/fixtures/change/out/directory/file.js",
        aliases,
        programPaths,
        true
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/directory/file.js",
          "original": "./constants",
        }
      `);
    });
  });

  describe(replaceAliasPathsInFile.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
        alias: "~/*",
        prefix: "~/",
        aliasPaths: [`${root}/src`, `${root}/src/alternateSrc`],
      },
    ];
    const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
      srcPath: `${root}/src`,
      outPath: `${root}/out`,
    };

    describe("cjs", () => {
      it("returns no changes for a file that does not require changes", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/no-change.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(false);
        expect(results.changes).toHaveLength(0);
      });

      it("generates replacements for a file with imports at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/imports.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "./data.json",
              "original": "~/data.json",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"package\\");
          const {} = require(\\"./root\\");
          const {} = require(\\"./nested\\");
          const {} = require(\\"./nested/nested-path\\");
          const {} = require(\\"~/nested/non-existent\\");
          const {} = require(\\"@/non-existent\\");
          const {} = require(\\"./data.json\\");
          const {} = require(\\"~/non-existent.json\\");

          // Module code
          function sample() {}
          module.exports = { sample };
          "
        `);
      });

      it("generates replacements for a file with exports at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/exports.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"package\\");
          const {} = require(\\"./root\\");
          const {} = require(\\"./nested\\");
          const {} = require(\\"./nested/nested-path\\");
          const {} = require(\\"~/nested/non-existent\\");
          const {} = require(\\"@/non-existent\\");

          module.exports = {
            /* omitted */
          };
          "
        `);
      });

      it("generates replacements for a file at a nested directory correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/nested/index.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../root",
              "original": "~/root",
            },
            Object {
              "modified": "./",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../data.json",
              "original": "~/data.json",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"package\\");
          const {} = require(\\"../root\\");
          const {} = require(\\"./\\");
          const {} = require(\\"./nested-path\\");
          const {} = require(\\"~/nested/non-existent\\");
          const {} = require(\\"@/non-existent\\");
          const {} = require(\\"../data.json\\");
          const {} = require(\\"~/non-existent.json\\");

          // Module code
          function sample() {}
          module.exports = { sample };
          "
        `);
      });

      it("generates replacements for a file that has an import matching a directory name correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/directory/file.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../directory",
              "original": "~/directory",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"../directory\\");
          "
        `);
      });

      it("replaces exports with the same name as the path correctly", () => {
        const root = `${cwd}/test/fixtures/changeSameName`;
        const aliases: Alias[] = [
          {
            alias: "*",
            prefix: "",
            aliasPaths: [`${root}/src`],
          },
        ];
        const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
          srcPath: `${root}/src`,
          outPath: `${root}/out`,
        };
        const results = replaceAliasPathsInFile(
          `${root}/out/import.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toHaveLength(1);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./sameName",
              "original": "sameName",
            },
          ]
        `);
        expect(results.text).not.toContain(
          'const { ./sameName } = require("sameName");'
        );
        expect(results.text).toContain(
          'const { sameName } = require("./sameName");'
        );
      });

      it("works with es Modules", () => {
        const root = `${cwd}/test/fixtures/esModuleExtensions`;
        const aliases: Alias[] = [
          {
            alias: "*",
            prefix: "",
            aliasPaths: [`${root}/src`],
          },
        ];
        const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
          srcPath: `${root}/src`,
          outPath: `${root}/out`,
        };
        const results = replaceAliasPathsInFile(
          `${root}/out/index.js`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.text).toContain(`import { alpha } from "./alpha.js"`);
        expect(results.text).toContain(`import { beta } from "./beta.js"`);
        expect(results.text).toContain(`import { gamma } from "./gamma.js"`);
        expect(results.text).toContain(`import { delta } from "./delta.mjs"`);
      });

      it("works with d.ts files", () => {
        const root = `${cwd}/test/fixtures/esModuleExtensions`;
        const aliases: Alias[] = [
          {
            alias: "*",
            prefix: "",
            aliasPaths: [`${root}/src`],
          },
        ];
        const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
          srcPath: `${root}/src`,
          outPath: `${root}/out`,
        };
        const results = replaceAliasPathsInFile(
          `${root}/out/index.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.text).toContain(`import { alpha } from "./alpha"`);
        expect(results.text).toContain(`import { beta } from "./beta.js"`);
        expect(results.text).toContain(`import { gamma } from "./gamma"`);
        expect(results.text).toContain(`import { delta } from "./delta.mjs"`);
      });
    });

    describe("esm", () => {
      it("returns no changes for a file that does not require changes", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/no-change.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(false);
        expect(results.changes).toHaveLength(0);
      });

      it("generates replacements for a file with imports at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/imports.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "./data.json",
              "original": "~/data.json",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "import {} from \\"package\\";
          import {} from \\"./root\\";
          import {} from \\"./nested\\";
          import {} from \\"./nested/nested-path\\";
          import {} from \\"~/nested/non-existent\\";
          import {} from \\"@/non-existent\\";
          import {} from \\"./data.json\\";
          import {} from \\"~/non-existent.json\\";
          export declare function sample(): void;
          "
        `);
      });

      it("generates replacements for a file with exports at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/exports.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "export * from \\"package\\";
          export * from \\"./root\\";
          export * from \\"./nested\\";
          export * from \\"./nested/nested-path\\";
          export * from \\"~/nested/non-existent\\";
          export * from \\"@/non-existent\\";
          "
        `);
      });

      it("generates replacements for a file at a nested directory correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/nested/index.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../root",
              "original": "~/root",
            },
            Object {
              "modified": "./",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../data.json",
              "original": "~/data.json",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "import {} from \\"package\\";
          import {} from \\"../root\\";
          import {} from \\"./\\";
          import {} from \\"./nested-path\\";
          import {} from \\"~/nested/non-existent\\";
          import {} from \\"@/non-existent\\";
          import {} from \\"../data.json\\";
          import {} from \\"~/non-existent.json\\";
          export declare function sample(): void;
          "
        `);
      });

      it("generates replacements for a file that has an import matching a directory name correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/directory/file.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../directory",
              "original": "~/directory",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "import {} from \\"../directory\\";
          "
        `);
      });

      it("replaces exports with the same name as the path correctly", () => {
        const root = `${cwd}/test/fixtures/changeSameName`;
        const aliases: Alias[] = [
          {
            alias: "*",
            prefix: "",
            aliasPaths: [`${root}/src`],
          },
        ];
        const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
          srcPath: `${root}/src`,
          outPath: `${root}/out`,
        };
        const results = replaceAliasPathsInFile(
          `${root}/out/import.d.ts`,
          aliases,
          programPaths
        );
        expect(results.changed).toBe(true);
        expect(results.changes).toHaveLength(1);
        expect(results.changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./sameName",
              "original": "sameName",
            },
          ]
        `);
        expect(results.text).not.toContain(
          'export { ./sameName } from "sameName";'
        );
        expect(results.text).toContain(
          'export { sameName } from "./sameName";'
        );
      });
    });
  });

  describe(generateChanges.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
        alias: "~/*",
        prefix: "~/",
        aliasPaths: [`${root}/src`, `${root}/src/alternateSrc`],
      },
    ];
    const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
      srcPath: `${root}/src`,
      outPath: `${root}/out`,
    };

    describe("cjs", () => {
      it("does not generate changes for non-relative packages", () => {
        const results = generateChanges(
          [`${root}/out/no-change.js`, `${root}/out/directory.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(0);
      });

      it("generates changes for imports correctly", () => {
        const results = generateChanges(
          [`${root}/out/imports.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "./data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });

      it("generates changes for exports correctly", () => {
        const results = generateChanges(
          [`${root}/out/exports.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
      });

      it("generates changes for nested paths correctly", () => {
        const results = generateChanges(
          [`${root}/out/nested/index.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../root",
              "original": "~/root",
            },
            Object {
              "modified": "./",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });

      it("generates changes for paths with the same name as a directory", () => {
        const results = generateChanges(
          [`${root}/out/directory/file.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../directory",
              "original": "~/directory",
            },
          ]
        `);
      });

      it("generates changes for paths with multiple lookup locations correctly", () => {
        const results = generateChanges(
          [`${root}/out/alternateSrc/alternate/index.js`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../../root",
              "original": "~/root",
            },
            Object {
              "modified": "../../nested",
              "original": "~/nested",
            },
            Object {
              "modified": "../../nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../../data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });
    });

    describe("esm", () => {
      it("does not generate changes for non-relative packages", () => {
        const results = generateChanges(
          [`${root}/out/no-change.d.ts`, `${root}/out/directory.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(0);
      });

      it("generates changes for imports correctly", () => {
        const results = generateChanges(
          [`${root}/out/imports.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "./data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });

      it("generates changes for exports correctly", () => {
        const results = generateChanges(
          [`${root}/out/exports.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "./root",
              "original": "~/root",
            },
            Object {
              "modified": "./nested",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
      });

      it("generates changes for nested paths correctly", () => {
        const results = generateChanges(
          [`${root}/out/nested/index.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../root",
              "original": "~/root",
            },
            Object {
              "modified": "./",
              "original": "~/nested",
            },
            Object {
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });

      it("generates changes for paths with the same name as a directory", () => {
        const results = generateChanges(
          [`${root}/out/directory/file.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../directory",
              "original": "~/directory",
            },
          ]
        `);
      });

      it("generates changes for paths with multiple lookup locations correctly", () => {
        const results = generateChanges(
          [`${root}/out/alternateSrc/alternate/index.d.ts`],
          aliases,
          programPaths
        );
        expect(results).toHaveLength(1);
        expect(results[0].changes).toMatchInlineSnapshot(`
          Array [
            Object {
              "modified": "../../root",
              "original": "~/root",
            },
            Object {
              "modified": "../../nested",
              "original": "~/nested",
            },
            Object {
              "modified": "../../nested/nested-path",
              "original": "~/nested/nested-path",
            },
            Object {
              "modified": "../../data.json",
              "original": "~/data.json",
            },
          ]
        `);
      });
    });
  });
});
