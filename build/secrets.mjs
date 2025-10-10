import * as fs from 'fs';
const content = `export const SECRETS = {
  // explicitly create a String to workaround TS2367
  TELEMETRY_HOST: String('${process.env.TELEMETRY_HOST === undefined ? '' : process.env.TELEMETRY_HOST}'),
  TELEMETRY_PATH: String('${process.env.TELEMETRY_PATH === undefined ? '' : process.env.TELEMETRY_PATH}'),
  TELEMETRY_KEY: String('${process.env.TELEMETRY_KEY === undefined ? '' : process.env.TELEMETRY_KEY}'),
  BUGSNAG_API_KEY: String('${process.env.BUGSNAG_API_KEY === undefined ? '' : process.env.BUGSNAG_API_KEY}'),
} as const;
`;
fs.writeFileSync('src/secrets.ts', content);
