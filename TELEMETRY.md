# Telemetry

The Docker DX extension collects telemetry. We collect this telemetry so that we can improve the extension by understanding usage patterns and catching crashes and errors for diagnostic purposes.

## Configuring Telemetry Collection

You can configue the telemetry you would like to send by changing the `docker.lsp.telemetry` setting. This can be one of three values:

- `"all"` - all telemetry will be sent
- `"error"` - send only errors and crash information
- `"off"` - stop all telemetry from being sent

If you have already opted out of sending telemetry in Visual Studio Code then no telemetry will be sent to Docker regardless of the value of the `docker.lsp.telemetry` setting.

## Telemetry Data Collected

- operating system
- CPU architecture
- application name
- `vscode.env.machineId`
- `vscode.env.sessionId`
- version of the installed extension
- Docker version
- Buildx version
- number of Buildx debug sessions that are started
- function names and parameters for diagnosing errors and crashes
- error messages when the language server is unable to start or is crashing
- if certain extensions are also installed
  - [Microsoft's Container Tools extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
  - [Microsoft's Docker extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
  - [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
- values of certain settings from this extension
  - `docker.extension.enableComposeLanguageServer`

The list above does _not_ include any telemetry collected by the [Docker Language Server](https://github.com/docker/docker-language-server). For telemetry collected by the Docker Language Server, please refer to the telemetry documentation of that project.

## BugSnag

This extension integrates with BugSnag and sends errors and stack traces to BugSnag if telemetry is configured.

## Privacy Policy

Read our [privacy policy](https://www.docker.com/legal/docker-privacy-policy/) to learn more about how the information is collected and used.
