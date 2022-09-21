import { join } from "path";
import { generateImportList } from "~/loaders/jest";

it("generates a somewhat correct list", () => {
  const importList = generateImportList(
    [
      "src/alpha.ts",
      "src/beta.ts",
      "src/delta.mts",
      "src/exports.ts",
      "src/gamma.ts",
      "src/imports.ts",
    ],
    join(process.cwd(), "test/fixtures/esModuleExtensions"),
    [
      {
        alias: "~/*",
        prefix: "~/",
        aliasPaths: [
          join(process.cwd(), "test/fixtures/esModuleExtensions/src"),
        ],
      },
      {
        alias: "*",
        prefix: "",
        aliasPaths: [
          join(process.cwd(), "test/fixtures/esModuleExtensions/src"),
        ],
      },
    ]
  );
  const matchesImport = (importPath: string) =>
    importList.find(([regex]) => regex.test(importPath))?.[1];

  expect(matchesImport("beta")).toBe("src/beta.ts");
  expect(matchesImport("beta.js")).toBe("src/beta.ts");
  expect(matchesImport("beta.ts")).toBe("src/beta.ts");
  expect(matchesImport("~/beta")).toBe("src/beta.ts");
  expect(matchesImport("~/beta.js")).toBe("src/beta.ts");
  expect(matchesImport("~/beta.ts")).toBe("src/beta.ts");
});
