#! /usr/bin/env node

import { bold } from "ansi-colors";

import { Logger } from "./utils/logger";
import { StepError } from "./utils/errors";
import type { ProgramOptions } from "./types";

import { createProgram } from "./steps/createProgram";
import { loadTSConfig } from "./steps/loadTSConfig";
import { resolvePaths } from "./steps/resolvePaths";
import { computeAliases } from "./steps/computeAliases";
import { getFilesToProcess } from "./steps/getFilesToProcess";
import { generateChanges } from "./steps/generateChanges";
import { applyChanges } from "./steps/applyChanges";

function main() {
  const program = createProgram();
  const options = program.parse().opts<ProgramOptions>();
  const logger = new Logger(options.verbose ? "verbose" : "info");

  logger.verbose();
  logger.fancyParams("options", options);

  try {
    const tsConfig = loadTSConfig(options.project);
    const { baseUrl, outDir, paths } = tsConfig.compilerOptions ?? {};
    logger.fancyParams("compilerOptions", { baseUrl, outDir, paths });

    const programPaths = resolvePaths(options, tsConfig);
    logger.fancyParams("programPaths", programPaths);

    const aliases = computeAliases(programPaths.basePath, tsConfig);
    logger.fancyParams("aliases", aliases);

    const files = getFilesToProcess(programPaths.outPath, options.ext);
    logger.fancyParams("filesToProcess", files);

    const changes = generateChanges(files, aliases, programPaths);
    logger.fancyParams(
      "fileChanges",
      changes.map(({ file, changes }) => ({ file, changes }))
    );

    if (options.noEmit) {
      logger.info(
        bold("resolve-tspaths:"),
        "discovered",
        changes.length,
        "file(s) for change (none actually changed since --noEmit was given)"
      );
    } else {
      applyChanges(changes);
      logger.info(
        bold("resolve-tspaths:"),
        "changed",
        changes.length,
        "file(s)"
      );
    }
  } catch (error: any) {
    if (error instanceof StepError) {
      logger.fancyError(
        `Error during step '${bold(error.step)}'`,
        error.message
      );
    } else throw error;
  }
}

main();
