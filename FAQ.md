# FAQ

### Where can I get help if I cannot find the answer in this FAQ?

You can search our [list of issues](https://github.com/docker/vscode-extension/issues) or the [discussions page](https://github.com/docker/vscode-extension/discussions) to see if someone else has asked about something similar. If not, feel free to open a new issue or discussion. We look forward to hearing from you!

### Why is this extension on my system? I do not remember installing it.

Please refer to [this blog post](https://www.docker.com/blog/docker-dx-extension-for-vs-code-update/) and/or [docker/vscode-extension#103](https://github.com/docker/vscode-extension/issues/103).

### Where I can learn more about the telemetry that the Docker DX extension collects?

For information regarding telemetry, please refer to [TELEMETRY.md](./TELEMETRY.md).

### I am seeing duplicated editor features (such as code completion suggestions, hover tooltips, etc.) in Compose files.

Do you have any of the following extensions installed?

- [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
- [Microsoft's Container Tools extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
- [Microsoft's Docker extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)

If yes, you can refer to the steps below to remove the duplicates. Alternatively, if you would prefer to disable the Compose editing features that _this_ extension is providing, you can set the `docker.extension.enableComposeLanguageServer` setting to `false` and then restart Visual Studio Code.

- [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) (powered by [redhat-developer/yaml-language-server](https://github.com/redhat-developer/yaml-language-server))
  1. To disable duplicates from this extension, create a JSON file with `{}` as its content and save it somewhere. Let's say it is at `/home/user/empty.json`.
  2. Open the [Command Palette](https://code.visualstudio.com/api/ux-guidelines/command-palette) in Visual Studio Code and open "Preferences: Open User Settings (JSON)".
  3. Set `docker.extension.enableComposeLanguageServer` to `true` by following the snippet below.
  4. Create an object attribute for `yaml.schemas` if it does not already exist.
  5. Inside the `yaml.schemas` object, map your empty JSON file to Compose YAML files by following the snippet below.
  6. YAML files named `compose*y*ml` or `docker-compose*y*ml` will now no longer have the Compose schema associated with them in Red Hat's extension so Red Hat's extension will stop providing YAML features for Compose files. This admittedly is a strange way to disable YAML features for a given file but it is the only known workaround for resolving this until [redhat-developer/vscode-yaml#1088](https://github.com/redhat-developer/vscode-yaml/issues/1088) is implemented.

```JSONC
{
  // this must be explicitly set to true in your settings.json file or
  // the auto-deduplication logic will programmatically set the value to
  // false if it detects that Red Hat's YAML extension is installed
  "docker.extension.enableComposeLanguageServer": true,
  "yaml.schemas": {
    // this tells Red Hat's YAML extension to consider Compose YAML
    // files as not having a schema so it will stop suggesting code
    // completion items, hover tooltips, and so on
    "/home/user/empty.json": ["compose*y*ml", "docker-compose*y*ml"]
  }
}
```

- [Microsoft's Container Tools extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers) (powered by [microsoft/compose-language-service](https://github.com/microsoft/compose-language-service))
  - If [microsoft/vscode-containers#75](https://github.com/microsoft/vscode-containers/pull/75) is merged and you are on a release with this change, then the duplicates should already be taken of.
  - If not, you can you can set the `containers.enableComposeLanguageService` setting to `false` and restart Visual Studio Code.
- [Microsoft's Docker extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) (powered by [microsoft/compose-language-service](https://github.com/microsoft/compose-language-service))
  - If you have version 1.x installed, you can set the `docker.enableDockerComposeLanguageService` setting to `false` and restart Visual Studio Code.
  - If you have version 2.x installed, then you can refer to the steps above for Microsoft's Container Tools extension instead.
