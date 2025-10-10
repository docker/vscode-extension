import * as fs from 'fs';
const content = `export const SECRETS = {
  TELEMETRY_HOST: '${process.env.TELEMETRY_HOST === undefined ? '' : process.env.TELEMETRY_HOST}',
  TELEMETRY_PATH: '${process.env.TELEMETRY_PATH === undefined ? '' : process.env.TELEMETRY_PATH}',
  TELEMETRY_KEY: '${process.env.TELEMETRY_KEY === undefined ? '' : process.env.TELEMETRY_KEY}',
  BUGSNAG_API_KEY: '${process.env.BUGSNAG_API_KEY === undefined ? '' : process.env.BUGSNAG_API_KEY}',
} as const;
`;
fs.writeFileSync('src/secrets.ts', content);