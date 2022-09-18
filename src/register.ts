import { computeAliases } from "./steps/computeAliases";
import { aliasToRelativePath } from "./steps/generateChanges";
import { loadTSConfig } from "./steps/loadTSConfig";
import { resolvePaths } from "./steps/resolvePaths";

function getCoreModules(builtinModules: string[] | undefined): {
  [key: string]: boolean;
} {
  builtinModules = builtinModules || [
    "assert",
    "buffer",
    "child_process",
    "cluster",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "https",
    "net",
    "os",
    "path",
    "punycode",
    "querystring",
    "readline",
    "stream",
    "string_decoder",
    "tls",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "zlib",
  ];

  const coreModules: { [key: string]: boolean } = {};
  for (let module of builtinModules) {
    coreModules[module] = true;
  }

  return coreModules;
}

const myOptions = {
  /**
   * Path to the project's tsconfig file. Defaults to "tsconfig.json"
   * if not provided.
   */
  project: "tsconfig.json",
  /**
   * A list of file extensions that will be matched for replacement.
   * Defaults to `["js", "d.ts"]` to handle js and type declaration
   * files.
   */
  ext: ["js", "d.ts"],
  /**
   * If `true`, verbose logs will be printed for degugging.
   */
  verbose: false,
  /**
   * If `true`, changes will not be emitted.
   */
  noEmit: true,
};

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 * Returns a function to undo paths registration.
 */
export function register(): () => void {
  console.log(process.argv);
  //   const projectIndex = process.argv.findIndex(
  //     (arg) => arg === "--project" || arg === "-P"
  //   );
  //process.env.npm_config_argv .original
  //   if (projectIndex === -1) {
  //     console.warn(
  //       "resolve-tspaths loader will be skipped, because no project was specified"
  //     );
  //     throw new Error("No project specified");
  //   }
  const projectPath = process.env.TS_NODE_PROJECT || "tsconfig.json";
  // process.argv[projectIndex + 1];

  myOptions.project = projectPath;

  const tsConfig = loadTSConfig(projectPath);
  //   const { rootDir, outDir, baseUrl, paths } = tsConfig.options ?? {};
  const programPaths = resolvePaths(
    {
      project: projectPath,
    },
    tsConfig
  );

  const aliases = computeAliases(
    programPaths.basePath,
    tsConfig?.options?.paths ?? {}
  );

  // Patch node's module loading
  // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
  const Module = require("module");
  // eslint-disable-next-line no-underscore-dangle
  const originalResolveFilename = Module._resolveFilename;
  const coreModules = getCoreModules(Module.builtinModules);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,no-underscore-dangle
  Module._resolveFilename = function (request: string, _parent: any): string {
    const isCoreModule = coreModules.hasOwnProperty(request);
    if (!isCoreModule) {
      console.log("LOG: ", request, _parent);
      if (_parent?.filename) {
        const found = aliasToRelativePath(
          request,
          _parent.filename,
          aliases,
          programPaths
        );
        if (found.replacement) {
          const modifiedArguments = [
            found.replacement || found.original,
            ...[].slice.call(arguments, 1),
          ]; // Passes all arguments. Even those that is not specified above.
          return originalResolveFilename.apply(this, modifiedArguments);
        }
      }
    }
    return originalResolveFilename.apply(this, arguments);
  };

  return () => {
    // Return node's module loading to original state.
    // eslint-disable-next-line no-underscore-dangle
    Module._resolveFilename = originalResolveFilename;
  };
}
