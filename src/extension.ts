import { spawn } from 'child_process';
import { homedir } from 'os';
import * as vscode from 'vscode';
import {
  activateDockerNativeLanguageClient,
  getNativeClient,
} from './utils/lsp/lsp';
import { DidChangeConfigurationNotification } from 'vscode-languageclient/node';
import {
  EVENT_CLIENT_HEARTBEAT,
  publishTelemetry,
  queueTelemetryEvent,
} from './telemetry/client';
import { checkForDockerEngine } from './utils/monitor';
import { spawnDockerCommand } from './utils/spawnDockerCommand';

export const BakeBuildCommandId = 'dockerLspClient.bake.build';
export const ScoutImageScanCommandId = 'docker.scout.imageScan';

export let extensionVersion: string;

const errorRegExp = new RegExp('(E[A-Z]+)');

function registerCommands(ctx: vscode.ExtensionContext) {
  registerCommand(ctx, BakeBuildCommandId, async (commandArgs: any) => {
    const result = await spawnDockerCommand('buildx', ['bake', '--help']);
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
    return result;
  });

  registerCommand(ctx, ScoutImageScanCommandId, async (args) => {
    const result = spawnDockerCommand('scout');
    const options: vscode.ShellExecutionOptions = {};
    if (
      vscode.workspace.workspaceFolders === undefined ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      options.cwd = homedir();
    }
    const task = new vscode.Task(
      { type: 'shell' },
      vscode.TaskScope.Workspace,
      'docker scout',
      'docker scout',
      new vscode.ShellExecution(
        'docker',
        ['scout', 'cves', args.fullTag],
        options,
      ),
    );
    vscode.tasks.executeTask(task);
    return result;
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
  if (await activateDockerNativeLanguageClient(ctx)) {
    getNativeClient()
      .start()
      .then(
        () => {},
        (reject) => {
          if (typeof reject === 'string') {
            const matches = reject.match(errorRegExp);
            if (matches !== null && matches.length > 0) {
              queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, true, {
                error_function: 'DockerLanguageClient.start',
                message: matches[0],
              });
              return;
            }
          } else if (reject.code !== undefined) {
            queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, true, {
              error_function: 'DockerLanguageClient.start',
              message: String(reject.code),
            });
            return;
          }
          queueTelemetryEvent('client_heartbeat', true, {
            error_function: 'DockerLanguageClient.start',
            message: 'unrecognized',
          });
        },
      );
  }
};

export function activate(ctx: vscode.ExtensionContext) {
  extensionVersion = String(ctx.extension.packageJSON.version);
  recordVersionTelemetry();
  registerCommands(ctx);
  activateExtension(ctx);
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

function recordVersionTelemetry() {
  let versionString: string | null = null;
  const process = spawn('docker', ['-v']);
  process.stdout.on('data', (data) => {
    if (versionString === null) {
      versionString = '';
    }
    versionString += String(data).trim();
  });
  process.on('error', () => {
    // this happens if docker cannot be found on the PATH
    queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, false, {
      docker_version: 'spawn docker -v failed',
    });
    publishTelemetry();
  });
  process.on('exit', (code) => {
    if (code === 0) {
      queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, false, {
        docker_version: String(versionString),
      });
    } else {
      queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, false, {
        docker_version: String(code),
      });
    }
    publishTelemetry();
  });
}

export async function deactivate() {
  const client = getNativeClient();
  if (client !== undefined) {
    client.stop();
  }
}
