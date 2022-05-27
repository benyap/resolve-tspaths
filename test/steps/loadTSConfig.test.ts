import { loadTSConfig } from "~/steps/loadTSConfig";

describe("steps/loadTSConfig", () => {
  it("loads tsconfig (json) correctly", () => {
    const config = loadTSConfig("test/fixtures/tsconfig/tsconfig.test.json");
    expect(config.options).toMatchInlineSnapshot(`
      Object {
        "configFilePath": undefined,
        "lib": Array [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "paths": Object {
          "~/*": Array [
            "./app/*",
          ],
        },
        "pathsBasePath": ".",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": true,
        "target": 2,
      }
    `);
  });

  it("loads tsconfig (jsonc) with extends correctly", () => {
    const config = loadTSConfig(
      "test/fixtures/tsconfig/tsconfig.extends.jsonc"
    );
    expect(config.options).toMatchInlineSnapshot(`
      Object {
        "baseUrl": "test/fixtures/tsconfig/nested",
        "configFilePath": undefined,
        "lib": Array [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "outDir": "dist",
        "paths": Object {
          "~/*": Array [
            "./src/*",
          ],
        },
        "pathsBasePath": "test/fixtures/tsconfig/nested",
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
      "test/fixtures/tsconfig/tsconfig.syntax-error.json"
    );
    expect(config.options).toMatchInlineSnapshot(`
      Object {
        "configFilePath": undefined,
        "lib": Array [
          "lib.es2015.d.ts",
        ],
        "module": 1,
        "moduleResolution": 2,
        "paths": Object {
          "@/*": Array [
            "./src/*",
          ],
        },
        "pathsBasePath": ".",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "strict": undefined,
        "target": 2,
      }
    `);
  });
});
