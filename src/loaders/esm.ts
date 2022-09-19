import { loadTSConfig } from "~/steps/loadTSConfig.js";
import { computeAliases } from "~/steps/computeAliases.js";
import { resolvePaths } from "~/steps/resolvePaths.js";
import { aliasToRelativePath } from "~/steps/generateChanges.js";
import * as path from "path";

const projectPath = process.env.TS_NODE_PROJECT || "tsconfig.json";

const tsConfig = loadTSConfig(projectPath);

const programPaths = resolvePaths(
  {
    project: projectPath,
  },
  tsConfig
);

programPaths.outPath = programPaths.srcPath;

const aliases = computeAliases(
  programPaths.basePath,
  tsConfig?.options?.paths ?? {}
);

type ResolveResult = {
  /** A hint to the load hook (it might be ignored) 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm' */
  format: string | null | undefined;
  /** A signal that this hook intends to terminate the chain of resolve hooks. Default: false */
  shortCircuit?: boolean;
  /** The absolute URL to which this input resolves */
  url: string;
};

const includedFiles = tsConfig.fileNames.map((fileName) =>
  path.resolve(programPaths.basePath, fileName)
);

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (
    specifier: string,
    context: { parentURL?: string }
  ) => ResolveResult
): Promise<ResolveResult> => {
  const parent = context.parentURL;

  if (!parent) {
    // This path ensures, that you can use ts path aliases when starting the program
    // like `node '~/index.js'` for src/index.ts
    const realSpecifier = path.relative(
      process.cwd(),
      specifier.replace(/^[^:/.]+\:\/\//, "")
    );

    const newSpecifier =
      aliasToRelativePath(
        realSpecifier,
        path.resolve(process.cwd(), "index.ts"),
        aliases,
        programPaths,
        true
      )?.replacement || specifier;

    try {
      return await nextResolve(newSpecifier, context);
    } catch (e) {
      return await nextResolve(specifier, context);
    }
  }

  const parentWithoutProtocol = parent.replace(/^[^:/.]+\:\/\//, "");
  const fileIsIncluded = includedFiles.includes(parentWithoutProtocol);

  const newSpecifier = fileIsIncluded
    ? aliasToRelativePath(
        specifier,
        parentWithoutProtocol,
        aliases,
        programPaths,
        true
      )?.replacement || specifier
    : specifier;
  // console.log("Processing specifier: ", specifier, " => ", newSpecifier);

  return await nextResolve(newSpecifier, context);
};
