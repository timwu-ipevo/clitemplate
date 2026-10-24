import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { appPaths } from '../src/lib/paths.ts';

// path.join uses the host separator, so expectations are built with it too.
describe('appPaths', () => {
  const home = join('/', 'home', 'u');

  it('uses APPDATA / LOCALAPPDATA on Windows', () => {
    const p = appPaths('app', 'win32', { APPDATA: 'R', LOCALAPPDATA: 'L' }, home);
    assert.equal(p.config, join('R', 'app', 'Config'));
    assert.equal(p.cache, join('L', 'app', 'Cache'));
  });

  it('uses ~/Library on macOS', () => {
    const p = appPaths('app', 'darwin', {}, home);
    assert.equal(p.data, join(home, 'Library', 'Application Support', 'app'));
  });

  it('honors XDG variables on Linux', () => {
    const p = appPaths('app', 'linux', { XDG_CONFIG_HOME: '/xdg' }, home);
    assert.equal(p.config, join('/xdg', 'app'));
    assert.equal(p.cache, join(home, '.cache', 'app'));
  });
});
