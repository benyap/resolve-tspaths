import { resolve, dirname, join, relative } from "path";

import { loadJSON } from "~/utils/load";

import type { TSConfig } from "~/types";
import { TSConfigPropertyError } from "~/utils/errors";

/**
 * Load the tsconfig file. If the file extends another tsconfig,
 * it will be recursively loaded.
 *
 * @param basePath The path to the tsconfig file.
 */
export function loadTSConfig(basePath: string): TSConfig {
  const baseConfig = loadJSON<TSConfig>(basePath, "loadTSConfig");

  if (!baseConfig.extends) return baseConfig;

  const parentPath = resolve(dirname(basePath), baseConfig.extends);
  const parentConfig = loadTSConfig(parentPath);

  const parentCompilerOptions = parentConfig.compilerOptions;
  const baseCompilerOptions = baseConfig.compilerOptions;

  let tsConfig: TSConfig = {
    ...parentConfig,
    ...baseConfig,
    compilerOptions: {
      ...parentCompilerOptions,
      ...baseCompilerOptions,
    },
  };

  const parentPaths = parentCompilerOptions?.paths;
  const basePaths = baseCompilerOptions?.paths;

  // If paths from the parent are not overwritten,
  // ensure they are resolved relative to the parent
  if (parentPaths && !basePaths) {
    const baseUrl = parentCompilerOptions?.baseUrl;

    if (!baseUrl)
      throw new TSConfigPropertyError(
        "loadTSConfig",
        "extends > compilerOptions.baseUrl"
      );

    tsConfig.compilerOptions!.paths = Object.keys(parentPaths).reduce(
      (map, key) => {
        map[key] = parentPaths[key].map((path) =>
          relative(dirname(basePath), join(dirname(parentPath), baseUrl, path))
        );
        return map;
      },
      {} as { [key: string]: string[] }
    );
  }

  // Remove fields that should not be merged
  // See https://www.typescriptlang.org/tsconfig#extends
  delete tsConfig.extends;
  delete tsConfig.references;

  return tsConfig;
}
