import { spawn } from 'child_process';

export async function spawnDockerCommand(
  command: string,
  args: string[] = [],
  onExit?: () => void,
) {
  return await new Promise<boolean>((resolve) => {
    const process = spawn('docker', [command, ...args]);
    process.on('error', () => {
      resolve(false);
    });
    process.on('exit', (code) => {
      if (code === 0) {
        return resolve(true);
      }

      if (onExit) {
        onExit();
      }
      resolve(false);
    });
  });
}
