import * as vscode from 'vscode';
import {
  promptOpenDockerDesktop,
  promptInstallDesktop,
  promptUnauthenticatedDesktop,
} from './prompt';
import { createEmptyComposeSchemaFile, isDockerDesktopInstalled } from './os';
import { disableYamlDuplicationPrompt, getExtensionSetting } from './settings';
import { spawnDockerCommand } from './spawnDockerCommand';

enum DockerEngineStatus {
  Unavailable,
  Unauthenticated,
  Available,
}

/**
 * Prompt the user about duplicated YAML editing features caused by
 * having both the Docker DX extension and Red Hat's YAML extension
 * installed.
 */
export async function promptComposeDuplications(): Promise<void> {
  const emptyComposeSchemaFile = await createEmptyComposeSchemaFile();
  const config = vscode.workspace.getConfiguration('yaml');
  const schemas = config.get<object>('schemas');
  if (schemas !== undefined) {
    for (const schema of Object.keys(schemas)) {
      if (schema === emptyComposeSchemaFile.path) {
        // the empty file is already being used by yaml.schemas, do not need to prompt
        return;
      }
    }
  }

  const response = await vscode.window.showWarningMessage(
    'Both the Docker DX and Red Hat YAML extensions are providing editor features for your Compose files which may result in duplicate hovers and code completion suggestions. ' +
      'Would you like to globally disable Compose support in the Red Hat YAML extension?',
    'Disable',
    'Details',
    "Don't show me again",
  );
  if (response === 'Disable') {
    config.update(
      'schemas',
      {
        [emptyComposeSchemaFile.path]: ['compose*y*ml', 'docker-compose*y*ml'],
      },
      vscode.ConfigurationTarget.Global,
    );
    vscode.window.showInformationMessage(
      'The global yaml.schemas setting has been updated.',
    );
  } else if (response === 'Details') {
    vscode.env.openExternal(
      vscode.Uri.parse(
        'https://github.com/docker/vscode-extension/blob/main/README.md#faq',
      ),
    );
  } else if (response === "Don't show me again") {
    disableYamlDuplicationPrompt();
  }
}

/**
 * Checks if a Docker Engine is available. If not, prompts the user to
 * either install or open Docker Desktop.
 */
export async function checkForDockerEngine(): Promise<void> {
  if (!getExtensionSetting('dockerEngineAvailabilityPrompt')) {
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
    let output = '';
    spawnDockerCommand('ps', [], undefined, {
      onError: () => resolve(DockerEngineStatus.Unavailable),
      onStderr: (chunk) => {
        output += String(chunk);
      },
      onExit: (code) => {
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
      },
    });
  });
}
