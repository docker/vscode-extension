# Change Log

All notable changes to the Docker DX extension will be documented in this file.

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

[Unreleased]: https://github.com/docker/vscode-extension/compare/v0.4.1...main
[0.4.1]: https://github.com/docker/vscode-extension/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/docker/vscode-extension/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/docker/vscode-extension/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/docker/vscode-extension/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/docker/vscode-extension/compare/v0.1.0...v0.1.1
