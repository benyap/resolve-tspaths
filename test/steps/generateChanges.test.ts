import {
  IMPORT_REGEX,
  aliasToRelativePath,
  replaceAliasPathsInFile,
  generateChanges,
} from "~/steps/generateChanges";
import type { Alias, ProgramPaths } from "~/types";

describe("steps/generateChanges", () => {
  describe("IMPORT_REGEX", () => {
    let regex: RegExp;

    beforeEach(() => {
      regex = new RegExp(IMPORT_REGEX);
    });

    it("matches import * statements", () => {
      const result = regex.exec(`import * as package from 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import * as package from 'package'",
          "package",
        ]
      `);
    });

    it("matches import {} statements", () => {
      const result = regex.exec(`import { package } from '~/package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import { package } from '~/package'",
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
          "../package",
        ]
      `);
    });

    it("matches import statements", () => {
      const result = regex.exec(`import 'package';`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "import 'package'",
          "package",
        ]
      `);
    });

    it("matches require statements", () => {
      const result = regex.exec(`require('package');`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require('package')",
          "package",
        ]
      `);
    });

    it("matches const require statements", () => {
      const result = regex.exec(`const package = require('../package');`);
      expect(result).toMatchInlineSnapshot(`
        Array [
          "require('../package')",
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
          "~/package/package",
        ]
      `);
    });
  });

  describe(aliasToRelativePath.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
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
        "test/fixtures/change/out/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/sample.js",
          "original": "path",
        }
      `);
    });

    it("returns the original path for an alias path that does not exist", () => {
      const result = aliasToRelativePath(
        "~/non-existent",
        "test/fixtures/change/out/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/sample.js",
          "original": "~/non-existent",
        }
      `);
    });

    it("returns the correct relative path for an aliased path at the root", () => {
      const result = aliasToRelativePath(
        "~/root",
        "test/fixtures/change/out/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/sample.js",
          "original": "~/root",
          "replacement": "./root",
        }
      `);
    });

    it("returns the correct relative path for an aliased path at the root using a secondary alias", () => {
      const result = aliasToRelativePath(
        "~/alternate",
        "test/fixtures/change/out/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/sample.js",
          "original": "~/alternate",
          "replacement": "./alternateSrc/alternate",
        }
      `);
    });

    it("returns the correct relative path for a nested aliased path", () => {
      const result = aliasToRelativePath(
        "~/nested/nested-path",
        "test/fixtures/change/out/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/sample.js",
          "original": "~/nested/nested-path",
          "replacement": "./nested/nested-path",
        }
      `);
    });

    it("returns the correct relative path for an aliased path from a nested directory", () => {
      const result = aliasToRelativePath(
        "~/root",
        "test/fixtures/change/out/nested/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/sample.js",
          "original": "~/root",
          "replacement": "../root",
        }
      `);
    });

    it("returns the correct relative path for an aliased path from a nested directory using a secondary alias", () => {
      const result = aliasToRelativePath(
        "~/alternate",
        "test/fixtures/change/out/nested/sample.js",
        aliases,
        programPaths
      );

      expect(result).toMatchInlineSnapshot(`
        Object {
          "file": "test/fixtures/change/out/nested/sample.js",
          "original": "~/alternate",
          "replacement": "../alternateSrc/alternate",
        }
      `);
    });
  });

  describe(replaceAliasPathsInFile.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
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

      it("generates replacements for a file at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/sample.js`,
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
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"./root\\");
          const {} = require(\\"package\\");
          const {} = require(\\"~/nested/non-existent\\");
          const {} = require(\\"./nested/nested-path\\");
          const {} = require(\\"@/non-existent\\");

          // Module code
          function sample() {}
          module.exports = { sample };
          "
        `);
      });

      it("generates replacements for a file at a nested directory correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/nested/sample.js`,
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
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "const {} = require(\\"../root\\");
          const {} = require(\\"package\\");
          const {} = require(\\"~/nested/non-existent\\");
          const {} = require(\\"./nested-path\\");
          const {} = require(\\"@/non-existent\\");

          // Module code
          function sample() {}
          module.exports = { sample };
          "
        `);
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

      it("generates replacements for a file at the root level correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/sample.d.ts`,
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
              "modified": "./nested/nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "import {} from \\"./root\\";
          import {} from \\"package\\";
          import {} from \\"~/nested/non-existent\\";
          import {} from \\"./nested/nested-path\\";
          import {} from \\"@/non-existent\\";
          export declare function sample(): void;
          "
        `);
      });

      it("generates replacements for a file at a nested directory correctly", () => {
        const results = replaceAliasPathsInFile(
          `${root}/out/nested/sample.d.ts`,
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
              "modified": "./nested-path",
              "original": "~/nested/nested-path",
            },
          ]
        `);
        expect(results.text).toMatchInlineSnapshot(`
          "import {} from \\"../root\\";
          import {} from \\"package\\";
          import {} from \\"~/nested/non-existent\\";
          import {} from \\"./nested-path\\";
          import {} from \\"@/location\\";
          import {} from \\"@/non-existent\\";
          export declare function sample(): void;
          "
        `);
      });
    });
  });

  describe(generateChanges.name, () => {
    const cwd = process.cwd();
    const root = `${cwd}/test/fixtures/change`;
    const aliases: Alias[] = [
      {
        prefix: "~/",
        aliasPaths: [`${root}/src`, `${root}/src/alternateSrc`],
      },
    ];
    const programPaths: Pick<ProgramPaths, "srcPath" | "outPath"> = {
      srcPath: `${root}/src`,
      outPath: `${root}/out`,
    };

    it("generates changes for cjs files correctly", () => {
      const results = generateChanges(
        [
          `${root}/out/alternateSrc/alternate/index.js`,
          `${root}/out/nested/sample.js`,
          `${root}/out/sample.js`,
          `${root}/out/no-change.js`,
        ],
        aliases,
        programPaths
      );
      expect(results[0].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "../../root",
            "original": "~/root",
          },
          Object {
            "modified": "../../nested/nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
      expect(results[1].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "../root",
            "original": "~/root",
          },
          Object {
            "modified": "./nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
      expect(results[2].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "./root",
            "original": "~/root",
          },
          Object {
            "modified": "./nested/nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
    });

    it("generates changes for esm files correctly", () => {
      const results = generateChanges(
        [
          `${root}/out/alternateSrc/alternate/index.d.ts`,
          `${root}/out/nested/sample.d.ts`,
          `${root}/out/sample.d.ts`,
          `${root}/out/no-change.d.ts`,
        ],
        aliases,
        programPaths
      );
      expect(results[0].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "../../root",
            "original": "~/root",
          },
          Object {
            "modified": "../../nested/nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
      expect(results[1].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "../root",
            "original": "~/root",
          },
          Object {
            "modified": "./nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
      expect(results[2].changes).toMatchInlineSnapshot(`
        Array [
          Object {
            "modified": "./root",
            "original": "~/root",
          },
          Object {
            "modified": "./nested/nested-path",
            "original": "~/nested/nested-path",
          },
        ]
      `);
    });
  });
});
