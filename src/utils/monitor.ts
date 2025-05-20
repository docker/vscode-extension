import {
  promptOpenDockerDesktop,
  promptInstallDesktop,
  promptUnauthenticatedDesktop,
} from './prompt';
import { isDockerDesktopInstalled } from './os';
import { getExtensionSetting } from './settings';
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
    spawnDockerCommand('ps', [], {
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
