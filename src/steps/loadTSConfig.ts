import { dirname } from "path";
import {
  findConfigFile,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
} from "typescript";

import type { TSConfig } from "~/types";
import { FileNotFoundError } from "~/utils/errors";

/**
 * Load the tsconfig file using Typescript's built-in config file loader.
 *
 * @param path The path to the tsconfig file.
 */
export function loadTSConfig(path: string): TSConfig {
  const configFileName = findConfigFile(process.cwd(), sys.fileExists, path);
  if (!configFileName) throw new FileNotFoundError(loadTSConfig.name, path);
  const configFile = readConfigFile(configFileName, sys.readFile);
  const directory = dirname(configFileName);
  const options = parseJsonConfigFileContent(configFile.config, sys, directory);
  return options;
}
