import { URLSearchParams } from 'url';

export type Repeatable<T> = T | T[];

/**
 * If `false`, the feature is disabled;
 * if `true` or `undefined`, the default options is used;
 * otherwise, the explicitly provided options is used.
 */
export type FeatureSwitch<T> = boolean | T;

/**
 * A webpack-like template string in `[var]` format
 * interpolable with a {@link BuildInfo}.
 */
export type Interpolable = string;

/**
 * @see {@link
 * https://github.com/sindresorhus/matcher#usage | sindresorhus/matcher}
 * for patterns.
 */
export type Pattern = string;

export type AbsolutePath = string;

export interface PackageJSON {
  /**
   * Name from package.json.
   */
  name: string;

  /**
   * Version from package.json.
   */
  version: string;

  /**
   * Description from package.json.
   */
  description: string;

  /**
   * Author from package.json.
   */
  author: string;

  /**
   * Homepage URL from package.json.
   */
  homepage: string;

  bugs: string | { url?: string };
}

export interface PackageInfo extends PackageJSON {
  /**
   * The absolute path of the project root directory.
   */
  root: string;

  /**
   * Bug report URL from package.json.
   */
  bugs: string;
}

export interface CompilationInfo extends PackageInfo {
  /**
   * Hash of Webpack compilation.
   */
  hash: string;

  /**
   * The 13-digits number represents the time the script is built.
   */
  buildTime: number;
}

export interface BuildInfo extends CompilationInfo {
  /**
   * Webpack chunk hash.
   */
  chunkHash: string;

  /**
   * Webpack chunk name.
   */
  chunkName: string;

  /**
   * Entry file path, which may contain queries.
   */
  file: string;

  /**
   * Just like `file` but without queries.
   */
  filename: string;

  /**
   * Just like `filename` but without file extension, i.e. ".user.js" or ".js".
   */
  basename: string;

  /**
   * Query string.
   */
  query: URLSearchParams;
}

export type SSRICache = Array<[string, string]>;

export interface RenderOptions {
  /**
   * Whether prettify the header or not.
   *
   * @defaultValue `true`
   */
  pretty: boolean;

  /**
   * @defaultValue `"[basename].user.js"`
   */
  filename: Interpolable;

  /**
   * Matched tags are rendered to the userscript header.
   *
   * @defaultValue `"*"`
   */
  tagPattern: Repeatable<Pattern>;
}

// export interface CompilationContext {
//   buildInfo: BuildInfo;
//   headers: Header;
// }

// export interface FeatureFullOptions {
//   enable: FeatureSwitch;
// }

// export type FeatureOptions<T extends FeatureFullOptions> =
//   | FeatureSwitch
//   | Partial<T>;

// export interface UserscriptFullOptions extends FeatureFullOptions {
//   /**
//    * Template of filename which will be interpolated with a {@link BuildInfo}.
//    *
//    * @defaultValue `"[basename].user.js"`
//    */
//   filename: string;

//   /**
//    * Filter tags to output.
//    *
//    * @defaultValue all tags will be output.
//    */
//   tagPattern: Repeatable<Pattern>;
// }

// export type UserscriptOptions = FeatureOptions<UserscriptFullOptions>;

// export interface ProxyScriptFullOptions
//   extends UserscriptFullOptions,
//     FeatureFullOptions {
//   /**
//    * Template of filename which will be interpolated with a {@link BuildInfo}.
//    *
//    * @defaultValue `"[basename]-proxy.user.js"`.
//    */
//   filename: string;

//   /**
//    * Base URL of the webpack dev server.
//    *
//    * @defaultValue `"http://localhost:8080/"`
//    */
//   baseUrl: string;

//   /**
//    * @defaultValue Whether it is running under *Webpack dev server* or not.
//    */
//   enable: FeatureSwitch;
// }

// export type ProxyScriptOptions = FeatureOptions<ProxyScriptFullOptions>;

// export type SSRIOptions = FeatureOptions<SSRIFullOptions>;

// export interface FullOptions {

//   userjs: UserscriptOptions;

//   metajs: UserscriptOptions;

//   proxyScript: ProxyScriptOptions;

//   ssri: SSRIOptions;
// }

// export type Options = Partial<FullOptions>;
