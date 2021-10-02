import { loadJSON } from "~/utils/load";

describe("utils/loadJSON", () => {
  it("loads JSON file correctly", () => {
    const data = loadJSON("test/fixtures/tsconfig/sample-tsconfig.json", "");
    expect(data).toMatchInlineSnapshot(`
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

  it("loads JSON file with comments correctly", () => {
    const data = loadJSON("test/fixtures/tsconfig/sample-tsconfig.jsonc", "");
    expect(data).toMatchInlineSnapshot(`
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

  it("throws correct error when file is not found", () => {
    expect(() =>
      loadJSON("test/fixtures/tsconfig/non-existent.json", "")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Error processing test/fixtures/tsconfig/non-existent.json: Not found"`
    );
  });

  it("throws correct error when parsing fails", () => {
    expect(() =>
      loadJSON("test/fixtures/tsconfig/sample-tsconfig-syntax-error.json", "")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Error processing test/fixtures/tsconfig/sample-tsconfig-syntax-error.json: Failed to parse JSON. Unexpected string in JSON at position 253"`
    );
  });
});
