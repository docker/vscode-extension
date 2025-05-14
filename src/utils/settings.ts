import * as vscode from 'vscode';

type DockerExtensionSettings = 'dockerEngineAvailabilityPrompt';

/**
 * Retrieves the value of a specified setting from the Docker extension's configuration.
 *
 * @param setting - The name of the setting to retrieve.
 * @returns The value of the specified setting, or `undefined` if the setting is not found.
 */

export function getExtensionSetting(setting: DockerExtensionSettings) {
  return vscode.workspace.getConfiguration('docker.extension').get(setting);
}

/**
 * Updates the value of a specified setting in the Docker extension's configuration.
 *
 * @param setting - The name of the setting to update.
 * @param value - The new value to set for the specified setting.
 */
function setExtensionSetting(
  setting: string,
  value: string | boolean,
  configurationTarget: vscode.ConfigurationTarget = vscode.ConfigurationTarget
    .Global,
): void {
  vscode.workspace
    .getConfiguration('docker.extension')
    .update(setting, value, configurationTarget);
}

export function disableDockerEngineAvailabilityPrompt(): void {
  setExtensionSetting('dockerEngineAvailabilityPrompt', false);
}
