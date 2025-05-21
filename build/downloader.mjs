import * as fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fileFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

async function downloadFile(url, dest) {
  console.info(`Downloading ${url}...`);
  console.info(`Saving to ${dest}...`);
  try {
    const buffer = await fileFromUrl(url);
    fs.writeFileSync(dest, buffer);
  } catch (error) {
    console.error(`Error downloading file: ${error.message}`);
    process.exit(1);
  }
}

async function run(directory, url, file) {
  const cwd = path.resolve(__dirname);
  const buildDir = path.basename(cwd);
  const repoDir = cwd.replace(buildDir, '');
  const installPath = path.join(repoDir, directory);

  if (fs.existsSync(installPath)) {
    if (process.env.downloader_log === 'true') {
      console.info(`Target folder path exists at ${installPath}. Removing`);
    }
    fs.rmSync(installPath, { recursive: true });
  }

  fs.mkdirSync(installPath);

  await downloadFile(url, path.join(installPath, file));
}

async function downloadSyntaxesFile() {
  const hclSyntaxFile = `hcl.tmGrammar.json`;
  const url = `https://github.com/hashicorp/syntax/releases/download/v0.7.1/${hclSyntaxFile}`;
  run('syntaxes', url, hclSyntaxFile);
}

function getPlatform() {
  const platform =
    process.env['NODE_OS'] === undefined
      ? process.platform
      : process.env['NODE_OS'];
  if (platform === 'win32') {
    return 'windows';
  }
  return platform === 'alpine' ? 'linux' : platform;
}

function getArch() {
  const arch =
    process.env['NODE_ARCH'] === undefined
      ? process.arch
      : process.env['NODE_ARCH'];
  return arch === 'x64' ? 'amd64' : 'arm64';
}

async function downloadLanguageServerBinary() {
  if (process.arch !== 'x64' && process.arch !== 'arm64') {
    console.error(
      `No language server binary can be found for the ${process.arch} architecture.`,
    );
    process.exit(1);
  }

  const platform = getPlatform();
  const arch = getArch();
  const suffix = platform === 'windows' ? '.exe' : '';
  const version = '0.4.1';
  const binaryFile = `docker-language-server-${platform}-${arch}-v${version}${suffix}`;
  const targetFile = `docker-language-server-${platform}-${arch}${suffix}`;
  const url = `https://github.com/docker/docker-language-server/releases/download/v${version}/${binaryFile}`;
  await run('bin', url, targetFile);
  fs.chmodSync(`bin/${targetFile}`, 0o755);
}

downloadSyntaxesFile();
downloadLanguageServerBinary();
