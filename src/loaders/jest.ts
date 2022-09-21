import { loadTSConfig } from "../steps/loadTSConfig";
import { computeAliases } from "../steps/computeAliases";
import { resolvePaths } from "../steps/resolvePaths";
import * as path from "path";
import { Alias } from "~/types";
import { relative, resolve } from "path";

export const resolveTsModuleNames = (
  tsConfigPath: string = process.env.TS_NODE_PROJECT || "tsconfig.json",
  workingDirectory?: string
) => {
  const previousWorkingDirectory = process.cwd();
  const absoluteWorkingDirectory = path.resolve(
    process.cwd(),
    workingDirectory || path.dirname(tsConfigPath) || "."
  );
  try {
    process.chdir(absoluteWorkingDirectory);
    const tsConfig = loadTSConfig(path.basename(tsConfigPath));

    const programPaths = resolvePaths(
      {
        project: path.basename(tsConfigPath),
      },
      tsConfig
    );

    programPaths.outPath = programPaths.srcPath;

    const aliases = computeAliases(
      programPaths.basePath,
      tsConfig?.options?.paths ?? {}
    );

    const includedFiles = tsConfig.fileNames.map((fileName) =>
      path.resolve(programPaths.basePath, fileName)
    );

    const importList = generateImportList(
      includedFiles,
      programPaths.basePath,
      aliases
    );

    return Object.fromEntries(
      importList.map((exp) => [exp[0].source, exp[1]] as const)
    );
  } finally {
    process.chdir(previousWorkingDirectory);
  }
};

const escapeRegExp = (input: string) => {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

export const generateImportList = (
  sourceFiles: string[],
  basePath: string,
  aliases: Alias[]
) => {
  const reverseAliases = aliases.flatMap((alias) =>
    alias.aliasPaths.map((path) => ({
      prefix: relative(basePath, path),
      alias: alias.alias,
      aliasPath: alias.prefix,
    }))
  );

  const importList = reverseAliases.flatMap((alias) => {
    const matchingExpressions = sourceFiles.map((sourceFile) => ({
      exp: generateImportsForFile(
        relative(basePath, resolve(basePath, sourceFile)),
        alias.prefix,
        alias.aliasPath
      ),
      file: sourceFile,
    }));
    return matchingExpressions;
  });

  const orderedImports = importList
    .reduce((array, element) => {
      element.exp.forEach((expression, index) => {
        if (expression) {
          array[index] = array[index] || [];
          array[index]!.push([expression, element.file]);
        }
      });
      return array;
    }, [] as Array<Array<[RegExp, string]>>)
    .flat();

  return orderedImports;
};

// Returns an array with imports sorted by priority
// TODO: Improve documentation
const generateImportsForFile = (
  sourceFile: string,
  aliasPrefix: string,
  aliasPath: string
): (RegExp | undefined)[] => {
  const sourceFileMatches = sourceFile.startsWith(aliasPrefix);
  if (!sourceFileMatches) {
    return [];
  }

  const genRegExp = (thing: string) => {
    return new RegExp(`^${aliasPath}${thing}$`);
  };

  const basicPath = relative(aliasPrefix, sourceFile);

  const escapedBasicPath = escapeRegExp(basicPath);

  // complete import, but with js or ts extensions
  const importOne = genRegExp(
    escapedBasicPath.replace(/(\.[^/.]*)[tj]s([^/.]*)$/, "$1[tj]s$2")
  );

  // import without extensions
  const importTwo = path.extname(basicPath)
    ? genRegExp(escapeRegExp(basicPath.replace(/\.[^./\\]+$/, "")))
    : undefined;

  // directory import
  const importThree = path.basename(basicPath).match(/index\..*/)
    ? genRegExp(escapeRegExp(path.dirname(basicPath)))
    : undefined;

  return [importOne, importTwo, importThree];
};
