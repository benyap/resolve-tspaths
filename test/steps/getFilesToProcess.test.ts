import { describe, expect, it } from "vitest";
import { join } from "path";

import { getFilesToProcess } from "~/steps/getFilesToProcess";

describe("steps/getFilesToProcess", () => {
  it("gets files with one extension correctly", () => {
    // absolute path is passed to getFilesToProcess function, so we have to convert it
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["js"]);
    expect(files).toHaveLength(1);
  });

  it("gets files with multiple extensions correctly", () => {
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["js", "ts"]);
    expect(files).toHaveLength(2);
  });

  it("gets nested files correctly", () => {
    const cwd = process.cwd();
    const testDirectory = join(cwd, "test/fixtures/files");
    const files = getFilesToProcess(testDirectory, ["tsx"]);
    expect(files).toHaveLength(2);
  });
});
