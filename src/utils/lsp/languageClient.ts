import * as vscode from 'vscode';
import {
  LanguageClient,
  InitializeParams,
  ErrorHandler,
  Message,
  ErrorHandlerResult,
  CloseHandlerResult,
} from 'vscode-languageclient/node';
import { BakeBuildCommandId } from '../../extension';
import { getTelemetryValue } from './lsp';
import { queueTelemetryEvent } from '../../telemetry/client';

export class DockerLanguageClient extends LanguageClient {
  protected fillInitializeParams(params: InitializeParams): void {
    super.fillInitializeParams(params);
    const dockerConfiguration = vscode.workspace.getConfiguration('docker.lsp');
    params.initializationOptions = {
      telemetry: getTelemetryValue(dockerConfiguration.get('telemetry')),
    };
    params.capabilities.experimental = {
      dockerLanguageServerCapabilities: {
        clientInfoExtras: {
          client_name: 'vscode',
          client_session: vscode.env.sessionId,
        },
        commands: [BakeBuildCommandId],
      },
    };
  }

  public error(
    message: string,
    data?: any,
    showNotification?: boolean | 'force',
  ): void {
    queueTelemetryEvent('client_heartbeat', true, {
      error_function: 'DockerLanguageClient.error',
      show_notification: showNotification,
    });
    return super.error(message, data, showNotification);
  }

  public createDefaultErrorHandler(maxRestartCount?: number): ErrorHandler {
    const handler = super.createDefaultErrorHandler(maxRestartCount);
    return {
      error(
        error: Error,
        message: Message | undefined,
        count: number | undefined,
      ): ErrorHandlerResult | Promise<ErrorHandlerResult> {
        const result: any = handler.error(error, message, count);
        if (result.action !== undefined) {
          queueTelemetryEvent('client_heartbeat', true, {
            error_function: 'ErrorHandler.error',
            count: count,
            action: result.action,
          });
        }
        return result;
      },

      closed(): CloseHandlerResult | Promise<CloseHandlerResult> {
        const result: any = handler.closed();
        if (result.action !== undefined) {
          queueTelemetryEvent('client_heartbeat', true, {
            error_function: 'ErrorHandler.closed',
            action: result.action,
          });
        }
        return result;
      },
    };
  }
}
