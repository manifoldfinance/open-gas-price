import * as childProcess from 'child_process';
import * as crypto from 'crypto';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as util from 'util';

import {
    GitDependency,
    PackageDependencyMap,
    PackageVersion,
  } from './types';

const execFilePromise = util.promisify(childProcess.execFile);
const execPromise = util.promisify(childProcess.exec);

interface GitDependencyWithTempDir extends GitDependency {
    tempDir: string;
    sha: string;
  }
  
  /**
   * Parse an array of strings of the form <package>@<version>.
   */
  export function parsePackageVersions(flags: string[]): PackageVersion[] {
    const versions: PackageVersion[] = [];
    for (const flag of flags) {
      const match = flag.match(/^(?:(.+)=)?(.+)@(.+)$/);
      if (match === null) {
        throw new Error(`Invalid package format ${flag}`);
      }
      const [, label, dep, version] = match;
      versions.push({
        label: label || `${dep}@${version}`,
        dependencyOverrides: {
          [dep]: version,
        },
      });
    }
    return versions;
  }

/**
 * Return whether the given string looks like a 40-characters of hexadecimal,
 * i.e. a valid full length git commit SHA-1 hash.
 */
function looksLikeGitSha(ref: string): boolean {
  return ref.match(/^[a-fA-F0-9]{40}$/) !== null;
}


/**
 * Use the `git ls-remote` command to remotely query the given git repo, and
 * resolve the given ref (e.g. a branch or tag) to a commit SHA. Returns
 * `undefined` if the ref does not resolve to anything in the repo. Throws if
 * the repo is invalid or errors.
 */
async function remoteResolveGitRefToSha(
  repo: string,
  ref: string
): Promise<string | undefined> {
  const {stdout} = await execFilePromise('git', [
    'ls-remote',
    repo,
    '--symref',
    ref,
  ]);
  if (stdout.trim() === '') {
    return undefined;
  }
  const parts = stdout.trim().split(/\W/);
  if (parts.length > 0 && looksLikeGitSha(parts[0])) {
    return parts[0];
  }
  throw new Error(
    `Could not parse output of \`git ls-remote ${repo} --symref ${ref}\`:\n${stdout}`
  );
}

function makeLocalRelativeGitRepoAbsolute(repo: string, root: string): string {
  if (repo.startsWith('.') || repo.startsWith('file://.')) {
    const rel = repo.replace(/^file:\/\//, '');
    return path.resolve(root, rel);
  }
  return repo;
}