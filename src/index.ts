import { ProgramOptions } from "./types";

import { loadTSConfig } from "./steps/loadTSConfig";
import { resolvePaths } from "./steps/resolvePaths";
import { computeAliases } from "./steps/computeAliases";
import { getFilesToProcess } from "./steps/getFilesToProcess";
import { generateChanges } from "./steps/generateChanges";
import { applyChanges } from "./steps/applyChanges";

export type ResolveTsPathOptions = Omit<
  Partial<ProgramOptions>,
  "verbose" | "noEmit"
>;

/**
 * Convert Typescript path aliases to proper relative paths
 * in your transpiled JavaScript code.
 */
export async function resolveTsPaths(
  options: ResolveTsPathOptions = {}
): Promise<void> {
  const {
    project = "tsconfig.json",
    src = "src",
    ext = "js,d.ts",
    out,
  } = options;
  const tsConfig = loadTSConfig(project);
  const programPaths = resolvePaths({ project, src, out }, tsConfig);
  const aliases = computeAliases(programPaths.basePath, tsConfig);
  const files = getFilesToProcess(programPaths.outPath, ext);
  const changes = generateChanges(files, aliases, programPaths);
  applyChanges(changes);
}
