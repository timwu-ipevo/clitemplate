import type { Logger } from './logger.ts';
import type { PackageInfo } from './package.ts';

export interface Context {
  logger: Logger;
  pkg: PackageInfo;
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface Command {
  name: string;
  aliases?: string[];
  summary: string;
  usage(bin: string): string;
  /** Returns the process exit code (defaults to 0). */
  run(argv: string[], ctx: Context): Promise<number | void>;
}

/** An expected, user-facing failure: printed without a stack trace. */
export class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}
