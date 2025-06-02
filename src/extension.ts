import { spawn } from 'child_process';
import { homedir } from 'os';
import * as vscode from 'vscode';
import Bugsnag, { Event, Session } from '@bugsnag/js';
import {
  activateDockerNativeLanguageClient,
  getNativeClient,
} from './utils/lsp/lsp';
import { DidChangeConfigurationNotification } from 'vscode-languageclient/node';
import {
  EVENT_CLIENT_HEARTBEAT,
  notifyBugsnag,
  publishTelemetry,
  queueTelemetryEvent,
} from './telemetry/client';
import { checkForDockerEngine } from './utils/monitor';
import { spawnDockerCommand } from './utils/spawnDockerCommand';
import {
  disableEnableComposeLanguageServer,
  getExtensionSetting,
  inspectExtensionSetting,
} from './utils/settings';
import { redact } from './telemetry/filter';

export const BakeBuildCommandId = 'dockerLspClient.bake.build';
export const ScoutImageScanCommandId = 'docker.scout.imageScan';

export let extensionVersion: string;

const errorRegExp = new RegExp('(E[A-Z]+)');

function registerCommands(ctx: vscode.ExtensionContext) {
  registerCommand(ctx, BakeBuildCommandId, async (commandArgs: any) => {
    const result = await spawnDockerCommand(
      'buildx',
      ['bake', '--help'],
      "Bake is not available. To access Docker Bake's features, install Docker Desktop.",
    );
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
    const result = spawnDockerCommand(
      'scout',
      [],
      "Docker Scout is not available. To access Docker Scout's features, install Docker Desktop.",
    );
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
          notifyBugsnag(reject);
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

async function toggleComposeLanguageServerSetting(): Promise<string> {
  const setting = inspectExtensionSetting('enableComposeLanguageServer');
  if (vscode.extensions.getExtension('redhat.vscode-yaml') !== undefined) {
    // if Red Hat's YAML extension is installed, we will auto-disable
    // the Compose language server features to prevent duplicates
    if (setting !== undefined && setting.globalValue === undefined) {
      await disableEnableComposeLanguageServer();
      return 'false';
    }
  }
  return setting === undefined ? 'undefined' : String(setting.globalValue);
}

export async function activate(ctx: vscode.ExtensionContext) {
  const composeSetting = await toggleComposeLanguageServerSetting();
  extensionVersion = String(ctx.extension.packageJSON.version);
  Bugsnag.start({
    apiKey: 'c5b75b41a335069129747c7196ec207a',
    appType: 'vscode',
    appVersion: extensionVersion,
    autoDetectErrors: false,
    hostname: vscode.env.machineId,
    metadata: {
      system: {
        os: process.platform === 'win32' ? 'windows' : process.platform,
        arch: process.arch === 'x64' ? 'amd64' : process.arch,
        app_host: vscode.env.appHost,
        app_name: vscode.env.appName,
        machine_id: vscode.env.machineId,
        client_session: vscode.env.sessionId,
      },
    },
    onError: (event: Event): void => {
      for (let i = 0; i < event.errors.length; i++) {
        event.errors[i].errorMessage = redact(event.errors[i].errorMessage);
        for (let j = 0; j < event.errors[i].stacktrace.length; j++) {
          event.errors[i].stacktrace[j].file = redact(
            event.errors[i].stacktrace[j].file,
          );
        }
      }
      event.device.hostname = vscode.env.machineId;
    },
    onSession: (session: Session): void | boolean => {
      session.id = vscode.env.sessionId;
    },
    sendCode: false,
  });

  recordVersionTelemetry(composeSetting);
  registerCommands(ctx);
  listenForOpenedDocuments();
  activateDockerLSP(ctx);
  listenForConfigurationChanges(ctx);
}

async function listenForOpenedDocument(
  languageId: string,
  shouldReact: () => boolean,
  fileOpened: () => Promise<void>,
) {
  let reacted = false;
  for (const document of vscode.workspace.textDocuments) {
    if (document.languageId === languageId && document.uri.scheme === 'file') {
      // if the expected file type is currently opened, react if necessary
      if (shouldReact()) {
        await fileOpened();
      }
      reacted = true;
      break;
    }
  }

  if (!reacted) {
    // no documents for the expected file type is currently opened,
    // listen for one being opened and react if necessary
    const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
      if (
        document.languageId === languageId &&
        document.uri.scheme === 'file'
      ) {
        if (shouldReact()) {
          fileOpened();
        }
        disposable.dispose();
      }
    });
  }
}

/**
 * Listen for Dockerfiles files being opened.
 *
 * If a Dockerfile is opened, we want to check to see if a Docker Engine
 * is available. If not, we will prompt the user to install Docker
 * Desktop or open Docker Desktop.
 */
function listenForOpenedDocuments(): void {
  listenForOpenedDocument(
    'dockerfile',
    () => getExtensionSetting('dockerEngineAvailabilityPrompt') === true,
    checkForDockerEngine,
  );
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

function recordVersionTelemetry(composeSetting: string) {
  const installedExtensions = vscode.extensions.all
    .filter((extension) => {
      return (
        extension.id === 'ms-azuretools.vscode-docker' ||
        extension.id === 'ms-azuretools.vscode-containers' ||
        extension.id === 'redhat.vscode-yaml'
      );
    })
    .map((extension) => extension.id);
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
      installedExtensions,
      settings: {
        'docker.extension.enableComposeLanguageServer': composeSetting,
      },
    });
    publishTelemetry();
  });
  process.on('exit', (code) => {
    if (code === 0) {
      queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, false, {
        docker_version: String(versionString),
        installedExtensions,
        settings: {
          'docker.extension.enableComposeLanguageServer': composeSetting,
        },
      });
    } else {
      queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, false, {
        docker_version: String(code),
        installedExtensions,
        settings: {
          'docker.extension.enableComposeLanguageServer': composeSetting,
        },
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
