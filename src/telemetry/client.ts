import https from 'https';
import * as vscode from 'vscode';
import { extensionVersion } from '../extension';
import Bugsnag from '@bugsnag/js';
import { SECRETS } from '../secrets';

export const EVENT_CLIENT_HEARTBEAT = 'client_heartbeat';

const TELEMETRY_API_KEY = SECRETS.TELEMETRY_KEY;
const TELEMETRY_HOST = SECRETS.TELEMETRY_HOST;
const TELEMETRY_PATH = SECRETS.TELEMETRY_PATH;

interface TelemetryRecord {
  event: string;
  source: string;
  event_timestamp: number;
  properties: { [key: string]: boolean | number | string | object | undefined };
}

const events: TelemetryRecord[] = [];

function shouldReportToBugsnag(): boolean {
  if (!vscode.env.isTelemetryEnabled) {
    return false;
  }

  const config = vscode.workspace
    .getConfiguration('docker.lsp')
    .get('telemetry');
  return config === 'error' || config === 'all';
}

export function notifyBugsnag(err: any): void {
  if (shouldReportToBugsnag()) {
    Bugsnag.notify(err);
  }
}

export function queueTelemetryEvent(
  event: string,
  error: boolean,
  properties: { [key: string]: boolean | number | string | object | undefined },
) {
  if (
    !vscode.env.isTelemetryEnabled ||
    TELEMETRY_API_KEY === '' ||
    TELEMETRY_HOST === '' ||
    TELEMETRY_PATH === ''
  ) {
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
  properties.extension_version = extensionVersion;

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
      host: TELEMETRY_HOST,
      path: TELEMETRY_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'docker-vscode-extension',
        'x-api-key': TELEMETRY_API_KEY,
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
