export function getDockerDesktopPath(): string {
  switch (process.platform) {
    case 'win32':
      return 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
    case 'darwin':
      return '/Applications/Docker.app';
  }
  return '/opt/docker-desktop/bin/com.docker.backend';
}
