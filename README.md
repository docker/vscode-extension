# Docker DX

The **Docker DX (Developer Experience)** Visual Studio Code extension enhances your Visual Studio Code experience with Docker-related development by adding rich editing features and vulnerability scanning.

## Key features

- [Dockerfile linting](https://docs.docker.com/reference/build-checks/): Get build warnings and best-practice suggestions via BuildKit and BuildX.
- [Bake](https://docs.docker.com/build/bake/) file support: Includes code completion, variable navigation, and inline suggestions for generating targets based on your Dockerfile stages.
- [Compose file](https://docs.docker.com/reference/compose-file/) outline: Easily navigate complex Compose files with an outline view in the editor.
- Image vulnerability scanning (experimental): Flags references to container images with known vulnerabilities directly within Dockerfiles.

## Requirements

The extension requires Docker Engine to be running. [Install Docker Desktop](https://www.docker.com/get-started/) on your machine and make sure the `docker` CLI is available in your system `PATH`.

This extension currently supports the following operating systems and architectures:

| Operating system | Architectures    |
| ---------------- | ---------------- |
| Windows          | `amd64`, `arm64` |
| macOS            | `amd64`, `arm64` |
| Linux            | `amd64`, `arm64` |
| Alpine           | `amd64`, `arm64` |

If you are on an unsupported system, let us know of your interest in this extension so we can prioritize the work accordingly.

## Feature overview

### Editing Dockerfiles

You can get linting checks from [BuildKit](https://github.com/moby/buildkit) and [BuildX](https://github.com/docker/buildx) when editing your Dockerfiles.

Any references to images with vulnerabilities are also flagged. Note: This is an experimental feature.

Errors are visible directly in your editor or you can look at them by opening up the Problems panel (<kbd>Ctrl+Shift+M</kbd> on Windows/Linux, <kbd>Shift+Command+M</kbd> on Mac).

![Linting a Dockerfile for build warnings and the use of vulnerable images](resources/readme/dockerfile-problems.png)

### Editing Bake files

You can get code completion when editing your `docker-bake.hcl` file. You are also able to hover over variables and navigate around the file by jumping to a variable's definition or jumping to the build stage within a Dockerfile.

![Editing a Bake file with code completion and cross-file linking support](resources/readme/docker-bake-editing.png)

The extension provides inline suggestions to generate a Bake target to correspond to each build stage in your Dockerfile.

![Suggesting Bake targets based on the content of the local Dockerfile](resources/readme/docker-bake-inline-completion.png)

### Editing Compose files

You can view an outline of your Compose file which makes it easier to navigate.

![Outline of a Docker Compose file in the Outline panel and from the Command Palette](resources/readme/docker-compose-outline.png)

## Builds

[GitHub Actions](https://github.com/docker/vscode-extension/actions) builds six `.vsix` files - one for each platform combination(Windows, macOS, Linux x `amd64`/`arm64`).

Note: The language server binary from these builds are not signed and/or notarized. You may encounter issues when using `.vsix` files from this repository as your operating system may refuse to open an unsigned binary.

## Development

To debug the VS Code extension, clone this repository and then run `npm install`. This will download a binary of the [Docker Language Server](https://github.com/docker/docker-language-server/releases) to the `bin` folder. If you would like to test your own custom build of the language server, simply replace the file in the `bin` folder with your own binary.

### Debugging both the extension and language server

1. Clone the [docker/docker-language-server repository](https://github.com/docker/docker-language-server)
2. Start the language server in debug mode with the `--address :49201` argument.
3. In VS Code, update the `docker.lsp.debugServerPort` setting to `49201`. This is the default port that is used for any launch configurations saved in Git.
4. Launch the extension in debug mode. It will connect to the language server you started in debug mode instead of trying to execute a binary in `bin/`.

### Testing

Run `npm test` to launch the UI tests.

## Telemetry

The Docker DX extension collects telemetry. We collect this telemetry so that we can improve the extension by understanding usage patterns and catching crashes and errors for diagnostic purposes. Note that if you have already opted out of sending telemetry in Visual Studio Code then no telemetry will be sent.

See [TELEMETRY.md](./TELEMETRY.md) for details about what kind of telemetry we collect and how to configure your telemetry settings.

## FAQ

> **I can see duplicated code completion suggestions and/or hover tooltips in Compose files.**

Do you have any of the following extensions installed?
- [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) (powered by [redhat-developer/yaml-language-server](https://github.com/redhat-developer/yaml-language-server))
    1. To disable duplicates from this extension, create a JSON file with `{}` as its content and save it somewhere. Let's say it is at `/home/user/empty.json`.
    2. Open the [Command Palette](https://code.visualstudio.com/api/ux-guidelines/command-palette) in Visual Studio Code and open "Preferences: Open User Settings (JSON)".
    3. Create an object attribute for `yaml.schemas` if it does not already exist.
    4. Inside the `yaml.schemas` object, map your empty JSON file to Compose YAML files.
```JSONC
{
  "yaml.schemas": {
    // this tells Red Hat's YAML extension to consider Compose YAML
    // files as not having a schema so it will stop suggesting code
    // completion items, hover tooltips, and so on
    "/home/user/empty.json": ["compose*y*ml*", "docker-compose*y*ml*"]
  }
}
```
- [Microsoft's Container Tools extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers) (powered by [microsoft/compose-language-service](https://github.com/microsoft/compose-language-service))
    - If [microsoft/vscode-containers#75](https://github.com/microsoft/vscode-containers/pull/75) is merged and you are on a release with this change, then the duplicates should already be taken of.
    - To disable duplicates from this extension, you can set the `containers.enableComposeLanguageService` settingto `false` and restart Visual Studio Code.
- [Microsoft's Docker extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) (powered by [microsoft/compose-language-service](https://github.com/microsoft/compose-language-service))
    - To disable duplicates from this extension, you can set the `docker.enableDockerComposeLanguageService` settingto `false` and restart Visual Studio Code.
