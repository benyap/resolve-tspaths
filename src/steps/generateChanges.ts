import { existsSync, readFileSync, statSync } from "fs";
import { basename, dirname, join, relative, resolve } from "path";

import { FileNotFoundError } from "~/utils/errors";

import type { Alias, Change, ProgramPaths, TextChange } from "~/types";

export const IMPORT_EXPORT_REGEX =
  /((?:require\(|require\.resolve\(|import\()|(?:import|export) (?:.*from )?)['"]([^'"]*)['"]\)?/g;

export const ESM_IMPORT_EXPORT_REGEX =
  /(?:(?:import\()|(?:import|export)\s+(?:.*from\s+)?)['"]([^'"]*)['"]\)?/g;
export const COMMONJS_IMPORT_EXPORT_REGEX =
  /(?:(?:require\(|require\.resolve\()\s+)['"]([^'"]*)['"]\)/g;

const MODULE_EXTS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".cjs",
  ".mjs",
  ".mdx",
  ".d.ts",
];

/**
 * Generate the alias path mapping changes to apply to the provide files.
 *
 * @param files The list of files to replace alias paths in.
 * @param aliases The path mapping configuration from tsconfig.
 * @param programPaths Program options.
 */
export function generateChanges(
  files: string[],
  aliases: Alias[],
  programPaths: Pick<ProgramPaths, "srcPath" | "outPath">
): Change[] {
  const changeList: Change[] = [];

  for (const file of files) {
    const { changed, text, changes } = replaceAliasPathsInFile(
      file,
      aliases,
      programPaths
    );

    if (!changed) continue;

    changeList.push({ file, text, changes });
  }

  return changeList;
}

/**
 * Read the file at the given path and return the text with aliased paths replaced.
 *
 * @param filePath The path to the file.
 * @param aliases The path mapping configuration from tsconfig.
 * @param programPaths Program options.
 */
export function replaceAliasPathsInFile(
  filePath: string,
  aliases: Alias[],
  programPaths: Pick<ProgramPaths, "srcPath" | "outPath">
): { changed: boolean; text: string; changes: TextChange[] } {
  if (!existsSync(filePath))
    throw new FileNotFoundError(replaceAliasPathsInFile.name, filePath);

  const originalText = readFileSync(filePath, "utf-8");
  const changes: TextChange[] = [];

  const newText = originalText.replace(
    IMPORT_EXPORT_REGEX,
    (original, importStatement, importSpecifier) => {
      // The import is an esm import, if it is inside a typescript (definition) file or if it uses `import` or `export`
      const esmImport =
        !filePath.endsWith(".ts") &&
        (importStatement.includes("import") ||
          importStatement.includes("export"));
      const result = aliasToRelativePath(
        importSpecifier,
        filePath,
        aliases,
        programPaths,
        esmImport
      );

      if (!result.replacement) return original;

      const index = original.lastIndexOf(importSpecifier);
      changes.push({
        original: result.original,
        modified: result.replacement,
      });

      return (
        original.substring(0, index) +
        result.replacement +
        original.substring(index + importSpecifier.length)
      );
    }
  );

  return { changed: originalText !== newText, text: newText, changes };
}

/**
 * Convert an aliased path to a relative path.
 *
 * @param importSpecifier A import specifier as used in the source file
 * @param outputFile The location of the file that the aliased path was from.
 * @param aliases The path mapping configuration from tsconfig.
 * @param programPaths Program options.
 * @param esModule Whether the import will be resolved with ES module semantics or commonjs semantics
 */
export function aliasToRelativePath(
  importSpecifier: string,
  outputFile: string,
  aliases: Alias[],
  { srcPath, outPath }: Pick<ProgramPaths, "srcPath" | "outPath">,
  esModule?: boolean
): { file: string; original: string; replacement?: string } {
  const sourceFile = resolve(srcPath, relative(outPath, outputFile));
  const sourceFileDirectory = dirname(sourceFile);

  const importPathIsRelative =
    importSpecifier.startsWith("./") || importSpecifier.startsWith("../");

  const matchingAliases = aliases.filter(({ prefix }) =>
    importSpecifier.startsWith(prefix)
  );

  const absoluteImportPaths = importPathIsRelative
    ? [resolve(sourceFileDirectory, importSpecifier)]
    : matchingAliases.flatMap(({ prefix, aliasPaths }) =>
        aliasPaths.map((aliasPath) =>
          resolve(aliasPath, importSpecifier.replace(prefix, ""))
        )
      );

  const absoluteImport = absoluteImportPaths.reduce(
    (acc, path) => acc || resolveImportPath(path),
    undefined as undefined | ReturnType<typeof resolveImportPath>
  );

  if (!absoluteImport) {
    return {
      file: outputFile,
      original: importSpecifier,
    };
  }

  const absoluteImportPath = esModule
    ? absoluteImport.file
    : absoluteImport.imported;

  const relativeImportPath =
    absoluteImport.type === "file"
      ? join(
          relative(sourceFileDirectory, dirname(absoluteImportPath)),
          basename(absoluteImportPath)
        )
      : relative(sourceFileDirectory, absoluteImportPath);

  const prefixedRelativePath = relativeImportPath.replace(
    /^(?!\.+\/)/,
    (m) => "./" + m
  );

  const extensionFixedRelativePath = prefixedRelativePath.replace(
    /\.[^/.]*ts[^/.]*$/,
    (match) => match.replace("ts", "js")
  );

  return {
    file: outputFile,
    original: importSpecifier,
    ...(importSpecifier !== extensionFixedRelativePath
      ? { replacement: extensionFixedRelativePath }
      : {}),
  };
}

/**
 * Find the file that will be imported by the given import path.
 *
 * @param importPath An non-relative import path
 */
function resolveImportPath(importPath: string) {
  const importPathTs = importPath.replace(/\.[^.]*js[^.]*$/, (match) =>
    match.replace("js", "ts")
  );
  const importPathWithExtensions = MODULE_EXTS.map(
    (ext) => `${importPath}${ext}`
  );

  const possiblePaths = [importPath, importPathTs, ...importPathWithExtensions];

  const existingPath = possiblePaths.find((path) => isFile(path));
  if (existingPath) {
    return {
      imported: importPath,
      file: existingPath,
      type: "file" as const,
    };
  }

  // Try index files, if the path is a directory
  const possiblePathsAsDirectory = isDirectory(importPath)
    ? MODULE_EXTS.map((ext) => `${importPath}/index${ext}`)
    : [];
  const existingIndexPath = possiblePathsAsDirectory.find((path) =>
    isFile(path)
  );
  if (existingIndexPath) {
    return {
      imported: importPath,
      file: existingIndexPath,
      type: "directory" as const,
    };
  }

  return;
}

function isFile(path: string) {
  try {
    return statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

function isDirectory(path: string) {
  try {
    return statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}
