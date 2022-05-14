import { resolve } from "path";
import { sync } from "fast-glob";

// See https://github.com/benyap/resolve-tspaths/pull/20
function normalisePath(windowsPath: string) {
  return windowsPath
    .replace(/^\\\\\?\\/, "")
    .replace(/\\/g, "/")
    .replace(/\/\/+/g, "/");
}

/**
 * Get the files in the output directory that should be processed.
 *
 * @param outPath The output directory.
 * @param extensions A list of extensions to match.
 */
export function getFilesToProcess(outPath: string, extensions: string[]) {
  const normalizedOutPath = normalisePath(outPath);

  let glob = "*";
  if (extensions.length === 1) glob = `*.${extensions[0]}`;
  else if (extensions.length > 1) glob = `*.{${extensions.join(",")}}`;

  return sync(`${normalizedOutPath}/**/${glob}`, {
    dot: true,
    onlyFiles: true,
  }).map((path) => resolve(path));
}
