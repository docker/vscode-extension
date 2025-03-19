import https from 'https';
import * as process from 'process';
import * as vscode from 'vscode';

interface TelemetryRecord {
  event: string;
  source: string;
  event_timestamp: number;
  properties: { [key: string]: boolean | number | string | undefined };
}

const events: TelemetryRecord[] = [];

export function queueTelemetryEvent(
  event: string,
  error: boolean,
  properties: { [key: string]: boolean | number | string | undefined },
) {
  if (!vscode.env.isTelemetryEnabled) {
    return;
  }

  const config = vscode.workspace
    .getConfiguration('docker.lsp')
    .get('telemetry');
  if (config === 'off') {
    return;
  }

  if (config === 'error' && !error) {
    return;
  }

  properties.os = process.platform === 'win32' ? 'windows' : process.platform;
  properties.arch = process.arch === 'x64' ? 'amd64' : process.arch;
  properties.app_host = vscode.env.appHost;
  properties.app_name = vscode.env.appName;
  properties.client_name = 'vscode';
  properties.machine_id = vscode.env.machineId;
  properties.client_session = vscode.env.sessionId;

  events.push({
    event,
    event_timestamp: Date.now(),
    properties,
    source: 'editor_integration',
  });
}

export function publishTelemetry(): void {
  setTimeout(publishTelemetry, 30000);
  const records = events.splice(0, 500);
  if (records.length === 0) {
    return;
  }

  const request = https.request(
    {
      host: 'api.docker.com',
      path: '/events/v1/track',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'docker-vscode-extension',
        'x-api-key': 'eIxc3dSmud2vuJRKiq9hJ6wORVWfoLxp1nqb4qXz',
      },
    },
    (response) => {
      response.on('data', () => {});
      response.on('end', () => {});
    },
  );
  request.write(JSON.stringify({ records }));
  request.end();
}
