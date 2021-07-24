import Ajv, { JSONSchemaType } from 'ajv';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import path from 'path';
import { validate as validateOptions } from 'schema-utils';
import { SyncWaterfallHook } from 'tapable';
import { URLSearchParams } from 'url';
import { Chunk, Compilation, Compiler, WebpackPluginInstance } from 'webpack';
import {
  BuildInfo,
  CompilationInfo,
  PackageInfo,
  PackageJSON,
  SSRICache,
} from '../../types';
import { Header } from '../../types/schema/header';
import { UserscriptOptions } from '../../types/schema/userscript';
import { FileSystem, findPackage, readJSON } from '../fs';
import { getHeaderSchema, getUserscriptOptionSchema } from '../schema';
import { interpolate, resolveUrl } from '../utils';

const ajv = new Ajv();

export class UserscriptPlugin implements WebpackPluginInstance {
  public static readonly headerValidator = ajv.compile(
    getHeaderSchema() as JSONSchemaType<Header>,
  );

  public static readonly mutualExclusiveHeaders: Record<string, string[]> = {
    homepage: ['homepage', 'homepageURL', 'website', 'source'],
    icon: ['icon', 'iconURL', 'defaulticon'],
    icon64: ['icon64', 'icon64URL'],
  };

  public name = 'UserscriptPlugin';

  public readonly hooks = {
    createHeaderSchema: new SyncWaterfallHook<
      JSONSchema4 | JSONSchema6 | JSONSchema7
    >(),
  };
  public readonly options: UserscriptOptions;
  public readonly fileValidity: Map<string, boolean> = new Map();
  public readonly chunkFileInfo: WeakMap<
    Chunk,
    Map<
      string,
      {
        buildInfo: BuildInfo;
        headers: Header;
      }
    >
  > = new WeakMap();
  public readonly ssriCache: Map<string, string> = new Map();

  public packageInfo!: PackageInfo;
  public headerPath!: string;
  public rawHeaders!: Header;

  private compiler!: Compiler;

  public constructor({ ...options }: UserscriptOptions = {}) {
    validateOptions(getUserscriptOptionSchema(), options);
    this.options = options;
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.;

    this.compiler = compiler;

    compiler.hooks.invalid.tap(this.name, (file) => this.invalidate(file));
    compiler.hooks.beforeCompile.tapPromise(this.name, () => this.loadPackageInfo());
    compiler.hooks.beforeCompile.tapPromise(this.name, async () => {


      if (this.options.ssri) {
        const cachePath =
          typeof this.options.ssri === 'object' &&
            typeof this.options.ssri.cache === 'string'
            ? this.options.ssri.cache
            : path.join(
              compiler.options.context ?? process.cwd(),
              '.ssri-cache.json',
            );
        if (!fileValidity.get(cachePath)) {
          ssriCache = new Map(
            await readJSON<SSRICache>(
              cachePath,
              compiler.inputFileSystem as FileSystem,
            ),
          );
          fileValidity.set(cachePath, true);
        }
      }
    });

    // collect build info
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        async () => {
          const compilationInfo: CompilationInfo = {
            ...packageInfo,
            buildTime: Date.now(),
            hash: compilation.hash ?? '',
          };
          for (const entrypoint of compilation.entrypoints.values()) {
            const chunk = entrypoint.getEntrypointChunk();

            for (const file of chunk.files) {
              const queryStart = file.indexOf('?');
              const filename =
                queryStart >= 0 ? file.substr(0, queryStart) : file;

              if (path.extname(filename) !== '.js') {
                continue;
              }

              let fileInfo = chunkFileInfo.get(chunk);
              if (!fileInfo) {
                fileInfo = new Map();
                chunkFileInfo.set(chunk, fileInfo);
              }

              const buildInfo = {
                ...compilationInfo,
                basename: filename.endsWith('.user.js')
                  ? path.basename(filename, '.user.js')
                  : filename.endsWith('.js')
                    ? path.basename(filename, '.js')
                    : filename,
                query: new URLSearchParams(
                  queryStart >= 0 ? file.substr(queryStart) : '',
                ),
                file,
                filename,
                chunkHash: chunk.hash ?? '',
                chunkName: chunk.name,
              };

              const headers = UserscriptPlugin.interpolateHeaders(
                rawHeaders,
                buildInfo,
              );

              if (typeof headers.downloadURL === 'string') {
                const baseDownloadUrl =
                  typeof this.options.publicUrl === 'object'
                    ? this.options.publicUrl.downloadUrl
                    : this.options.publicUrl;
                headers.downloadURL = resolveUrl(
                  headers.downloadURL,
                  baseDownloadUrl,
                );
              }

              if (typeof headers.updateURL === 'string') {
                const baseUpdateUrl =
                  typeof this.options.publicUrl === 'object'
                    ? this.options.publicUrl.updateUrl
                    : this.options.publicUrl;
                headers.updateURL = resolveUrl(
                  headers.updateURL,
                  baseUpdateUrl,
                );
              }

              if (this.options.ssri) {
              }

              fileInfo.set(file, {
                buildInfo,
                headers,
              });
            }
          }
        },
      );
    });

    // collect files for watching
    compiler.hooks.afterCompile.tap(this.name, (compilation) => {
      compilation.fileDependencies.addAll(fileValidity.keys());
    });
  }

  private invalidate(file: string | null): void {
    if (file && this.fileValidity.has(file)) {
      this.fileValidity.set(file, false);
    }
  }

  private async loadPackageInfo(): Promise<void> {
    this.packageInfo = this.packageInfo ?? await UserscriptPlugin.readPackageInfo(
      this.options.root,
      this.compiler.options.context,
      this.compiler.inputFileSystem as FileSystem,
    )
  }

  private async loadHeaders(): Promise<void> {
    this.headerPath = this.headerPath ?? UserscriptPlugin.resolveHeaderPath(
      this.options.headers,
      this.compiler.options.context,
    );

    if (this.headerPath && !this.fileValidity.get(this.headerPath)) {
      this.rawHeaders = UserscriptPlugin.createHeader(
        this.packageInfo,
        await readJSON(this.headerPath, this.compiler.inputFileSystem as FileSystem),
      );
      this.fileValidity.set(this.headerPath, true);
    } else if (!this.headerPath) {
      this.rawHeaders = UserscriptPlugin.createHeader(
        this.packageInfo,
        this.options.headers,
      );
    }
  }

  public static async readPackageInfo(
    rootOption: UserscriptOptions['root'],
    context: string = process.cwd(),
    fs?: FileSystem,
  ): Promise<PackageInfo> {
    const root =
      typeof rootOption === 'string'
        ? rootOption
        : rootOption === false
          ? ''
          : await findPackage(context, fs);

    const pkg = await readJSON<PackageJSON>(
      path.join(root, 'package.json'),
      fs,
    );

    return {
      root: root,
      name: pkg.name ?? '',
      version: pkg.version ?? '',
      author: pkg.author ?? '',
      description: pkg.description ?? '',
      homepage: pkg.homepage ?? '',
      bugs:
        typeof pkg.bugs === 'object' && typeof pkg.bugs.url === 'string'
          ? pkg.bugs.url
          : typeof pkg.bugs === 'string'
            ? pkg.bugs
            : '',
    };
  }

  public static resolveHeaderPath(
    headersOption: UserscriptOptions['headers'],
    context: string = process.cwd(),
  ): string {
    if (
      typeof headersOption === 'undefined' ||
      typeof headersOption === 'string'
    ) {
      return headersOption ?? path.join(context, 'headers.json');
    } else {
      return '';
    }
  }

  public static createHeader(
    packageInfo: PackageInfo,
    headersJSON: Partial<Header>,
  ): Header {
    const headerPackage = Object.fromEntries(
      [
        ['name', packageInfo.name],
        ['version', packageInfo.version],
        ['author', packageInfo.author],
        ['description', packageInfo.description],
        ['homepage', packageInfo.homepage],
        ['supportURL', packageInfo.bugs],
        ['match', headersJSON.include ? '' : '*://*/*'],
      ].filter(([, value]) => !!value),
    );
    const headers = Object.assign(headerPackage, headersJSON);
    if (!this.headerValidator(headers)) {
      throw new Error(
        ajv.errorsText(this.headerValidator.errors, {
          dataVar: 'headers',
        }),
      );
    }
    return headers;
  }

  public static interpolateHeaders(
    headers: Header,
    info: Record<string, unknown>,
  ): Header {
    return Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [
        name,
        typeof value === 'string'
          ? interpolate(value, info)
          : typeof value === 'object'
            ? Object.fromEntries(
              Object.entries(value).map(([n, v]) => [
                interpolate(n, info),
                typeof v === 'string' ? interpolate(v, info) : v,
              ]),
            )
            : Array.isArray(value)
              ? value.map((v) => interpolate(v, info))
              : value,
      ]),
    ) as Header;
  }
}
