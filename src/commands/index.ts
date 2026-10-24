import type { Command } from '../lib/context.ts';
import { greet } from './greet.ts';
import { info } from './info.ts';

/** Register new commands here; order controls `--help` output. */
export const commands: Command[] = [greet, info];

export function findCommand(name: string): Command | undefined {
  return commands.find((c) => c.name === name || c.aliases?.includes(name));
}
