import { loadTSConfig } from "~/steps/loadTSConfig";
import { computeAliases } from "~/steps/computeAliases";
import { resolvePaths } from "~/steps/resolvePaths";
import {
  TransformOptions,
  Transformer,
  AsyncTransformer,
  SyncTransformer,
  TransformedSource,
} from "@jest/transform";
import { env } from "node:process";
import { replaceAliasPaths } from "~/steps/generateChanges";
export { resolveTsModuleNames } from "~/loaders/jestModuleMapper";

type TransformerConfig =
  | {
      /** A path to the tsconfig file.
       * @default "tsconfig.json"
       */
      tsconfig?: string;
      /** Call another transformer before this one.
       * Set to empty string to not use another transformer.
       * @default "ts-jest"
       */
      tsJest?: string;
      /** Options for another transformer */
      tsJestConfig?: unknown;
    }
  | undefined;

const loadTransformer = (path: string | undefined, config: unknown) => {
  const transformerPath = path || "ts-jest";
  try {
    const transformer =
      require(transformerPath).default || require(transformerPath);

    if (!transformer.process && !transformer.processAsync) {
      if (transformer.createTransformer) {
        return transformer.createTransformer(config) as Transformer;
      }

      throw new Error(`Failed to load transformer ${path}`);
    }

    return transformer as Transformer;
  } catch (e) {
    if (!path) {
      // Do not fail, if the default transformer is not found
      console.warn(
        "You should also install ts-jest if you want to use resolve-tspaths as a jest transformer"
      );
      return undefined;
    }
    throw e;
  }
};

/**
 * Returns a hash code from a string
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const createTransformer = (
  config: TransformerConfig
): Transformer<TransformerConfig> => {
  const { tsconfig, tsJest, tsJestConfig } = config || {};
  const otherTransformer =
    tsJest !== "" ? loadTransformer(tsJest, tsJestConfig ?? {}) : undefined;

  const projectPath = tsconfig || env.TS_NODE_PROJECT || "tsconfig.json";
  const tsConfig = loadTSConfig(projectPath);

  const programPaths = resolvePaths(
    {
      project: projectPath,
    },
    tsConfig
  );

  programPaths.outPath = programPaths.srcPath;

  const aliases = computeAliases(
    programPaths.basePath,
    tsConfig?.options?.paths ?? {}
  );

  const tsJestOptions = (options: TransformOptions<TransformerConfig>) => {
    return {
      ...options,
      transformerConfig: tsJestConfig ?? {},
    };
  };

  return {
    canInstrument: true,
    getCacheKey:
      !otherTransformer || otherTransformer?.getCacheKey
        ? (
            sourceText: string,
            sourcePath: string,
            options: TransformOptions<TransformerConfig>
          ) => {
            const otherCacheKey =
              otherTransformer?.getCacheKey?.(
                sourceText,
                sourcePath,
                tsJestOptions(options)
              ) ?? "";
            const idString = `${sourcePath}:${sourceText}:${otherCacheKey}`;
            return hashCode(idString).toString();
          }
        : undefined,
    getCacheKeyAsync:
      !otherTransformer || otherTransformer?.getCacheKeyAsync
        ? async (
            sourceText: string,
            sourcePath: string,
            options: TransformOptions<TransformerConfig>
          ) => {
            const otherCacheKey =
              (await otherTransformer?.getCacheKeyAsync?.(
                sourceText,
                sourcePath,
                tsJestOptions(options)
              )) ?? "";
            const idString = `${sourcePath}:${sourceText}:${otherCacheKey}`;
            return hashCode(idString).toString();
          }
        : undefined,
    process:
      !otherTransformer || otherTransformer?.process
        ? (sourceText, sourcePath, options) => {
            const afterOtherTransformer =
              otherTransformer?.process?.(
                sourceText,
                sourcePath,
                tsJestOptions(options)
              ) ?? ({ code: sourceText } as TransformedSource);

            const result = replaceAliasPaths(
              afterOtherTransformer.code,
              sourcePath,
              aliases,
              programPaths
            );

            return {
              code: result.text,
              map: afterOtherTransformer.map,
            };
          }
        : (undefined as unknown as SyncTransformer<unknown>["process"]),
    processAsync:
      !otherTransformer || otherTransformer?.processAsync
        ? async (sourceText, sourcePath, options) => {
            const afterOtherTransformer =
              (await otherTransformer?.processAsync?.(
                sourceText,
                sourcePath,
                tsJestOptions(options)
              )) ?? ({ code: sourceText } as TransformedSource);

            const result = replaceAliasPaths(
              afterOtherTransformer.code,
              sourcePath,
              aliases,
              programPaths
            );

            return {
              code: result.text,
              map: afterOtherTransformer.map,
            };
          }
        : (undefined as unknown as AsyncTransformer<unknown>["processAsync"]),
  };
};

export default { createTransformer };
