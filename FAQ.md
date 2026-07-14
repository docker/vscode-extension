# FAQ

### Where can I get help if I cannot find the answer in this FAQ?

You can search our [list of issues](https://github.com/docker/vscode-extension/issues) or the [discussions page](https://github.com/docker/vscode-extension/discussions) to see if someone else has asked about something similar. If not, feel free to open a new issue or discussion. We look forward to hearing from you!

### Why is this extension on my system? I do not remember installing it.

Please refer to [this blog post](https://www.docker.com/blog/docker-dx-extension-for-vs-code-update/) and/or [docker/vscode-extension#103](https://github.com/docker/vscode-extension/issues/103).

### Where I can learn more about the telemetry that the Docker DX extension collects?

For information regarding telemetry, please refer to [TELEMETRY.md](./TELEMETRY.md).

### Where can I find the language server logs?

The language server logs can be enabled by modifying your settings. After turning them on, you can look for "Docker Language Server" and/or "Docker Language Server" in the Output view.

```JSONC
{
    // Docker Language Server (https://github.com/docker/docker-language-server)
    "dockerLanguageClient.trace.server": "verbose",
    // Dockerfile Language Server (https://github.com/rcjsuen/dockerfile-language-server)
    "dockerfile-language-server.trace.server": "verbose"
}
```

### How can I disable warnings related to vulnerabilities in images?

To disable everything, you can set the `docker.lsp.experimental.vulnerabilityScanning` setting to `false`.

If you would like to disable specific warnings about vulnerabilities, you can opt in or out of them individually as well.

- `docker.lsp.experimental.scout.criticalHighVulnerabilities`
- `docker.lsp.experimental.scout.notPinnedDigest`
- `docker.lsp.experimental.scout.recommendedTag`
- `docker.lsp.experimental.scout.vulnerabilities`

### Why am I not seeing any code completion and editor features for Compose files?

Check your settings and make sure that the `docker.extension.enableComposeLanguageServer` setting is set to `true`. It may be set to `false`. Note that you will need to restart Visual Studio Code after changing this value for it to take effect.

1. Open the [Command Palette](https://code.visualstudio.com/api/ux-guidelines/command-palette) in Visual Studio Code and open "Preferences: Open User Settings (JSON)".
2. Set `docker.extension.enableComposeLanguageServer` to `true` by following the snippet below.

```JSONC
{
  "docker.extension.enableComposeLanguageServer": true
}
```

### I do not get a shell even though I used `exec` in my suspended Docker build while debugging.

This is a known issue if the debugger is currently suspended on an `ADD`, `COPY`, or `FROM` instruction. It can also happen at the beginning of a build if you have `stopOnEntry` set to `true`. See [docker/buildx#3469](https://github.com/docker/buildx/issues/3469) for more details. If you're encountering a similar issue but for different reasons, please open an [issue](https://github.com/docker/vscode-extension/issues) and we'll be happy to take a look.
