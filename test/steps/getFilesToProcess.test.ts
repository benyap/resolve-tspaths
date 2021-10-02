import { getFilesToProcess } from "~/steps/getFilesToProcess";

describe("steps/getFilesToProcess", () => {
  it("gets files with one extension correctly", () => {
    const files = getFilesToProcess("test/fixtures/files", "js");
    expect(files).toHaveLength(1);
  });

  it("gets files with multiple extensions correctly", () => {
    const files = getFilesToProcess("test/fixtures/files", "js,ts");
    expect(files).toHaveLength(2);
  });

  it("gets nested files correctly", () => {
    const files = getFilesToProcess("test/fixtures/files", "tsx");
    expect(files).toHaveLength(2);
  });
});
