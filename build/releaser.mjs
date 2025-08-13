import * as fs from 'fs';
import * as readline from 'readline';

const changelogPath = 'CHANGELOG.md';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    `Usage: node releaser.mjs <update-changelog|generate-release-notes> [args...]`,
  );
  process.exit(1);
}

const command = args[0].toLowerCase();

if (command === 'update-changelog') {
  if (args.length < 2) {
    console.error(`Usage: node releaser.js update-changelog <version>`);
    process.exit(1);
  }

  const version = args[1];
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`Error: version must be in format x.y.z (e.g., 1.2.3)`);
    process.exit(1);
  }

  updateChangelog(changelogPath, changelogPath, version)
    .then(() =>
      console.log(`Successfully updated CHANGELOG.md with version ${version}`),
    )
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
} else if (command === 'generate-release-notes') {
  generateReleaseNotes(changelogPath)
    .then((content) => console.log(content))
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
} else {
  console.error(
    `Error: unknown command '${command}'. Use 'update-changelog' or 'generate-release-notes'`,
  );
  process.exit(1);
}

function readFileLines(filePath) {
  return new Promise((resolve, reject) => {
    const lines = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => lines.push(line));
    rl.on('close', () => resolve(lines));
    rl.on('error', reject);
  });
}

async function updateChangelog(inputPath, outputPath, newVersion) {
  const lines = await readFileLines(inputPath);

  let unreleasedIndex = -1;
  let nextVersionIndex = -1;
  let linksStartIndex = -1;
  let previousVersion = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('## [Unreleased]')) {
      unreleasedIndex = i;
    } else if (
      nextVersionIndex === -1 &&
      unreleasedIndex !== -1 &&
      line.startsWith('## [') &&
      !line.includes('Unreleased')
    ) {
      nextVersionIndex = i;
      const match = line.match(/^## \[([0-9]+\.[0-9]+\.[0-9]+)\]/);
      if (match) {
        previousVersion = match[1];
      }
    } else if (
      linksStartIndex === -1 &&
      line.startsWith('[') &&
      line.includes(']: https://github.com/')
    ) {
      linksStartIndex = i;
      break;
    }
  }

  if (unreleasedIndex === -1) {
    throw new Error("could not find 'Unreleased' section in changelog");
  }
  if (nextVersionIndex === -1 || !previousVersion) {
    throw new Error(
      "could not find previous version section after 'Unreleased'",
    );
  }
  if (linksStartIndex === -1) {
    throw new Error('could not find links section in changelog');
  }

  const today = new Date().toISOString().split('T')[0];

  lines[unreleasedIndex] = `## [${newVersion}] - ${today}`;

  const updatedLinks = updateLinks(
    lines.slice(linksStartIndex),
    newVersion,
    previousVersion,
  );
  const updatedContent = lines.slice(0, linksStartIndex).concat(updatedLinks);

  await fs.promises.writeFile(outputPath, updatedContent.join('\n') + '\n');
}

function updateLinks(linkLines, newVersion, previousVersion) {
  // first link unreleased, second link with the new tag
  const newLinks = [
    `[Unreleased]: https://github.com/docker/docker-language-server/compare/v${newVersion}...main`,
    `[${newVersion}]: https://github.com/docker/docker-language-server/compare/v${previousVersion}...v${newVersion}`,
  ];

  // all other links can be from the original, after skipping the first one
  for (let i = 1; i < linkLines.length; i++) {
    newLinks.push(linkLines[i]);
  }

  return newLinks;
}

async function generateReleaseNotes(filePath) {
  const lines = await readFileLines(filePath);

  let firstHeader = -1,
    secondHeader = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      if (firstHeader === -1) {
        firstHeader = i;
      } else if (secondHeader === -1) {
        secondHeader = i;
        break;
      }
    }
  }

  if (secondHeader === -1) {
    throw new Error('could not find two ## headers in the changelog');
  }

  // remove leading and trailing empty newlines
  const content = lines.slice(firstHeader + 1, secondHeader);
  while (content.length > 0 && content[0].trim() === '') {
    content.shift();
  }
  while (content.length > 0 && content[content.length - 1].trim() === '') {
    content.pop();
  }

  return content.join('\n');
}
