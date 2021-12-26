import { Command } from "commander";

import { version } from "~/version.json";

const example = `
Example:
$ resolve-tspaths --project tsconfig.json --src ./src -out ./dist
`;

/**
 * Create the CLI program.
 */
export function createProgram() {
  const program = new Command();

  program
    .version(version)
    .name("resolve-tspaths")
    .addHelpText("after", example)
    .option("-p, --project <file>", "path to tsconfig.json", "tsconfig.json")
    .option("-s, --src <path>", "source root path", "src")
    .option("-o, --out <path>", "output root path")
    .option("--ext <extensions>", "extension types", "js,d.ts")
    .option("--verbose", "output logs", false)
    .option("--noEmit", "changes will not be emitted", false);

  return program;
}
