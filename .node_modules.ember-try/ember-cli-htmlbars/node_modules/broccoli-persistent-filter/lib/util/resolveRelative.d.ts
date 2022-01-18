/**
 * This is like path.resolve, but it requires the first path segment to be relative.
 * The result will be a relative path unless one of the other paths is absolute.
 * When an absolute path is encountered, all subsequent paths are resolved against that.
 * If any combination of paths causes the cumulative path at that point to try
 * to escape current root, an error is raised (even if a subsequent path is absolute).
 */
export default function resolveRelative(relativePath: string, ...otherPaths: Array<string>): string;
//# sourceMappingURL=resolveRelative.d.ts.map