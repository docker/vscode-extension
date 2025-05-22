import * as vscode from 'vscode';
import { access } from 'fs';
import { spawnDockerCommand } from './spawnDockerCommand';
import { globalStorageUri } from '../extension';

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

/**
 * Creates an empty JSON schema file (with the content "{}", an empty
 * dictionary) in the global storage location of the Docker DX
 * extension. The file will be named empty.json.
 */
export async function createEmptyComposeSchemaFile(): Promise<vscode.Uri> {
  await vscode.workspace.fs.createDirectory(globalStorageUri);
  const emptyComposeSchemaFile = vscode.Uri.joinPath(
    globalStorageUri,
    'compose',
    'empty.json',
  );
  await vscode.workspace.fs.writeFile(
    emptyComposeSchemaFile,
    Buffer.from('{}'),
  );
  return emptyComposeSchemaFile;
}
