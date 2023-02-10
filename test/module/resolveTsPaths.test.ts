import { rmSync, mkdirSync, copyFileSync, readFileSync } from "fs";
import { describe, expect, beforeEach, it } from "vitest";

import { resolveTsPaths } from "~/index";

describe(resolveTsPaths.name, () => {
  const files = [
    "root.d.ts",
    "root.js",
    "folder1/inside1.d.ts",
    "folder1/inside1.js",
    "folder1/folder2/inside2.d.ts",
    "folder1/folder2/inside2.js",
  ];

  beforeEach(() => {
    rmSync("test/fixtures/module/dist", { recursive: true, force: true });
    mkdirSync("test/fixtures/module/dist/folder1/folder2", { recursive: true });
    files.forEach((path) =>
      copyFileSync(
        `test/fixtures/module/src/${path}`,
        `test/fixtures/module/dist/${path}`
      )
    );
  });

  it("runs as a module", () => {
    resolveTsPaths({
      src: "test/fixtures/module/src",
      project: "test/fixtures/module/tsconfig.test.json",
    });
    files.forEach((file) =>
      expect(
        readFileSync(`test/fixtures/module/dist/${file}`).toString()
      ).toMatchSnapshot()
    );
  });
});
