import { resolve, dirname } from "path";

import type { ProgramOptions, ProgramPaths, TSConfig } from "~/types";

import { StepError, TSConfigPropertyError } from "~/utils/errors";

/**
 * Resolve paths provided to the program to absolute paths.
 */
export function resolvePaths(
  options: ProgramOptions,
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
  const srcPath = resolve(options.src);
  const outPath = resolve(out);

  return { basePath, configPath, configFile, srcPath, outPath };
}
