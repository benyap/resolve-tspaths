import { resolve } from "path";

import type { Alias } from "~/types";
import { InvalidAliasError } from "~/utils/errors";

/**
 * Compute the alias paths provided by the tsconfig.
 */
export function computeAliases(
  basePath: string,
  paths: { [key: string]: string[] }
): Alias[] {
  const regex = /\*$/;

  const aliases: Alias[] = Object.keys(paths).map((alias) => ({
    alias,
    prefix: alias.replace(regex, ""),
    aliasPaths: paths[alias].map((path: string) =>
      resolve(basePath, path.replace(regex, ""))
    ),
  }));

  // Ensure that aliases do not start with a relative path
  // This will lead to unknown behaviour, and why would you use ./ or ../ as an alias anyway?
  for (const { alias } of aliases) {
    if (alias.startsWith("./") || alias.startsWith("../"))
      throw new InvalidAliasError(computeAliases.name, alias);
  }

  return aliases;
}
