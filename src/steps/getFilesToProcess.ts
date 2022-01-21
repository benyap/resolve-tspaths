import { resolve } from "path";
import { sync } from "fast-glob";

function convertPath(windowsPath: string) {
  return windowsPath
    .replace(/^\\\\\?\\/, "")
    .replace(/\\/g, "/")
    .replace(/\/\/+/g, "/");
}

/**
 * Get the files in the output directory that should be processed.
 *
 * @param outPath The output directory.
 * @param extensions A comma separated list of extensions to match.
 */
export function getFilesToProcess(outPath: string, extensions: string) {
  const normalizedOutPath = convertPath(outPath);
  const extensionsList = extensions.split(",");

  let glob = "*";
  if (extensionsList.length === 1) glob = `*.${extensionsList[0]}`;
  else if (extensionsList.length > 1) glob = `*.{${extensionsList.join(",")}}`;

  return sync(`${normalizedOutPath}/**/${glob}`, {
    dot: true,
    onlyFiles: true,
  }).map((path) => resolve(path));
}
