import { access } from 'fs';
import { spawnDockerCommand } from './spawnDockerCommand';

export function getDockerDesktopPath(): string {
  switch (process.platform) {
    case 'win32':
      return 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
    case 'darwin':
      return '/Applications/Docker.app';
  }
  return '/opt/docker-desktop/bin/com.docker.backend';
}

export async function isDockerDesktopInstalled(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    spawnDockerCommand('desktop', ['version'], undefined, {
      onError: () => resolve(false),

      onExit: (code) => {
        if (code === 0) {
          return resolve(true);
        }

        access(getDockerDesktopPath(), (err) => {
          resolve(err === null);
        });
      },
    });
  });
}
