import { parseArgs } from 'node:util';
import { CliError, type Command } from '../lib/context.ts';

export const greet: Command = {
  name: 'greet',
  aliases: ['hello'],
  summary: 'Print a greeting (example command)',

  usage: (bin) => `Usage:
  ${bin} greet [name] [options]

Options:
  -s, --shout         Uppercase the greeting
  -t, --times <n>     Repeat the greeting n times (default: 1)`,

  async run(argv, { logger }) {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        shout: { type: 'boolean', short: 's' },
        times: { type: 'string', short: 't', default: '1' },
      },
      allowPositionals: true,
    });

    const times = Number(values.times);
    if (!Number.isInteger(times) || times < 1) {
      throw new CliError(`--times must be a positive integer, got "${values.times}"`, 2);
    }

    const name = positionals[0] ?? 'world';
    logger.debug(`greeting ${name} ${times} time(s)`);

    let message = `Hello, ${name}!`;
    if (values.shout) message = message.toUpperCase();

    for (let i = 0; i < times; i++) logger.out(message);
    return 0;
  },
};
