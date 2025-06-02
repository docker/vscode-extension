import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as process from 'process';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  RevealOutputChannelOn,
  StreamInfo,
} from 'vscode-languageclient/node';
import { DockerLanguageClient } from './languageClient';
import { InlineCompletionItemFeature } from 'vscode-languageclient/lib/common/inlineCompletion';
import {
  EVENT_CLIENT_HEARTBEAT,
  queueTelemetryEvent,
} from '../../telemetry/client';

let nativeClient: LanguageClient;

export const getNativeClient = () => nativeClient;

function isSupported(): boolean {
  if (process.arch === 'x64' || process.arch === 'arm64') {
    switch (process.platform) {
      case 'win32':
      case 'linux':
      case 'darwin':
        return true;
    }
  }
  return false;
}

function getBinaryPath(ctx: vscode.ExtensionContext): string | null {
  if (!isSupported()) {
    return null;
  }

  // Windows Intel/AMD 64-bit binary would be named docker-language-server-windows-amd64.exe
  const platform = process.platform === 'win32' ? 'windows' : process.platform;
  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
  const extension = process.platform === 'win32' ? '.exe' : '';
  return path.join(
    ctx.extensionPath,
    'bin',
    `docker-language-server-${platform}-${arch}${extension}`,
  );
}

async function checkForDebugLspServer(): Promise<number | null> {
  const lspConfig = vscode.workspace.getConfiguration('docker.lsp');
  const port = lspConfig.get<number>('debugServerPort');
  if (port === undefined || port === null || port <= 0) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const socket = net.connect({ port: port });
      socket.on('connect', () => {
        resolve(port);
        socket.destroy();
      });
      socket.on('error', () => {
        resolve(null);
      });
    } catch (error) {
      resolve(null);
    }
  });
}

async function getServerOptions(
  ctx: vscode.ExtensionContext,
): Promise<ServerOptions | null> {
  const port = await checkForDebugLspServer();
  if (port !== null) {
    return () => {
      // alter the port here to point to the locally launched instance of the language server
      const socket = net.connect({ port: Number(port) });
      const result: StreamInfo = {
        writer: socket,
        reader: socket,
      };
      return Promise.resolve(result);
    };
  }

  const binaryPath = getBinaryPath(ctx);
  if (binaryPath !== null) {
    await chmod(binaryPath);
    return {
      command: binaryPath,
      transport: TransportKind.stdio,
      args: ['start'],
    };
  }
  return null;
}

async function chmod(binaryPath: string): Promise<void> {
  return new Promise<void>((resolve) => {
    fs.access(binaryPath, fs.constants.X_OK, (accessErr) => {
      if (accessErr !== null) {
        fs.chmod(binaryPath, 0o755, (chmodErr) => {
          if (chmodErr !== null) {
            queueTelemetryEvent(EVENT_CLIENT_HEARTBEAT, true, {
              error_function: 'chmod',
              code: chmodErr.code,
              errno: chmodErr.errno,
            });
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * Returns the telemetry setting that should be used for the extension and the Docker Language Server.
 * If the user has telemetry disabled then "off" regardless of what the Docker telemetry setting has been set to.
 */
export function getTelemetryValue(
  configurationValue: string | undefined,
): 'all' | 'error' | 'off' {
  if (!vscode.env.isTelemetryEnabled) {
    return 'off';
  }

  switch (configurationValue) {
    case 'all':
    case 'error':
    case 'off':
      return configurationValue;
  }
  return 'all';
}

async function createNative(ctx: vscode.ExtensionContext): Promise<boolean> {
  const clientOptions: LanguageClientOptions = {
    progressOnInitialization: true,
    outputChannel: vscode.window.createOutputChannel('Docker Language Server'),
    revealOutputChannelOn: RevealOutputChannelOn.Never,
    markdown: {
      isTrusted: false,
      supportHtml: true,
    },
    middleware: {
      workspace: {
        configuration: (params, token, next) => {
          const result = next(params, token) as any[];
          return result.map((value) => {
            value.telemetry = getTelemetryValue(value.telemetry);
            return value;
          });
        },
      },
    },
  };

  clientOptions.documentSelector = [
    { scheme: 'file', language: 'dockerfile' },
    { scheme: 'file', language: 'dockerbake' },
    { scheme: 'file', language: 'dockercompose' },
  ];

  const serverOptions = await getServerOptions(ctx);
  if (serverOptions === null) {
    return false;
  }

  nativeClient = new DockerLanguageClient(
    'dockerLanguageClient',
    'Docker Language Server',
    serverOptions,
    clientOptions,
  );
  nativeClient.registerFeature(new InlineCompletionItemFeature(nativeClient));
  return true;
}

export async function activateDockerNativeLanguageClient(
  ctx: vscode.ExtensionContext,
): Promise<boolean> {
  if (await createNative(ctx)) {
    ctx.subscriptions.push(nativeClient);
    return true;
  }
  return false;
}
