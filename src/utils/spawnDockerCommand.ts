/**
 * Spawns a Docker command as a child process and handles its execution.
 *
 * @param command - The Docker command to execute (e.g., "run", "build").
 * @param args - An optional array of arguments to pass to the Docker command.
 * @param onExit - An optional callback function that is invoked when the process exits with a non-zero code.
 * @param onStderr - An optional callback function that is invoked when there is data written to the standard error stream.
 * @returns A promise that resolves to `true` if the command exits with a code of 0, or `false` otherwise.
 */
import { spawn } from 'child_process';

export async function spawnDockerCommand(
  command: string,
  args: string[] = [],
  onExit?: () => void,
  onStderr?: () => void,
) {
  return await new Promise<boolean>((resolve) => {
    const process = spawn('docker', [command, ...args]);
    process.on('error', () => {
      // TODO: Show error prompt
      resolve(false);
    });
    process.stderr.on('data', () => {
      if (onStderr) {
        onStderr();
      }
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
