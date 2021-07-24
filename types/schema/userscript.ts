import {
  AbsolutePath,
  FeatureSwitch,
  Interpolable,
  Pattern,
  Repeatable,
} from '..';
import { Header } from './header';

interface SSRIOptions {
  /**
   * Only if the tag name matches the pattern,
   * then the SSRI of it's URI will be computed.
   *
   * @defaultValue all tags will be computed.
   */
  tagPattern?: Repeatable<Pattern>;

  /**
   * Only if the URI matches the pattern, then its SSRI will be computed.
   *
   * @defaultValue all URIs will be computed.
   */
  uriPattern?: Repeatable<Pattern>;

  cache?: Interpolable;

  /**
   * This option is bypassed to `IntegrityStream`.
   *
   * @see
   * https://github.com/npm/ssri#--ssrifromstreamstream-opts---promiseintegrity
   */
  algorithms?: string[];

  /**
   * {@inheritDoc SSRIFullOptions.algorithms}
   */
  strict?: boolean;
}

interface PublicUrlFullOptions {
  downloadUrl?: string;
  updateUrl?: string;
}

type PublicUrlOptions = PublicUrlFullOptions | string;

export interface UserscriptOptions {
  /**
   * The directory where package.json resides in.
   *
   * If it is `true` or `undefined`, it will be searched recursing up from cwd.
   * If it is `false`, no search will be performed
   * and values from package.json are ignored.
   * Otherwise, it should be an absolute path to the package.json.
   */
  root?: FeatureSwitch<AbsolutePath>;

  ssri?: FeatureSwitch<SSRIOptions>;

  /**
   * Base URL of downloadURL and updateURL.
   */
  publicUrl?: PublicUrlOptions;

  /**
   * Base header data. If a json path is given, it should be an absolute path.
   *
   * @defaultValue `"headers.json"` under the context directory.
   */
  headers?: Header | AbsolutePath;
}
