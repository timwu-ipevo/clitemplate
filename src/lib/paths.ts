import { homedir } from 'node:os';
import { join } from 'node:path';

export interface AppPaths {
  config: string;
  data: string;
  cache: string;
}

/**
 * Per-user directories following each platform's conventions:
 *  - Windows: %APPDATA% / %LOCALAPPDATA%
 *  - macOS:   ~/Library/{Application Support,Caches}
 *  - Linux:   $XDG_CONFIG_HOME, $XDG_DATA_HOME, $XDG_CACHE_HOME (with defaults)
 */
export function appPaths(
  appName: string,
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  home: string = homedir(),
): AppPaths {
  if (platform === 'win32') {
    const roaming = env.APPDATA ?? join(home, 'AppData', 'Roaming');
    const local = env.LOCALAPPDATA ?? join(home, 'AppData', 'Local');
    return {
      config: join(roaming, appName, 'Config'),
      data: join(local, appName, 'Data'),
      cache: join(local, appName, 'Cache'),
    };
  }

  if (platform === 'darwin') {
    const lib = join(home, 'Library');
    return {
      config: join(lib, 'Preferences', appName),
      data: join(lib, 'Application Support', appName),
      cache: join(lib, 'Caches', appName),
    };
  }

  return {
    config: join(env.XDG_CONFIG_HOME || join(home, '.config'), appName),
    data: join(env.XDG_DATA_HOME || join(home, '.local', 'share'), appName),
    cache: join(env.XDG_CACHE_HOME || join(home, '.cache'), appName),
  };
}
