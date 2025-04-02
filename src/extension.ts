import { spawn } from 'child_process';
import * as vscode from 'vscode';
import {
  activateDockerNativeLanguageClient,
  getNativeClient,
} from './utils/lsp/lsp';
import { DidChangeConfigurationNotification } from 'vscode-languageclient/node';
import { publishTelemetry, queueTelemetryEvent } from './telemetry/client';
import { checkForDockerEngine } from './utils/monitor';

const unleashLibrary = import('unleash-proxy-client');

let unleashClient: any = null;

export const BakeBuildCommandId = 'dockerLspClient.bake.build';
export const ScoutImageScanCommandId = 'docker.scout.imageScan';

export let extensionVersion: string;

function registerCommands(ctx: vscode.ExtensionContext) {
  registerCommand(ctx, BakeBuildCommandId, (commandArgs: any) => {
    return new Promise((resolve) => {
      const process = spawn('docker', ['buildx', 'bake', '--help']);
      process.on('error', () => {
        resolve(false);
      });
      process.on('exit', (code) => {
        if (code === 0) {
          const args = ['buildx', 'bake'];

          if (commandArgs['call'] === 'print') {
            args.push('--print');
            args.push(commandArgs['target']);
          } else {
            args.push('--call');
            args.push(commandArgs['call']);
            args.push(commandArgs['target']);
          }

          const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            'docker buildx bake',
            'docker-vscode-extension',
            new vscode.ShellExecution('docker', args, {
              cwd: commandArgs['cwd'],
            }),
          );
          vscode.tasks.executeTask(task);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  });
}

function registerCommand(
  ctx: vscode.ExtensionContext,
  id: string,
  commandCallback: (...args: any[]) => Promise<boolean>,
): void {
  ctx.subscriptions.push(
    vscode.commands.registerCommand(id, async (args) => {
      const result = await commandCallback(args);
      queueTelemetryEvent('client_user_action', false, {
        action_id: id,
        result,
      });
    }),
  );
}

const activateDockerLSP = async (ctx: vscode.ExtensionContext) => {
  registerCommands(ctx);

  if (await activateDockerNativeLanguageClient(ctx)) {
    getNativeClient().start();
  }
};

export function activate(ctx: vscode.ExtensionContext) {
  // always register the Scout command even so that it is always available regardless of the rollout stage
  registerCommand(ctx, ScoutImageScanCommandId, (args) => {
    return new Promise((resolve) => {
      const process = spawn('docker', ['scout']);
      process.on('error', () => {
        resolve(false);
      });
      process.on('exit', (code) => {
        if (code === 0) {
          const task = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            'docker scout',
            'docker scout',
            new vscode.ShellExecution(
              'docker',
              ['scout', 'cves', args.fullTag],
              {},
            ),
          );
          vscode.tasks.executeTask(task);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  });

  extensionVersion = String(ctx.extension.packageJSON.version);

  const configValue = vscode.workspace
    .getConfiguration('docker.extension.experimental.release')
    .get<string>('march2025');
  if (configValue === 'disabled') {
    recordVersionTelemetry(configValue, 'ignored');
    return;
  }

  if (configValue === 'enabled') {
    recordVersionTelemetry(configValue, 'ignored');
    activateExtension(ctx);
    return;
  }

  unleashLibrary.then((library) => {
    const client = new library.UnleashClient({
      url: 'https://hub.docker.com/v2/feature-flags/proxy/',
      clientKey: 'changeme',
      appName: 'vscode-extension',
    });
    client.updateContext({
      userId: vscode.env.machineId,
      properties: {
        vscodeExtensionVersion: extensionVersion,
        operatingSystem:
          process.platform === 'win32' ? 'windows' : process.platform,
      },
    });
    client.on('ready', () => {
      const enabled = client.isEnabled('VSCodeReleaseMarch2025');
      recordVersionTelemetry(configValue, enabled ? 'true' : 'false');
      if (enabled) {
        activateExtension(ctx);
      }
    });
    client.start();
    unleashClient = client;
  });
}

async function activateExtension(ctx: vscode.ExtensionContext) {
  if (
    vscode.workspace
      .getConfiguration('docker.extension')
      .get('dockerEngineAvailabilityPrompt')
  ) {
    let notified = false;
    for (const document of vscode.workspace.textDocuments) {
      if (
        document.languageId === 'dockerfile' &&
        document.uri.scheme === 'file'
      ) {
        // if a Dockerfile is open, check if a Docker engine is available
        await checkForDockerEngine();
        notified = true;
        break;
      }
    }

    if (!notified) {
      // no Dockerfiles have been opened yet,
      // listen for one being opened and check if a Docker Engine is available
      const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
        if (
          document.languageId === 'dockerfile' &&
          document.uri.scheme === 'file'
        ) {
          checkForDockerEngine();
          disposable.dispose();
        }
      });
    }
  }

  activateDockerLSP(ctx);
  listenForConfigurationChanges(ctx);
}

function listenForConfigurationChanges(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.env.onDidChangeTelemetryEnabled(() => {
      const client = getNativeClient();
      if (client === undefined || !client.isRunning()) {
        return;
      }

      client.sendNotification(DidChangeConfigurationNotification.type, {
        settings: ['docker.lsp.telemetry'],
      });
    }),
  );

  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        const client = getNativeClient();
        if (client === undefined || !client.isRunning()) {
          return;
        }

        const configurations = [
          'docker.lsp.telemetry',
          'docker.lsp.experimental.vulnerabilityScanning',
        ];
        const filtered = configurations.filter((config) =>
          e.affectsConfiguration(config),
        );
        if (filtered.length > 0) {
          client.sendNotification(DidChangeConfigurationNotification.type, {
            settings: filtered,
          });
        }
      },
    ),
  );
}

function recordVersionTelemetry(
  featureFlag: string | undefined,
  featureFlagValue: 'true' | 'false' | 'ignored',
) {
  let versionString: string | null = null;
  const process = spawn('docker', ['-v']);
  process.stdout.on('data', (data) => {
    versionString = String(data).trim();
  });
  process.on('error', () => {
    // this happens if docker cannot be found on the PATH
    queueTelemetryEvent('client_heartbeat', false, {
      docker_version: 'spawn docker -v failed',
      feature_flag: featureFlag,
      feature_flag_value: featureFlagValue,
    });
    publishTelemetry();
  });
  process.on('exit', (code) => {
    if (code === 0) {
      queueTelemetryEvent('client_heartbeat', false, {
        docker_version: String(versionString),
        feature_flag: featureFlag,
        feature_flag_value: featureFlagValue,
      });
    } else {
      queueTelemetryEvent('client_heartbeat', false, {
        docker_version: String(code),
        feature_flag: featureFlag,
        feature_flag_value: featureFlagValue,
      });
    }
    publishTelemetry();
  });
}

export async function deactivate() {
  if (unleashClient !== null) {
    unleashClient.stop();
    unleashClient = null;
  }
  const client = getNativeClient();
  if (client !== undefined) {
    client.stop();
  }
}
