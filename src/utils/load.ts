import { readFileSync } from "fs";

import { FileNotFoundError, JSONFileParsingError } from "./errors";

/**
 * Load a `json` or `jsonc` file from the given path.
 *
 * @param path The path to the module.
 * @param step The name of step this utility is used in. Used for error reporting.
 */
export function loadJSON<T = unknown>(path: string, step: string): T {
  let data: string;

  try {
    data = readFileSync(path).toString();
  } catch (error) {
    throw new FileNotFoundError(step, path);
  }

  try {
    data = data.replace(/ *\/\/.*/g, ""); // Remove comments
    return JSON.parse(data) as T;
  } catch (error: any) {
    throw new JSONFileParsingError(step, path, error.message);
  }
}
