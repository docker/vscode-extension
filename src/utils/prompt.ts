import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { disableDockerEngineAvailabilityPrompt } from './settings';
import { getDockerDesktopPath } from './os';

/**
 * Prompts the user to login to Docker Desktop.
 */
export async function promptUnauthenticatedDesktop(): Promise<void> {
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
export async function promptOpenDockerDesktop(): Promise<void> {
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
export async function promptInstallDesktop(): Promise<void> {
  const response = await vscode.window.showInformationMessage(
    'Docker is not running. To get help with your Dockerfile, install Docker.',
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

/**
 * Shows a message to the user indicating that Docker Desktop does not know the command
 */
export async function showUnknownCommandMessage(
  command: string,
): Promise<void> {
  // TODO: Get a proper error message from Allie
  await vscode.window.showErrorMessage(
    `Docker Desktop does not know the command "${command}".`,
  );
}
