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

function getExtensionInfo() {
    const cwd = path.resolve(__dirname);
    const buildDir = path.basename(cwd);
    const repoDir = cwd.replace(buildDir, '');
    const pjson = JSON.parse(fs.readFileSync(path.join(repoDir, 'package.json')));
    return {
        syntaxVersion: pjson.syntax.hcl.version,
    };
}

async function downloadFile(url, dest) {
    console.info(`Downloading ${url}...`);
    console.info(`Saving to ${dest}...`);
    try {
        const buffer = await fileFromUrl(url);
        fs.writeFileSync(dest, buffer);
    } catch (error) {
        console.error(`Error downloading file: ${error.message}`);
    }
}

async function run() {
    const info = getExtensionInfo();
    const release = `v${info.syntaxVersion}`;

    const cwd = path.resolve(__dirname);
    const buildDir = path.basename(cwd);
    const repoDir = cwd.replace(buildDir, '');
    const installPath = path.join(repoDir, 'syntaxes');

    if (fs.existsSync(installPath)) {
        if (process.env.downloader_log === 'true') {
            console.info(`Syntax path exists at ${installPath}. Removing`);
        }
        fs.rmSync(installPath, { recursive: true });
    }

    fs.mkdirSync(installPath);

    const hclSyntaxFile = `hcl.tmGrammar.json`;
    const url = `https://github.com/hashicorp/syntax/releases/download/${release}/${hclSyntaxFile}`;
    await downloadFile(url, path.join(installPath, hclSyntaxFile));
}

run();