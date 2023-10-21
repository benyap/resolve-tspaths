import { describe, expect, it } from "vitest";
import { resolve } from "path";

import { loadTSConfig } from "~/steps/loadTSConfig";

/**
 * HACK: transforms any aboslute paths to relative paths to make testing portable
 */
function toRelativePath<T>(path: T): T {
  if (typeof path === "string")
    return path.replace(resolve("."), "(relative)") as T;
  return path;
}

describe("steps/loadTSConfig", () => {
  it("loads tsconfig (json) correctly", () => {
    const config = loadTSConfig("test/fixtures/tsconfig/tsconfig.test.json");
    config.options.pathsBasePath = toRelativePath(config.options.pathsBasePath);
    expect(config.options).toMatchInlineSnapshot(`
      {
        "configFilePath": undefined,
        "lib": [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "paths": {
          "~/*": [
            "./app/*",
          ],
        },
        "pathsBasePath": "(relative)/test/fixtures/tsconfig",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": true,
        "target": 2,
      }
    `);
  });

  it("loads tsconfig (jsonc) with extends correctly", () => {
    const config = loadTSConfig(
      "test/fixtures/tsconfig/tsconfig.extends.jsonc",
    );
    config.options.baseUrl = toRelativePath(config.options.baseUrl);
    config.options.outDir = toRelativePath(config.options.outDir);
    config.options.pathsBasePath = toRelativePath(config.options.pathsBasePath);
    expect(config.options).toMatchInlineSnapshot(`
      {
        "baseUrl": "(relative)/test/fixtures/tsconfig/nested",
        "configFilePath": undefined,
        "lib": [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "outDir": "(relative)/test/fixtures/tsconfig/dist",
        "paths": {
          "~/*": [
            "./src/*",
          ],
        },
        "pathsBasePath": "(relative)/test/fixtures/tsconfig/nested",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": true,
        "target": 2,
      }
    `);
  });

  it("loads tsconfig (jsonc) with extends correctly (no baseUrl)", () => {
    const config = loadTSConfig(
      "test/fixtures/tsconfig/tsconfig.extends.no-base-url.jsonc",
    );
    config.options.outDir = toRelativePath(config.options.outDir);
    config.options.pathsBasePath = toRelativePath(config.options.pathsBasePath);
    expect(config.options).toMatchInlineSnapshot(`
      {
        "configFilePath": undefined,
        "lib": [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "outDir": "(relative)/test/fixtures/tsconfig/dist",
        "paths": {
          "~/*": [
            "./src/*",
          ],
        },
        "pathsBasePath": "(relative)/test/fixtures/tsconfig/nested",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": true,
        "target": 2,
      }
    `);
  });

  // Was going to use this test to make sure that syntax errors were reported sensibly.
  // Turns out the Typescript config loader does some crazy stuff to recover from syntax errors!
  it("loads tsconfig with syntax errors (crazy stuff!)", () => {
    const config = loadTSConfig(
      "test/fixtures/tsconfig/tsconfig.syntax-error.json",
    );
    config.options.pathsBasePath = toRelativePath(config.options.pathsBasePath);
    expect(config.options).toMatchInlineSnapshot(`
      {
        "configFilePath": undefined,
        "lib": [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "paths": {
          "@/*": [
            "./src/*",
          ],
        },
        "pathsBasePath": "(relative)/test/fixtures/tsconfig",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": undefined,
        "target": 2,
      }
    `);
  });
});
