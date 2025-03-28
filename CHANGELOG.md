# Change Log

All notable changes to the Docker DX extension will be documented in this file.

## Unreleased

### Added

- Include the feature flag's value in the telemetry event ([#39](https://github.com/docker/vscode-extension/issues/39))

### Changed

- README images and `.github` folder can be excluded from VSIX ([#30](https://github.com/docker/vscode-extension/issues/30))

### Fixed

- Running "Build with Bake" without a Bakefile yields an error ([#32](https://github.com/docker/vscode-extension/issues/32))

- Has "tag recommendations available" but doesn't actually show what tags are recommended ([#34](https://github.com/docker/vscode-extension/issues/34))

## 0.1.1 - 2025-03-26

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
