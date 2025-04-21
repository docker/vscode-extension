# Change Log

All notable changes to the Docker DX extension will be documented in this file.

## [0.4.10] - 2025-04-21

### Changed

- updated the included Docker Language Server from 0.3.5 to 0.3.7
  - Bake
    - textDocument/publishDiagnostics
      - consider the context attribute when determining which Dockerfile the Bake target is for ([docker/docker-language-server#57](https://github.com/docker/docker-language-server/issues/57))
    - textDocument/inlayHints
      - consider the context attribute when determining which Dockerfile to use for inlaying default values of `ARG` variables ([docker/docker-language-server#60](https://github.com/docker/docker-language-server/pull/60))
    - textDocument/completion
      - consider the context attribute when determining which Dockerfile to use for looking up build stages ([docker/docker-language-server#61](https://github.com/docker/docker-language-server/pull/61))
    - textDocument/definition
      - consider the context attribute when trying to resolve the Dockerfile to use for `ARG` variable definitions ([docker/docker-language-server#62](https://github.com/docker/docker-language-server/pull/62))
      - fix a panic that may occur if a for loop did not have a conditional expression ([docker/docker-language-server#65](https://github.com/docker/docker-language-server/pull/65))

### Fixed

- set the Docker Desktop prompt setting correctly ([#90](https://github.com/docker/vscode-extension/issues/90))

## [0.4.9] - 2025-04-15

### Fixed

- apply the Scout vulnerability setting correctly if multiple files are opened ([#82](https://github.com/docker/vscode-extension/pull/82))
- capture more error telemetry to try to understand the last few crashes ([#83](https://github.com/docker/vscode-extension/pull/83))
- make the language server binary executable before trying to start it ([#84](https://github.com/docker/vscode-extension/pull/84))

## [0.4.8] - 2025-04-14

### Added

- capture errors from the language server not being able to start

## [0.4.7] - 2025-04-11

### Fixed

- pick the user's home folder when scanning for CVEs with Scout if no workspace folder has been opened ([#76](https://github.com/docker/vscode-extension/issues/76))
- ignore incorrect scalar values in Compose files so that they stop getting incorrectly rendered in the outline ([docker/docker-language-server#50](https://github.com/docker/docker-language-server/pull/50))

## [0.4.6] - 2025-04-09

### Added

- capture some more error messages to better understand why the language server is crashing on some systems
- updated the readme so it calls out how this extension is getting installed

## [0.4.5] - 2025-04-09

### Fixed

- update the language server so that it will not crash when handling messages

## [0.4.4] - 2025-04-09

### Fixed

- include a language server fix to prevent it from crashing when opening Bake files with comments placed at the end of a line

## [0.4.3] - 2025-04-09

### Fixed

- surface errors with Docker Bake or Docker Scout to the user instead of failing silently

## [0.4.2] - 2025-04-08

### Changed

- include recognizable error messages in the telemetry data

## [0.4.1] - 2025-04-08

### Removed

- removed references to the feature flag in public-facing documentation

## [0.4.0] - 2025-04-08

### Changed

- automatically download a binary of the language server when `npm install` is run to make development a little easier

### Removed

- removed the feature flag so that the extension is live for everyone

## [0.3.0]

### Changed

- suppress duplicated errors that are reported by both the Dockerfile Language Server and the Docker Language Server ([#33](https://github.com/docker/vscode-extension/issues/33))

### Fixed

- always register the Scout command so that the gradual rollout will not prevent the command from working ([#44](https://github.com/docker/vscode-extension/issues/44))

## [0.2.0] - 2025-03-28

### Added

- Include the feature flag's value in the telemetry event ([#39](https://github.com/docker/vscode-extension/issues/39))
- Contribute a context menu item to ms-azuretools.vscode-docker to scan an image with Docker Scout ([#38](https://github.com/docker/vscode-extension/issues/38))

### Changed

- README images and `.github` folder can be excluded from VSIX ([#30](https://github.com/docker/vscode-extension/issues/30))

### Fixed

- Running "Build with Bake" without a Bakefile yields an error ([#32](https://github.com/docker/vscode-extension/issues/32))
- Has "tag recommendations available" but doesn't actually show what tags are recommended ([#34](https://github.com/docker/vscode-extension/issues/34))

## [0.1.1] - 2025-03-26

### Changed

- removed the "Beta" label from the extension's name ([#27](https://github.com/docker/vscode-extension/pull/27))

## 0.1.0 - 2025-03-26

### Added

- BuildKit and BuildX build check integrations in a Dockerfile
- image vulnerability analysis, supporting hovers and problem reporting in a Dockerfile (experimental)
- Bake support
  - works for `docker-bake.hcl` and `docker-bake.override.hcl`
  - code completion
  - code navigation
  - document links
  - inline suggestions
  - error reporting
- Compose outline support

[Unreleased]: https://github.com/docker/vscode-extension/compare/v0.4.10...main
[0.4.10]: https://github.com/docker/vscode-extension/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/docker/vscode-extension/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/docker/vscode-extension/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/docker/vscode-extension/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/docker/vscode-extension/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/docker/vscode-extension/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/docker/vscode-extension/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/docker/vscode-extension/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/docker/vscode-extension/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/docker/vscode-extension/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/docker/vscode-extension/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/docker/vscode-extension/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/docker/vscode-extension/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/docker/vscode-extension/compare/v0.1.0...v0.1.1
