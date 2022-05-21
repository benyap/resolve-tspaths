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
    .option("-p, --project <path>", "path to tsconfig file", "tsconfig.json")
    .option("-s, --src <path>", "path to source directory")
    .option("-o, --out <path>", "path to output directory")
    .option("--ext <extensions...>", "extension types", ["js", "d.ts"] as any)
    .option("--verbose", "output logs", false)
    .option("--noEmit", "changes will not be emitted", false);

  return program;
}
