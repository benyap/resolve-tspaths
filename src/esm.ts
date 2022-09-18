import { loadTSConfig } from "~/steps/loadTSConfig.js";
import { computeAliases } from "~/steps/computeAliases.js";
import { resolvePaths } from "~/steps/resolvePaths.js";
import { aliasToRelativePath } from "~/steps/generateChanges.js";

console.log("Loading loader");

const projectPath = process.env.TS_NODE_PROJECT || "tsconfig.json";
// process.argv[projectIndex + 1];

const tsConfig = loadTSConfig(projectPath);
// console.log(tsConfig)
//   const { rootDir, outDir, baseUrl, paths } = tsConfig.options ?? {};
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

console.log(programPaths);
console.log(aliases);

type ResolveResult = {
  /** A hint to the load hook (it might be ignored) 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm' */
  format: string | null | undefined;
  /** A signal that this hook intends to terminate the chain of resolve hooks. Default: false */
  shortCircuit?: boolean;
  /** The absolute URL to which this input resolves */
  url: string;
};

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (
    specifier: string,
    context: { parentURL?: string }
  ) => ResolveResult
): Promise<ResolveResult> => {
  console.log("#########################################");
  const parent = context.parentURL || programPaths.srcPath + "/index.js";
  console.log(specifier);
  console.log(parent);
  const newSpecifier = parent
    ? aliasToRelativePath(
        specifier,
        parent.replace("file://", ""),
        aliases,
        programPaths,
        true
      )?.replacement || specifier
    : specifier;
  console.log("Processing specifier: ", specifier, " => ", newSpecifier);

  const nextResult = await nextResolve(newSpecifier, context);
  // console.log("Processed specifier: ", specifier , " => ", newSpecifier)

  // console.log("Next resolve:", nextResolve)
  // console.log("Next result: ", nextResult?.url)

  return nextResult;

  throw new Error("HAHA lol");
};
