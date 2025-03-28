# Docker DX

The **Docker DX (Developer Experience)** Visual Studio Code extension enhances your Visual Studio Code experience with Docker-related development by adding rich editing features and vulnerability scanning.

## Note ⚠️

> The Docker DX Visual Studio Code extension is in Beta. It is being gradually rolled out. If the extension's features are not visible, it's likely because the rollout hasn’t reached your profile yet.
>
> - To enable the extension's features manually, set `docker.extension.experimental.release.march2025` to `enabled` and restart VS Code.
> - To turn them off, set the same setting to `disabled` and restart VS Code.
>
> Encountering a bug? [Let us know](https://github.com/docker/vscode-extension/issues) so we can take a look.

## Key features

- [Dockerfile linting](https://docs.docker.com/reference/build-checks/): Get build warnings and best-practice suggestions via BuildKit and BuildX.
- [Bake](https://docs.docker.com/build/bake/) file support: Includes code completion, variable navigation, and inline suggestions for generating targets based on your Dockerfile stages.
- [Compose file](https://docs.docker.com/reference/compose-file/) outline: Easily navigate complex Compose files with an outline view in the editor.
- Image vulnerability scanning (experimental): Flags references to container images with known vulnerabilities directly within Dockerfiles.

## Requirements

The extension requires Docker Engine to be running. [Install Docker Desktop](https://www.docker.com/get-started/) on your machine and make sure the `docker` CLI is available in your system `PATH`.

Docker currently supports the following operating systems and architectures:

| Operating system | Architectures    |
| ---------------- | ---------------- |
| Windows          | `amd64`, `arm64` |
| macOS            | `amd64`, `arm64` |
| Linux            | `amd64`, `arm64` |

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

To debug the VS Code extension:

1. Clone this repository.
2. Open the folder in VS Code.
3. Create a `bin` folder at the root.
4. Download the [Docker Language Server binary](https://github.com/docker/docker-language-server) and place it in `bin/` Alternatively, follow the instructions in that repository and build a binary yourself to place in the `bin` folder.

### Debugging both the extension and language server

1. Clone the [docker/docker-language-server repository](https://github.com/docker/docker-language-server)
2. Start the language server in debug mode with the `--address :49201` argument.
3. In VS Code, update the `docker.lsp.debugServerPort` setting to `49201`. This is the default port that is used for any launch configurations saved in Git.
4. Launch the extension in debug mode. It will connect to the language server you started in debug mode instead of trying to execute a binary in `bin/`.

## Telemetry

See [TELEMETRY.md](./TELEMETRY.md) for details about what kind of telemetry we collect and how to configure your telemetry settings.
