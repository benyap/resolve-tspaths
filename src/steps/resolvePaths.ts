import { resolve, dirname } from "path";

import { StepError, TSConfigPropertyError } from "~/utils/errors";

import type { ProgramOptions, ProgramPaths, TSConfig } from "~/types";

/**
 * Resolve paths provided to the program to absolute paths.
 */
export function resolvePaths(
  options: Pick<ProgramOptions, "out" | "project" | "src">,
  tsConfig: TSConfig
): ProgramPaths {
  const { baseUrl, outDir, paths } = tsConfig.compilerOptions ?? {};

  const out = options.out ?? outDir;
  if (!out) {
    throw new StepError(
      resolvePaths.name,
      `Output directory must be specified using either the --out option or in tsconfig`
    );
  }

  if (!baseUrl)
    throw new TSConfigPropertyError(
      resolvePaths.name,
      "compilerOptions.baseUrl"
    );

  if (!paths)
    throw new TSConfigPropertyError(
      "resolveConfigPaths",
      "compilerOptions.paths"
    );

  const configFile = resolve(process.cwd(), options.project);
  const configPath = dirname(configFile);
  const basePath = resolve(configPath, baseUrl);
  const srcPath = resolve(
    options.src ?? tsConfig?.compilerOptions?.rootDir ?? "src"
  );
  const outPath = resolve(out);

  return { basePath, configPath, configFile, srcPath, outPath };
}
