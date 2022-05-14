import { resolve } from "path";

import { computeAliases } from "~/steps/computeAliases";

describe("steps/computeAliases", () => {
  it("computes aliases correctly from the root path", () => {
    const aliases = computeAliases(resolve("."), {
      compilerOptions: {
        paths: {
          "*": ["./lib/*"],
          "~/*": ["./src/*", "./root/*"],
          "@app": ["./src/app/*"],
        },
      },
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
      compilerOptions: {
        paths: {
          "*": ["../lib/*"],
          "~/*": ["./*", "../root/*"],
          "@app": ["./app/*"],
        },
      },
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
});
