import * as vscode from 'vscode';
import { registerCommand } from '../extension';
import { getExtensionSetting } from '../utils/settings';

export const DebugEditorContentsCommandId = 'docker.debug.editorContents';

class DebugAdapterExecutableFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    var args = ['buildx', 'dap', 'build'];
    if (session.configuration?.args) {
      args = args.concat(session.configuration?.args);
    }

    const options = {
      cwd: session.workspaceFolder?.uri.fsPath,
      env: { BUILDX_EXPERIMENTAL: '1' },
    };

    return new vscode.DebugAdapterExecutable('docker', args, options);
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
        config.name = 'Docker: Build';
        config.request = 'launch';
        config.dockerfile = editor.document.uri.fsPath;
        config.contextPath = '${workspaceFolder}';
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
    // the command is still contributed to the Command Palette because of package.json
    registerCommand(ctx, DebugEditorContentsCommandId, async () => {
      vscode.window.showErrorMessage(
        'Build Debugging for Docker is an experimental feature that is under active development. ' +
          'Enable the feature by toggling the docker.extension.enableBuildDebugging setting to true and restarting your client.',
      );
      return Promise.resolve(false);
    });

    // the debugger is still contributed and technically registered because of package.json
    ctx.subscriptions.push(
      vscode.debug.registerDebugConfigurationProvider('dockerfile', {
        resolveDebugConfiguration(): vscode.ProviderResult<vscode.DebugConfiguration> {
          vscode.window.showErrorMessage(
            'Build Debugging for Docker is an experimental feature that is under active development. ' +
              'Enable the feature by toggling the docker.extension.enableBuildDebugging setting to true and restarting your client.',
          );
          return undefined;
        },
      }),
    );
    return;
  }

  let channel = vscode.window.createOutputChannel('Docker Buildx DAP', 'log');

  registerCommand(
    ctx,
    DebugEditorContentsCommandId,
    async (resource: vscode.Uri) => {
      let targetResource = resource;
      if (!targetResource && vscode.window.activeTextEditor) {
        targetResource = vscode.window.activeTextEditor.document.uri;
      }
      if (targetResource) {
        vscode.debug.startDebugging(undefined, {
          type: 'dockerfile',
          name: 'Docker: Build',
          request: 'launch',
          dockerfile: targetResource.fsPath,
          contextPath: '${workspaceFolder}',
        });
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    },
  );

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
