import { parseArgs } from 'node:util';
import { commands, findCommand } from './commands/index.ts';
import { CliError, type Context } from './lib/context.ts';
import { createLogger } from './lib/logger.ts';
import { readPackageInfo } from './lib/package.ts';

const GLOBAL_PASSTHROUGH_FLAGS = new Set(['--verbose', '--no-color']);

export async function main(argv: string[]): Promise<number> {
  const pkg = readPackageInfo();

  // Global flags are parsed loosely so subcommands can own their own options.
  const { values, positionals, tokens } = parseArgs({
    args: argv,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      verbose: { type: 'boolean' },
      'no-color': { type: 'boolean' },
    },
    allowPositionals: true,
    strict: false,
    tokens: true,
  });

  const logger = createLogger({
    verbose: values.verbose === true,
    color: values['no-color'] !== true,
  });

  if (values.version === true && positionals.length === 0) {
    logger.out(pkg.version);
    return 0;
  }

  const name = positionals[0];
  if (name === undefined) {
    logger.out(renderHelp(pkg.name, pkg.version));
    return values.help === true ? 0 : 1;
  }

  const command = findCommand(name);
  if (!command) {
    logger.error(`Unknown command: ${name}`);
    logger.out(`Run "${pkg.name} --help" for usage.`);
    return 1;
  }

  // Everything after the command name belongs to the command, minus global
  // flags so `greet --verbose` works as well as `--verbose greet`.
  const commandToken = tokens.find((t) => t.kind === 'positional' && t.value === name);
  const rest = argv
    .slice((commandToken?.index ?? 0) + 1)
    .filter((arg) => !GLOBAL_PASSTHROUGH_FLAGS.has(arg));

  const ctx: Context = { logger, pkg, cwd: process.cwd(), env: process.env };

  if (rest.includes('--help') || rest.includes('-h')) {
    logger.out(command.usage(pkg.name));
    return 0;
  }

  try {
    return (await command.run(rest, ctx)) ?? 0;
  } catch (err) {
    if (err instanceof CliError) {
      logger.error(err.message);
      return err.exitCode;
    }
    // parseArgs throws TypeErrors with ERR_PARSE_ARGS_* codes on bad input.
    if (err instanceof Error && 'code' in err && String(err.code).startsWith('ERR_PARSE_ARGS')) {
      logger.error(err.message);
      logger.out(command.usage(pkg.name));
      return 2;
    }
    throw err;
  }
}

function renderHelp(bin: string, version: string): string {
  const width = Math.max(...commands.map((c) => c.name.length));
  const list = commands
    .map((c) => `  ${c.name.padEnd(width)}  ${c.summary}`)
    .join('\n');
  return `${bin} v${version}

Usage:
  ${bin} <command> [options]

Commands:
${list}

Global options:
  -h, --help       Show help (also works after a command)
  -v, --version    Show version
      --verbose    Print debug output
      --no-color   Disable colored output (or set NO_COLOR=1)`;
}
