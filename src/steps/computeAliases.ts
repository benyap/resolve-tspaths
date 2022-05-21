import { resolve } from "path";

import type { Alias } from "~/types";

/**
 * Compute the alias paths provided by the tsconfig.
 */
export function computeAliases(
  basePath: string,
  paths: { [key: string]: string[] }
): Alias[] {
  const regex = /\*$/;
  const aliases: Alias[] = Object.keys(paths).map((alias) => ({
    prefix: alias.replace(regex, ""),
    aliasPaths: paths[alias].map((path: string) =>
      resolve(basePath, path.replace(regex, ""))
    ),
  }));
  return aliases;
}
