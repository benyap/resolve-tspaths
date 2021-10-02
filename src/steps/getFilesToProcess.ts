import { resolve } from "path";
import { sync } from "fast-glob";

/**
 * Get the files in the output directory that should be processed.
 *
 * @param outPath The output directory.
 * @param extensions A comma separated list of extensions to match.
 */
export function getFilesToProcess(outPath: string, extensions: string) {
  const extensionsList = extensions.split(",");

  let glob = "*";
  if (extensionsList.length === 1) glob = `*.${extensionsList[0]}`;
  else if (extensionsList.length > 1) glob = `*.{${extensionsList.join(",")}}`;

  return sync(`${outPath}/**/${glob}`, {
    dot: true,
    onlyFiles: true,
  }).map((path) => resolve(path));
}
