import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));

/** Runs the CLI in a child process, exactly as a user would. */
function run(...args: string[]) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe('cli', () => {
  it('prints the version', () => {
    const { code, stdout } = run('--version');
    assert.equal(code, 0);
    assert.match(stdout.trim(), /^\d+\.\d+\.\d+/);
  });

  it('prints help and lists commands', () => {
    const { code, stdout } = run('--help');
    assert.equal(code, 0);
    assert.match(stdout, /Commands:/);
    assert.match(stdout, /greet/);
  });

  it('exits non-zero without a command', () => {
    assert.equal(run().code, 1);
  });

  it('rejects unknown commands', () => {
    const { code, stderr } = run('nope');
    assert.equal(code, 1);
    assert.match(stderr, /Unknown command: nope/);
  });

  it('runs a command with options', () => {
    const { code, stdout } = run('greet', 'Ada', '--shout', '-t', '2');
    assert.equal(code, 0);
    assert.equal(stdout, 'HELLO, ADA!\nHELLO, ADA!\n');
  });

  it('accepts global flags after the command', () => {
    const { code, stderr } = run('hello', '--verbose');
    assert.equal(code, 0);
    assert.match(stderr, /debug: greeting world/);
  });

  it('reports bad option values with exit code 2', () => {
    const { code, stderr } = run('greet', '--times', 'zero');
    assert.equal(code, 2);
    assert.match(stderr, /--times must be a positive integer/);
  });

  it('reports unknown options with exit code 2', () => {
    const { code, stderr } = run('greet', '--bogus');
    assert.equal(code, 2);
    assert.match(stderr, /bogus/);
  });

  it('prints info as JSON', () => {
    const { code, stdout } = run('info', '--json');
    assert.equal(code, 0);
    const data = JSON.parse(stdout);
    assert.equal(data.platform, process.platform);
    assert.ok(data.paths.config);
  });
});
