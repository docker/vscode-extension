# Docker Extras for Visual Studio Code README

Refer to our [VS Code Notion page](https://www.notion.so/dockerinc/VS-Code-fbc8ffddb0124975afe121762f8e9044) for details about this extension.

![Docker extension overview](resources/readme/2024-11-20-scout-popup.gif)

## Running the Extension Extension

### Requirements

- a Docker Engine (or Docker Desktop) should be running
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) Visual Studio Code extension (this is technically _not_ an explicit _hard_ requirement but we expect our users to have this installed so we want this installed to understand the user experience of having both installed)
- [TypeScript + Webpack Problem Matchers](https://marketplace.visualstudio.com/items?itemName=amodio.tsl-problem-matcher) Visual Studio Code extension

### Instructions

1. Clone this repository.
2. Run `npm install` to install the necessary dependencies.
3. Launch the "Run Extension" task from within VS Code.
4. If Docker is not running then the LSP `LanguageClient` will likely crash.
