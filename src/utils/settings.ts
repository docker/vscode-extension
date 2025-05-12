import * as vscode from 'vscode';

export function disableDockerEngineAvailabilityPrompt(): void {
  vscode.workspace
    .getConfiguration('docker.extension')
    .update(
      'dockerEngineAvailabilityPrompt',
      false,
      vscode.ConfigurationTarget.Global,
    );
}
