import * as path from 'path';
import * as vscode from 'vscode';
import { getExtensionSetting } from '../utils/settings';

class DebugAdapterExecutableFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    const parent = path.dirname(session.configuration.dockerfile);
    return new vscode.DebugAdapterExecutable(
      'docker',
      [
        'buildx',
        'dap',
        'build',
        '-f',
        session.configuration.dockerfile,
        parent,
      ],
      {
        cwd: parent,
        env: { BUILDX_EXPERIMENTAL: '1' },
      },
    );
  }
}

class DockerfileConfigurationProvider
  implements vscode.DebugConfigurationProvider
{
  resolveDebugConfiguration(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    // this can happen when debugging without anything in launch.json
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined && editor.document.languageId === 'dockerfile') {
        config.type = 'dockerfile';
        config.name = 'Debug Dockerfile';
        config.request = 'launch';
        config.dockerfile = editor.document.uri.fsPath;
      }
    }
    return config;
  }
}

class DockerfileDebugAdapterTracker implements vscode.DebugAdapterTracker {
  constructor(
    private id: string,
    private name: string,
    private channel: vscode.OutputChannel,
  ) {}

  log(logLevel: string, message: any): void {
    message.id = this.id;
    message.name = this.name;
    this.channel.appendLine(
      `${new Date().toISOString()} [${logLevel}] ${JSON.stringify(message)}`,
    );
  }

  onWillStartSession(): void {
    this.log('debug', { message: 'DAP session about to be started' });
  }

  onWillStopSession(): void {
    this.log('debug', { message: 'DAP session about to be stopped' });
  }

  onWillReceiveMessage(message: any): void {
    this.log('debug', {
      message: 'DAP message will be received from the editor',
      dapMessage: message,
    });
  }

  onDidSendMessage(message: any): void {
    this.log('debug', {
      message: 'DAP message has been sent to the editor',
      dapMessage: message,
    });
  }

  onExit(code: number | undefined, signal: string | undefined): void {
    const message = { message: 'DAP exited', code: code, signal: signal };
    if (code === 0) {
      this.log('debug', message);
    } else {
      this.log('error', message);
    }
  }

  onError(error: Error): void {
    this.log('error', {
      message: 'DAP error occurred',
      dapMessage: { error: String(error) },
    });
  }
}

export function setupDebugging(ctx: vscode.ExtensionContext) {
  if (!getExtensionSetting<boolean>('enableBuildDebugging')) {
    return;
  }

  let channel = vscode.window.createOutputChannel('Dockerfile Debug', 'log');

  ctx.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider(
      'dockerfile',
      new DockerfileConfigurationProvider(),
    ),
  );

  ctx.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory(
      'dockerfile',
      new DebugAdapterExecutableFactory(),
    ),
  );

  vscode.debug.registerDebugAdapterTrackerFactory('dockerfile', {
    createDebugAdapterTracker(
      session,
    ): vscode.ProviderResult<vscode.DebugAdapterTracker> {
      return new DockerfileDebugAdapterTracker(
        session.id,
        session.name,
        channel,
      );
    },
  });
}
