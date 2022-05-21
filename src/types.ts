export interface TSConfig {
  extends?: string;
  compilerOptions?: TSConfigCompilerOptions;
  [key: string]: any;
}

export interface TSConfigCompilerOptions {
  baseUrl?: string;
  outDir?: string;
  rootDir?: string;
  paths?: { [key: string]: string[] };
}

export interface ProgramOptions {
  /**
   * Path to the project's tsconfig file. Defaults to "tsconfig.json"
   * if not provided.
   */
  project: string;
  /**
   * Path to the source directory. Defaults to `compilerOptions.rootDir`
   * from tsconfig. If `rootDir` is not defined in tsconfig, it will
   * default to "src".
   */
  src?: string;
  /**
   * Path to the output directory. Defaults to `compilerOptions.outDir`
   * from tsconfig if not provided.
   */
  out?: string;
  /**
   * A list of file extensions that will be matched for replacement.
   * Defaults to `["js", "d.ts"]` to handle js and type declaration
   * files.
   */
  ext: string[];
  /**
   * If `true`, verbose logs will be printed for degugging.
   */
  verbose: boolean;
  /**
   * If `true`, changes will not be emitted.
   */
  noEmit: boolean;
}

export interface ProgramPaths {
  /** Absolute path to `baseUrl` as defined in the tsconfig file. */
  basePath: string;
  /** Absolute path to the directory the tsconfig file is in. */
  configPath: string;
  /** Absolute path to the tsconfig file. */
  configFile: string;
  /** Absolute path to the source directory. */
  srcPath: string;
  /** Absolute path to the output directory. */
  outPath: string;
}

export interface Alias {
  /** The alias prefix that has been matched. */
  prefix: string;
  /** The paths that the alias points to. */
  aliasPaths: string[];
}

export interface Change {
  /** The source of the file being changed. */
  file: string;
  /** The new content of the file. */
  text: string;
  /** A list of text changes in the file. */
  changes?: TextChange[];
}

export interface TextChange {
  /** The original text. */
  original: string;
  /** The modified text. */
  modified: string;
}
