import { loadTSConfig } from "~/steps/loadTSConfig";

describe("steps/loadTSConfig", () => {
  it("loads tsconfig (json) correctly", () => {
    expect(loadTSConfig("test/fixtures/tsconfig/sample-tsconfig.json"))
      .toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "lib": Array [
            "ES6",
          ],
          "module": "CommonJS",
          "moduleResolution": "Node",
          "paths": Object {
            "~/*": Array [
              "./src/*",
            ],
          },
          "resolveJsonModule": true,
          "skipLibCheck": true,
          "strict": true,
          "target": "ES6",
        },
        "include": Array [
          "src/**/*",
          "test/**/*",
        ],
      }
    `);
  });

  it("loads tsconfig (jsonc) with extends correctly", () => {
    expect(loadTSConfig("test/fixtures/tsconfig/sample-tsconfig-extends.jsonc"))
      .toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": ".",
          "lib": Array [
            "ES6",
          ],
          "module": "CommonJS",
          "moduleResolution": "Node",
          "outDir": "dist",
          "paths": Object {
            "~/*": Array [
              "nested/src/*",
            ],
          },
          "resolveJsonModule": true,
          "skipLibCheck": true,
          "strict": true,
          "target": "ES6",
        },
        "include": Array [
          "src/**/*",
          "test/**/*",
        ],
      }
    `);
  });
});
