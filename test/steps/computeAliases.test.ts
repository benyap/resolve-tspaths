import { resolve } from "path";

import { computeAliases } from "~/steps/computeAliases";
import { InvalidAliasError } from "~/utils/errors";

describe("steps/computeAliases", () => {
  it("computes aliases correctly from the root path", () => {
    const aliases = computeAliases(resolve("."), {
      "*": ["./lib/*"],
      "~/*": ["./src/*", "./root/*"],
      "@app": ["./src/app/*"],
    });

    expect(aliases).toHaveLength(3);
    expect(aliases[0].prefix).toEqual("");
    expect(aliases[1].prefix).toEqual("~/");
    expect(aliases[2].prefix).toEqual("@app");

    const cwd = process.cwd();
    expect(aliases[0].aliasPaths).toEqual([`${cwd}/lib`]);
    expect(aliases[1].aliasPaths).toEqual([`${cwd}/src`, `${cwd}/root`]);
    expect(aliases[2].aliasPaths).toEqual([`${cwd}/src/app`]);
  });

  it("computes aliases correctly using a nested path", () => {
    const aliases = computeAliases(resolve("./src"), {
      "*": ["../lib/*"],
      "~/*": ["./*", "../root/*"],
      "@app": ["./app/*"],
    });

    expect(aliases).toHaveLength(3);
    expect(aliases[0].prefix).toEqual("");
    expect(aliases[1].prefix).toEqual("~/");
    expect(aliases[2].prefix).toEqual("@app");

    const cwd = process.cwd();
    expect(aliases[0].aliasPaths).toEqual([`${cwd}/lib`]);
    expect(aliases[1].aliasPaths).toEqual([`${cwd}/src`, `${cwd}/root`]);
    expect(aliases[2].aliasPaths).toEqual([`${cwd}/src/app`]);
  });

  it("throws an error if a path alias starting with ./ is detected", () => {
    const attempt = () =>
      computeAliases(resolve("."), {
        "./*": ["./lib/*"],
        "~/*": ["./src/*", "./root/*"],
        "@app": ["./src/app/*"],
      });
    expect(attempt).toThrowError(InvalidAliasError);
  });

  it("throws an error if a path alias starting with ../ is detected", () => {
    const attempt = () =>
      computeAliases(resolve("."), {
        "../*": ["./lib/*"],
        "~/*": ["./src/*", "./root/*"],
        "@app": ["./src/app/*"],
      });
    expect(attempt).toThrowError(InvalidAliasError);
  });
});
