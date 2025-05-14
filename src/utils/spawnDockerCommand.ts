/**
 * Spawns a Docker command as a child process and handles its execution.
 *
 * @param command - The Docker command to execute (e.g., "run", "build").
 * @param args - An optional array of arguments to pass to the Docker command.
 * @param processEvents - An object containing optional callback functions for handling process events:
 *   - onExit: Invoked when the process exits with the exit code.
 *   - onError: Invoked when an error occurs during process execution.
 *   - onStdout: Invoked when there is data written to the standard output stream.
 *   - onStderr: Invoked when there is data written to the standard error stream.
 * @returns A promise that resolves to `true` if the command exits with a code of 0, or `false` otherwise.
 */
import { spawn } from 'child_process';
import { showUnknownCommandMessage } from './prompt';

export async function spawnDockerCommand(
  command: string,
  args: string[] = [],
  processEvents: {
    onExit?: (code: number | null) => void;
    onError?: (error: Error) => void;
    onStderr?: (chunk: any) => void;
    onStdout?: (chunk: any) => void;
  } = {},
) {
  return await new Promise<boolean>((resolve) => {
    const { onExit, onError, onStdout, onStderr } = processEvents;
    const process = spawn('docker', [command, ...args]);
    process.on('error', (error) => {
      if (onError) {
        onError(error);
      }
      resolve(false);
    });
    process.on('exit', (code) => {
      if (onExit) {
        onExit(code);
      }
      resolve(code === 0);
    });

    process.stderr.on('data', (chunk: string) => {
      if (chunk.includes('docker: unknown command')) {
        showUnknownCommandMessage(command);
      }
      if (onStderr) {
        onStderr(chunk);
      }
    });

    if (onStdout) {
      process.stdout.on('data', (chunk) => {
        onStdout(chunk);
      });
    }
  });
}
