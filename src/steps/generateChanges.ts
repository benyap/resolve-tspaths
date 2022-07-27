import { existsSync, readFileSync } from "fs";
import { dirname, relative, resolve } from "path";

import { FileNotFoundError } from "~/utils/errors";

import type { Alias, Change, ProgramPaths, TextChange } from "~/types";

export const IMPORT_EXPORT_REGEX =
  /(?:(?:require\(|require\.resolve\(|import\()|(?:import|export) (?:.*from )?)['"]([^'"]*)['"]\)?/g;

const MODULE_EXTS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".cjs",
  ".mjs",
  ".mdx",
  ".d.ts",
  "/index.js",
  "/index.jsx",
  "/index.ts",
  "/index.tsx",
  "/index.cjs",
  "/index.mjs",
  "/index.mdx",
  "/index.d.ts",
];

const FILE_EXTS = [".json"];

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
    (original, matched) => {
      const result = aliasToRelativePath(
        matched,
        filePath,
        aliases,
        programPaths
      );

      if (!result.replacement) return original;

      const index = original.indexOf(matched);
      changes.push({
        original: result.original,
        modified: result.replacement,
      });

      return (
        original.substring(0, index) +
        result.replacement +
        original.substring(index + matched.length)
      );
    }
  );

  return { changed: originalText !== newText, text: newText, changes };
}

/**
 * Convert an aliased path to a relative path.
 *
 * @param path The aliased path that needs to be mapped to a relative path.
 * @param filePath The location of the file that the aliased path was from.
 * @param aliases The path mapping configuration from tsconfig.
 * @param programPaths Program options.
 */
export function aliasToRelativePath(
  path: string,
  filePath: string,
  aliases: Alias[],
  programPaths: Pick<ProgramPaths, "srcPath" | "outPath">
): { file: string; original: string; replacement?: string } {
  const { srcPath, outPath } = programPaths;

  // Ignore any relative paths and return the original path
  // ASSUMPTION: they are either not an alias, or have already been replaced
  if (path.startsWith("./") || path.startsWith("../"))
    return { file: filePath, original: path };

  for (const alias of aliases) {
    const { prefix, aliasPaths } = alias;

    // Skip the alias if the path does not start with the prefix
    if (!path.startsWith(prefix)) continue;

    const pathRelative = path.substring(prefix.length);
    const srcFile = resolve(srcPath, relative(outPath, filePath));

    // Find a matching alias path
    for (const aliasPath of aliasPaths) {
      const modulePath = resolve(aliasPath, pathRelative);

      // Makes sure that a source file exists at the module's path
      let ext = MODULE_EXTS.find((ext) => existsSync(`${modulePath}${ext}`));
      if (typeof ext !== "string")
        ext = FILE_EXTS.find(
          (ext) => modulePath.endsWith(ext) && existsSync(modulePath)
        );
      if (typeof ext !== "string") continue;

      const srcDir = dirname(srcFile);
      let newPath = relative(srcDir, modulePath);

      // If the srcDir is the same as the modulePath and the matched extension
      // does not start with "/", it means that there is a folder with the
      // same name as the source file. We need to resolve the path relative
      // to the source file, not the folder.
      if (srcDir === modulePath && !ext.startsWith("/")) {
        const regex = new RegExp(`${ext.replace(".", "\\.")}$`);
        newPath = relative(srcDir, `${modulePath}${ext}`).replace(regex, "");
      }

      const replacement = newPath.startsWith(".") ? newPath : `./${newPath}`;

      return {
        file: filePath,
        original: path,
        replacement: replacement.replace(/\\/g, "/"),
      };
    }
  }

  // If no alias was found, just return the original path
  return { file: filePath, original: path };
}
