# Docker DX

The **Docker DX (Developer Experience)** Visual Studio Code extension enhances your Visual Studio Code experience with Docker-related development by adding rich editing features and vulnerability scanning.

## Key features

- [Dockerfile linting](https://docs.docker.com/reference/build-checks/): Get build warnings and best-practice suggestions via BuildKit and BuildX.
- [Compose editing features](https://docs.docker.com/compose/): Provides contextual code completion, reference navigation, and schema descriptions in hovers.
- [Bake editing features](https://docs.docker.com/build/bake/): Includes code completion, variable navigation, and inline suggestions for generating targets based on your Dockerfile stages.
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

Any references to images with vulnerabilities are also flagged. This is an **experimental** feature and may change in the future. Refer to our [FAQ.md](./FAQ.md) to see how you can opt in or out of these warnings.

Errors are visible directly in your editor or you can look at them by opening up the Problems panel (<kbd>Ctrl+Shift+M</kbd> on Windows/Linux, <kbd>Shift+Command+M</kbd> on Mac).

![Linting a Dockerfile for build warnings and the use of vulnerable images](resources/readme/dockerfile-problems.png)

### Editing Compose files

Code completion support in the Docker DX extension goes beyond just the Compose schema. The Docker DX extension understands the contextual link between your Compose file and your Dockerfile.

![Editing a Compose file with code completion suggestions inferred from another file](resources/readme/docker-compose-code-completion.png)

Compose files can get pretty big and complicated when you start including other files. Docker DX lets you hover over a reference to quickly see how something is defined.

![Hover over object references to see its YAML content](resources/readme/docker-compose-hover.png)

### Editing Bake files

You can get code completion when editing your `docker-bake.hcl` file. You are also able to hover over variables and navigate around the file by jumping to a variable's definition or jumping to the build stage within a Dockerfile.

![Editing a Bake file with code completion and cross-file linking support](resources/readme/docker-bake-editing.png)

The extension provides inline suggestions to generate a Bake target to correspond to each build stage in your Dockerfile.

![Suggesting Bake targets based on the content of the local Dockerfile](resources/readme/docker-bake-inline-completion.png)

### Build Debugging (EXPERIMENTAL)

This feature is under active development and requires version `v0.26.1` of `docker buildx` or newer. This is disabled by default. Open [DEBUGGING.md](./DEBUGGING.md) to learn more about this feature in Visual Studio Code and how to enable it.

For information about Buildx and the Debug Adapter Protocol, go [here](https://github.com/docker/buildx/blob/master/docs/dap.md). If you have any bugs, feature requests, or feedback about Buildx's support for Debug Adapter Protocol, please report them [here](https://github.com/docker/buildx/issues/new/choose).

## Builds

[GitHub Actions](https://github.com/docker/vscode-extension/actions) builds eight `.vsix` files - one for each platform combination (Windows, macOS, Linux, Alpine Linux x `amd64`/`arm64`).

Note: The language server binary from these builds are not signed and/or notarized. You may encounter issues when using `.vsix` files from this repository as your operating system may refuse to open an unsigned binary.

## Development

To develop this extension, you should first make sure you have the following extensions installed:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [TypeScript + Webpack Problem Matchers](https://marketplace.visualstudio.com/items?itemName=amodio.tsl-problem-matcher)

To debug the VS Code extension, clone this repository and then run `npm install`. This will download a binary of the [Docker Language Server](https://github.com/docker/docker-language-server/releases) to the `bin` folder. If you would like to test your own custom build of the language server, simply replace the file in the `bin` folder with your own binary.

### Debugging both the extension and language server

1. Clone the [docker/docker-language-server repository](https://github.com/docker/docker-language-server)
2. Start the language server in debug mode with the `--address :49201` argument.
3. In VS Code, update the `docker.lsp.debugServerPort` setting to `49201`. This is the default port that is used for any launch configurations saved in Git.
4. Launch the extension in debug mode. It will connect to the language server you started in debug mode instead of trying to execute a binary in `bin/`.

### Testing

Run `npm test` to launch the UI tests.

### Releasing

Follow the following steps to create a new release of the Docker DX Visual Studio Code extension:

1. Run the "[prepare release](https://github.com/docker/vscode-extension/actions/workflows/prepare-release.yml)" workflow with the desired bump in semantic versioning. This workflow will update `CHANGELOG.md`, `package.json`, and `package-lock.json` and create a pull request with the three files.
2. Review the generated [pull request](https://github.com/docker/vscode-extension/pulls). Note that this pull request will not trigger a full build. It _will_ trigger linting and validation checks though.
   1. The pull request's description will describe the changes to the three files. Verify that the changes make sense.
   2. If the changes look good and the checks have passed, approve the pull request and merge it manually.
3. Now that the pull request has been merged into the `main` branch, a build named "Build: Automatic" will be triggered. Wait for the automated build from the "[build](https://github.com/docker/vscode-extension/actions/workflows/build.yml)" workflow to complete.
4. If the build has completed successfully, use the "Run workflow" button to manually trigger the "[build](https://github.com/docker/vscode-extension/actions/workflows/build.yml)" workflow.
5. This manually triggered workflow named "Build: Release" will run the tests, create the release, build the binaries, and attach the binaries to the release.
6. When the workflow has completed, open the [releases](https://github.com/docker/vscode-extension/releases) page. It should have been automatically generated by the workflow and the resulting VSIX files should be attached to the release.

## Telemetry

The Docker DX extension collects telemetry. We collect this telemetry so that we can improve the extension by understanding usage patterns and catching crashes and errors for diagnostic purposes. Note that if you have already opted out of sending telemetry in Visual Studio Code then no telemetry will be sent.

See [TELEMETRY.md](./TELEMETRY.md) for details about what kind of telemetry we collect and how to configure your telemetry settings.

## FAQ

Please refer to [FAQ.md](./FAQ.md) for our list of frequently asked questions.

## License

[Apache License Version 2.0](./LICENSE)
