import { resolve, dirname } from "path";

import { loadJSON } from "~/utils/load";

import type { TSConfig } from "~/types";

/**
 * Load the tsconfig file. If the file extends another tsconfig,
 * it will be recursively loaded.
 *
 * @param path The path to the tsconfig file.
 */
export function loadTSConfig(path: string): TSConfig {
  const aboslutePath = resolve(process.cwd(), path);
  let tsConfig = loadJSON<TSConfig>(aboslutePath, "loadTSConfig");

  if (tsConfig.extends) {
    const parentPath = resolve(dirname(aboslutePath), tsConfig.extends);
    const parentConfig = loadTSConfig(parentPath);
    tsConfig = {
      ...parentConfig,
      ...tsConfig,
      compilerOptions: {
        ...parentConfig.compilerOptions,
        ...tsConfig.compilerOptions,
      },
    };
  }

  return tsConfig;
}
