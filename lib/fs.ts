/**
 * FS-implementation aware functions.
 * @module
 */
import _fs, { Stats } from 'fs';
import path from 'path';
import { promisify } from 'util';

export interface FileSystem {
  stat(
    path: string,
    callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void,
  ): void;

  readFile(
    path: string,
    callback: (
      err: NodeJS.ErrnoException | null,
      data: string | Buffer,
    ) => void,
  ): void;
}

export class PackageError extends Error {
  public name = 'PackageError';
  public constructor(cwd: string) {
    super(`Package cannot be found recursing up from "${cwd}".`);
  }
}

export async function findPackage(
  cwd: string,
  fs: FileSystem = _fs,
): Promise<string> {
  const statAsync = promisify(fs.stat);
  let dir = cwd;
  while (true) {
    const parent = path.dirname(dir);
    try {
      const pkg = await statAsync(path.join(dir, 'package.json'));
      if (pkg.isFile()) {
        return dir;
      }
    } catch (e) {
      if (dir === parent) {
        // root directory
        throw new PackageError(dir);
      }
    }
    dir = parent;
  }
}

export class InvalidJSON extends Error {
  public name = 'InvalidJSON';
  public constructor(msg: string, file: string) {
    super(`${msg} (${file})`);
  }
}

export async function readJSON<T>(
  file: string,
  fs: FileSystem = _fs,
): Promise<T> {
  const buf = await promisify(fs.readFile)(file);
  try {
    return JSON.parse(buf.toString());
  } catch (e) {
    throw new InvalidJSON(e.message, file);
  }
}
