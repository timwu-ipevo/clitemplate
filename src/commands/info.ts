import { arch, platform, release } from 'node:os';
import { parseArgs } from 'node:util';
import type { Command } from '../lib/context.ts';
import { appPaths } from '../lib/paths.ts';

export const info: Command = {
  name: 'info',
  summary: 'Show environment and app directory information',

  usage: (bin) => `Usage:
  ${bin} info [options]

Options:
  --json    Print machine-readable JSON`,

  async run(argv, { logger, pkg }) {
    const { values } = parseArgs({
      args: argv,
      options: { json: { type: 'boolean' } },
    });

    const data = {
      name: pkg.name,
      version: pkg.version,
      node: process.version,
      platform: platform(),
      arch: arch(),
      osRelease: release(),
      paths: appPaths(pkg.name),
    };

    if (values.json) {
      logger.out(JSON.stringify(data, null, 2));
      return 0;
    }

    logger.out(
      [
        `${data.name} v${data.version}`,
        `node      ${data.node}`,
        `platform  ${data.platform} (${data.arch}, ${data.osRelease})`,
        `config    ${data.paths.config}`,
        `data      ${data.paths.data}`,
        `cache     ${data.paths.cache}`,
      ].join('\n'),
    );
    return 0;
  },
};
