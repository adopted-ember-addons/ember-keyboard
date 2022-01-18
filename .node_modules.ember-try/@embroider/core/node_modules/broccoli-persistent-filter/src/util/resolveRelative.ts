import * as path from 'path';

const PARENT_DIR = '..' + path.sep;

/**
 * This is like path.resolve, but it requires the first path segment to be relative.
 * The result will be a relative path unless one of the other paths is absolute.
 * When an absolute path is encountered, all subsequent paths are resolved against that.
 * If any combination of paths causes the cumulative path at that point to try
 * to escape current root, an error is raised (even if a subsequent path is absolute).
 */
export default function resolveRelative(relativePath: string, ...otherPaths: Array<string>): string {
  let cumulativePath = path.normalize(relativePath);
  if (path.isAbsolute(cumulativePath)) {
    throw new Error(`The first path must be relative. Got: ${relativePath}`);
  }
  if (cumulativePath.startsWith(PARENT_DIR)) {
    throw new Error(`The first path cannot start outside the local root of the filesystem. Got: ${relativePath}`);
  }
  for (let nextPath of otherPaths) {
    let originalNextPath = nextPath;
    if (path.isAbsolute(nextPath)) {
      cumulativePath = path.normalize(nextPath);
    } else {
      nextPath = path.normalize(nextPath);
      cumulativePath = path.normalize(path.join(cumulativePath, nextPath));
      if (cumulativePath.startsWith(PARENT_DIR) || cumulativePath === '..') {
        throw new Error(`Illegal path segment would cause the cumulative path to escape the local or global filesystem: ${originalNextPath}`);
      }
    }
  }
  return cumulativePath;
}