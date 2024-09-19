import { describe, expect, it } from "vitest";
import { join } from "path";

import { getFilesToProcess } from "~/steps/getFilesToProcess";

describe("steps/getFilesToProcess", () => {
  it("gets files with one extension correctly", () => {
    // absolute path is passed to getFilesToProcess function, so we have to convert it
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["js"]);
    expect(files.map((path) => path.replace(cwd, ""))).toMatchInlineSnapshot(`
      [
        "/test/fixtures/files/file.js",
      ]
    `);
  });

  it("gets files with multiple extensions correctly", () => {
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["js", "ts"]);
    expect(files.map((path) => path.replace(cwd, ""))).toMatchInlineSnapshot(`
      [
        "/test/fixtures/files/file.js",
        "/test/fixtures/files/file.ts",
      ]
    `);
  });

  it("gets files with paths that have special characters correctly", () => {
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/(special files*)");
    const files = getFilesToProcess(testDirectory, ["js", "ts"]);
    expect(files.map((path) => path.replace(cwd, ""))).toMatchInlineSnapshot(`
      [
        "/test/fixtures/(special files*)/file \\slash.js",
        "/test/fixtures/(special files*)/file with (parentheses).js",
        "/test/fixtures/(special files*)/file with space.js",
      ]
    `);
  });

  it("gets nested files correctly", () => {
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["tsx"]);
    expect(files.map((path) => path.replace(cwd, ""))).toMatchInlineSnapshot(`
      [
        "/test/fixtures/files/file.tsx",
        "/test/fixtures/files/nested/file.tsx",
      ]
    `);
  });
});
