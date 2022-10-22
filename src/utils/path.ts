/**
 * Normalize paths to resolve issues with paths on Windows.
 *
 * @see https://github.com/benyap/resolve-tspaths/pull/20
 * @see https://github.com/benyap/resolve-tspaths/pull/174
 *
 * @param path The path to normalize.
 */
export function normalizePath(path: string): string {
  return path
    .replace(/^\\\\\?\\/, "")
    .replace(/\\/g, "/")
    .replace(/\/\/+/g, "/")
    .replace(/^.\/\.\.\//g, "../");
}
