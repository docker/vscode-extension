import { access } from 'fs';
import { spawn } from 'child_process';
import * as vscode from 'vscode';
import { spawnDockerCommand } from './spawnDockerCommand';

enum DockerEngineStatus {
  Unavailable,
  Unauthenticated,
  Available,
}

/**
 * Checks if a Docker Engine is available. If not, prompts the user to
 * either install or open Docker Desktop.
 */
export async function checkForDockerEngine(): Promise<void> {
  if (
    !vscode.workspace
      .getConfiguration('docker.extension')
      .get('dockerEngineAvailabilityPrompt')
  ) {
    return;
  }

  const status = await checkDockerStatus();
  if (status === DockerEngineStatus.Unavailable) {
    if (await isDockerDesktopInstalled()) {
      promptOpenDockerDesktop();
    } else {
      promptInstallDesktop();
    }
  } else if (status === DockerEngineStatus.Unauthenticated) {
    promptUnauthenticatedDesktop();
  }
}

/**
 * Verify and returns whether a Docker daemon is working and accessible.
 */
function checkDockerStatus(): Promise<DockerEngineStatus> {
  return new Promise<DockerEngineStatus>((resolve) => {
    const s = spawn('docker', ['ps']);
    let output = '';
    s.stderr.on('data', (chunk) => {
      output += String(chunk);
    });
    s.on('error', () => {
      // this happens if docker cannot be found on the PATH
      return resolve(DockerEngineStatus.Unavailable);
    });
    s.on('exit', (code) => {
      if (code === 0) {
        return resolve(DockerEngineStatus.Available);
      }
      if (
        output.includes('Sign-in enforcement is enabled') ||
        output.includes(
          'request returned Internal Server Error for API route and version',
        )
      ) {
        return resolve(DockerEngineStatus.Unauthenticated);
      }
      return resolve(DockerEngineStatus.Unavailable);
    });
  });
}

function getDockerDesktopPath(): string {
  switch (process.platform) {
    case 'win32':
      return 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
    case 'darwin':
      return '/Applications/Docker.app';
  }
  return '/opt/docker-desktop/bin/com.docker.backend';
}

async function isDockerDesktopInstalled(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    spawnDockerCommand('docker', ['desktop', 'version'], () => {
      access(getDockerDesktopPath(), (err) => {
        resolve(err === null);
      });
    });
  });
}

function disableDockerEngineAvailabilityPrompt(): void {
  vscode.workspace
    .getConfiguration('docker.extension')
    .update(
      'dockerEngineAvailabilityPrompt',
      false,
      vscode.ConfigurationTarget.Global,
    );
}

/**
 * Prompts the user to login to Docker Desktop.
 */
async function promptUnauthenticatedDesktop(): Promise<void> {
  const response = await vscode.window.showInformationMessage(
    'Docker is not running. To get help with your Dockerfile, sign in to Docker Desktop.',
    "Don't show again",
  );
  if (response === "Don't show again") {
    disableDockerEngineAvailabilityPrompt();
  }
}

/**
 * Prompts the user to open Docker Desktop.
 */
async function promptOpenDockerDesktop(): Promise<void> {
  const response = await vscode.window.showInformationMessage(
    'Docker is not running. To get help with your Dockerfile, start Docker.',
    "Don't show again",
    'Open Docker Desktop',
  );
  if (response === "Don't show again") {
    disableDockerEngineAvailabilityPrompt();
  } else if (response === 'Open Docker Desktop') {
    const dockerDesktopPath = getDockerDesktopPath();
    if (process.platform === 'darwin') {
      spawn('open', [dockerDesktopPath]).on('exit', (code) => {
        if (code !== 0) {
          vscode.window.showErrorMessage(
            `Failed to open Docker Desktop: open ${dockerDesktopPath}`,
            { modal: true },
          );
        }
      });
    } else {
      spawn(dockerDesktopPath).on('exit', (code) => {
        if (code !== 0) {
          vscode.window.showErrorMessage(
            `Failed to open Docker Desktop: ${dockerDesktopPath}`,
            { modal: true },
          );
        }
      });
    }
  }
}

/**
 * Prompts the user to install Docker Desktop by navigating to the
 * website.
 */
async function promptInstallDesktop(): Promise<void> {
  const response = await vscode.window.showInformationMessage(
    'Docker is not running. To get help with your Dockerfile, start Docker.',
    "Don't show again",
    'Install Docker Desktop',
  );
  if (response === "Don't show again") {
    disableDockerEngineAvailabilityPrompt();
  } else if (response === 'Install Docker Desktop') {
    vscode.env.openExternal(
      vscode.Uri.parse('https://docs.docker.com/install/'),
    );
  }
}
