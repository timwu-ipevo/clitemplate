import { readFileSync } from 'node:fs';

export interface PackageInfo {
  name: string;
  version: string;
}

// Inlined by scripts/build-exe.mjs, where there is no package.json on disk.
declare const __PACKAGE_INFO__: PackageInfo | undefined;

let cached: PackageInfo | undefined;

/** Reads package.json relative to this file (works from both src/ and dist/). */
export function readPackageInfo(): PackageInfo {
  if (typeof __PACKAGE_INFO__ !== 'undefined') return __PACKAGE_INFO__;
  if (!cached) {
    const url = new URL('../../package.json', import.meta.url);
    const json = JSON.parse(readFileSync(url, 'utf8')) as Partial<PackageInfo>;
    cached = { name: json.name ?? 'cli', version: json.version ?? '0.0.0' };
  }
  return cached;
}
