import { resolve } from "path";

import type { Alias, TSConfig } from "~/types";

/**
 * Compute the alias paths provided by the tsconfig.
 */
export function computeAliases(basePath: string, tsConfig: TSConfig): Alias[] {
  const regex = /\*$/;
  const { compilerOptions = {} } = tsConfig;
  const paths = compilerOptions.paths ?? {};
  const aliases: Alias[] = Object.keys(paths)
    .map((alias) => ({
      prefix: alias.replace(regex, ""),
      aliasPaths: paths[alias].map((path: string) =>
        resolve(basePath, path.replace(regex, ""))
      ),
    }));
  return aliases;
}
