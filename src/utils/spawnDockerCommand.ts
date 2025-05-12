import { spawn } from 'child_process';

export async function spawnDockerCommand(command: string, args: string[] = []) {
  return await new Promise<boolean>((resolve) => {
    const process = spawn('docker', [command, ...args]);
    process.on('error', () => {
      resolve(false);
    });
    process.on('exit', (code) => {
      resolve(code === 0);
    });
  });
}
