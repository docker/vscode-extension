# Change Log

All notable changes to the Docker DX extension will be documented in this file.

## [0.18.0] - 2025-10-15

### Added

- introduced a new `cwd` debug configuration attribute so that the working directory used to launch the debug adapter can be set ([#210](https://github.com/docker/vscode-extension/issues/210))
- record the system's version of Buildx in the telemetry ([#218](https://github.com/docker/vscode-extension/issues/218))
- record telemetry when any Buildx debug session is started ([#226](https://github.com/docker/vscode-extension/issues/226))
- Compose
  - update schema to the latest version

### Changed

- the extension's telemetry is now controlled by environment variables and by default will not be collected during local development and locally built VSIX files as those environment variables would be undefined locally ([#220](https://github.com/docker/vscode-extension/issues/220))
  - note that the language server is a binary that is downloaded and included in the VSIX file at build-time so its behaviour is unaffected by this change

### Fixed

- correct the description to state that the `dockerfile` debug attribute has to be relative to the working directory ([#210](https://github.com/docker/vscode-extension/issues/210))
- Bake
  - correct the schema for the `output` attribute of the `target` block so that the list can also contain objects instead of only strings ([docker/docker-language-server#77](https://github.com/docker/docker-language-server/issues/77))

### Removed

- removed the "Build with Debugger" command (`docker.debug.editorContents`) as it is no longer necessary now that launch configurations have been implemented

## [0.17.0] - 2025-09-17

### Added

- Dockerfile
  - textDocument/codeAction
    - `InvalidBaseImagePlatform` warnings can now be ignored with a code action ([docker/docker-language-server#464](https://github.com/docker/docker-language-server/issues/464))
- Bake
  - textDocument/publishDiagnostics
    - flag `annotations` in a `target` block without an equals sign as an error ([docker/docker-language-server#99](https://github.com/docker/docker-language-server/issues/99))

### Fixed

- Dockerfile
  - textDocument/inlayHint
    - handle inlay hints asynchronously so that it does not block other LSP messages when trying to fetch image data ([docker/docker-language-server#467](https://github.com/docker/docker-language-server/issues/467))
- Compose
  - textDocument/documentLink
    - return document links for files referenced in the short-form `volumes` attribute of a service object ([docker/docker-language-server#460](https://github.com/docker/docker-language-server/issues/460))
    - return document links for files referenced in the long-form `volumes` attribute of a service object that has a bind mount ([docker/docker-language-server#462](https://github.com/docker/docker-language-server/issues/462))

### Removed

- the experimental `docker.extension.enableBuildDebugging` setting has been removed and the build debugging features are now enabled by default

## [0.16.0] - 2025-08-26

### Added

- Dockerfile
  - textDocument/inlayHint
    - show when an image was last pushed ([docker/docker-language-server#431](https://github.com/docker/docker-language-server/issues/431))
- Compose
  - textDocument/completion
    - suggest image tags for images from Docker Hub ([docker/docker-language-server#375](https://github.com/docker/docker-language-server/issues/375))
  - textDocument/definition
    - support jumping to service references in the `volumes_from` attribute of a service object ([#452](https://github.com/docker/docker-language-server/issues/452))
  - textDocument/documentHighlight
    - support highlighting service references in the `volumes_from` attribute of a service object ([#452](https://github.com/docker/docker-language-server/issues/452))
  - textDocument/documentLink
    - support providing links for the `env_file` attribute of a service object ([docker/docker-language-server#436](https://github.com/docker/docker-language-server/issues/436))
    - support providing links for the `env_file` for included paths ([docker/docker-language-server#438](https://github.com/docker/docker-language-server/issues/438))
  - textDocument/prepareRename
    - support preparing renames for services in the `volumes_from` attribute of a service object ([#452](https://github.com/docker/docker-language-server/issues/452))
  - textDocument/rename
    - support renaming service referencesin the `volumes_from` attribute of a service object ([#452](https://github.com/docker/docker-language-server/issues/452))
- Bake
  - textDocument/completion
    - provide local file and folder name suggestions ([docker/docker-language-server#414](https://github.com/docker/docker-language-server/issues/414))
      - `context` attribute in a `target` block
      - `contexts` attribute in a `target` block
      - `dockerfile` attribute in a `target` block

### Fixed

- Dockerfile
  - textDocument/hover
    - ignore 4XX errors when hovering over images with a non-standard tag ([docker/docker-language-server#371](https://github.com/docker/docker-language-server/issues/371))
- Compose
  - textDocument/completion
    - correct file system suggestions if an absolute path is used ([docker/docker-language-server#443](https://github.com/docker/docker-language-server/issues/443))
  - textDocument/documentHighlight
    - prevent file and folder bind mounts from returning results as they are not valid volume object references ([#450](https://github.com/docker/docker-language-server/issues/450))
  - textDocument/documentLink
    - stop returning links for alias nodes in included paths ([docker/docker-language-server#439](https://github.com/docker/docker-language-server/issues/439))
  - textDocument/prepareRename
    - prevent file and folder bind mounts from returning results as they are not valid volume object references ([#450](https://github.com/docker/docker-language-server/issues/450))
  - textDocument/rename
    - prevent file and folder bind mounts from returning results as they are not valid volume object references ([#450](https://github.com/docker/docker-language-server/issues/450))
- Bake
  - textDocument/completion
    - check the type of the block before suggesting items ([docker/docker-language-server#422](https://github.com/docker/docker-language-server/issues/422))

## [0.15.0] - 2025-08-13

### Added

- added a language configuration for the `dockerbake` language to improve the editing experience ([#184](https://github.com/docker/vscode-extension/issues/184))
- Compose
  - updated Compose schema to the latest version

### Fixed

- Bake
  - textDocument/hover
    - fix error when hovering inside a comment ([docker/docker-language-server#410](https://github.com/docker/docker-language-server/issues/410))

## [0.14.0] - 2025-08-06

### Added

- Compose
  - textDocument/completion
    - provide local file and folder name suggestions when modifying simple strings
      - service volumes ([docker/docker-language-server#376](https://github.com/docker/docker-language-server/issues/376))
      - `context` attribute of a `build` object of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `dockerfile` attribute of a `build` object of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `file` attribute of a `credential_spec` object of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `env_file` of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `path` attribute of an `env_file` array item of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `file` attribute of an `extends` object of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `label_file` of a service ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `file` attribute of a config ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `file` attribute of a secret ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - string items of include objects ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `env_file` attribute of include objects ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))
      - `path` attribute of include objects ([docker/docker-language-server#403](https://github.com/docker/docker-language-server/issues/403))

### Fixed

- fix Dockerfile Language Server crash with tabbed heredoc delimiters ([#171](https://github.com/docker/vscode-extension/issues/171))
- fix Buildx debugger integration so that it works on Windows ([#181](https://github.com/docker/vscode-extension/issues/181))
- allow switching the builder used for debug sessions ([#183](https://github.com/docker/vscode-extension/pull/183))
- Compose
  - textDocument/completion
    - fix build stage lookups for files in a folder under the `\\wsl$` host ([docker/docker-language-server#382](https://github.com/docker/docker-language-server/issues/382))
  - textDocument/documentLink
    - improve handling of malformed image attribute values with registry prefixes ([docker/docker-language-server#369](https://github.com/docker/docker-language-server/issues/369))
    - convert links properly if a WSL URI with a dollar sign is used ([docker/docker-language-server#366](https://github.com/docker/docker-language-server/issues/366))
- Bake
  - textDocument/codeLens
    - refactor the URI handling code so it will accept a WSL URI with a dollar sign ([docker/docker-language-server#388](https://github.com/docker/docker-language-server/issues/388))
  - textDocument/completion
    - fix build stage and ARG name inference completion items for files in a folder under the `\\wsl$` host ([docker/docker-language-server#396](https://github.com/docker/docker-language-server/issues/396))
  - textDocument/definition
    - handle WSL URIs with a dollar sign properly to fix build stage lookups on those hosts ([docker/docker-language-server#390](https://github.com/docker/docker-language-server/issues/390))
    - handle WSL URIs with a dollar sign properly to fix build ARG reference lookups on those hosts ([docker/docker-language-server#393](https://github.com/docker/docker-language-server/issues/393))
  - textDocument/documentLink
    - convert links properly if a WSL URI with a dollar sign is used ([docker/docker-language-server#378](https://github.com/docker/docker-language-server/issues/378))
  - textDocument/inlayHint
    - refactor the URI handling code so it will process a WSL URI with a dollar sign correctly ([docker/docker-language-server#395](https://github.com/docker/docker-language-server/issues/395))
  - textDocument/inlineCompletion
    - convert links properly if a WSL URI with a dollar sign is used ([docker/docker-language-server#384](https://github.com/docker/docker-language-server/issues/384))
  - textDocument/publishDiagnostics
    - update the URI handling so that a WSL URI with a dollar sign can be scanned for errors ([docker/docker-language-server#386](https://github.com/docker/docker-language-server/issues/386))

## [0.13.0] - 2025-07-17

### Added

- Compose
  - textDocument/documentLink
    - add anchor resolution for all supported document links ([docker/docker-language-server#348](https://github.com/docker/docker-language-server/issues/348))
    - return document links for the `file` attribute of a service object's `extends` attribute object ([docker/docker-language-server#172](https://github.com/docker/docker-language-server/issues/172))
    - provide document links for models on Docker Hub and Hugging Face ([docker/docker-language-server#356](https://github.com/docker/docker-language-server/issues/356))
    - return document links for the `label_file` attribute of a service object ([docker/docker-language-server#360](https://github.com/docker/docker-language-server/issues/360))
  - textDocument/hover
    - support hovering over referenced models ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))

### Changed

- errors with the Docker Language Server will no longer be hidden

### Fixed

- stop the language server from crashing when opened inside a WSL folder with a dollar sign ([#165](https://github.com/docker/vscode-extension/issues/165))
- Compose
  - textDocument/completion
    - prevent wildcard object attribute suggestions if the text cursor is not at the right indentation for attributes to be inserted ([docker/docker-language-server#342](https://github.com/docker/docker-language-server/issues/342))
  - textDocument/documentLink
    - fix bounds index error if a quoted string just has a registry and the colon character at the end ([docker/docker-language-server#351](https://github.com/docker/docker-language-server/issues/351))

## [0.12.0] - 2025-07-09

### Added

- a new experimental `docker.extension.enableBuildDebugging` setting for developing and testing the upcoming build debugging feature
  - this feature is under active development and is not ready for general use
- Compose
  - update schema to the latest version
  - textDocument/completion
    - support completing model object names ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))
  - textDocument/definition
    - support jumping to referenced model objects ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))
  - textDocument/documentHighlight
    - support highlighting referenced models objects ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))
  - textDocument/documentLink
    - support recursing into anchors when searching for document links ([docker/docker-language-server#329](https://github.com/docker/docker-language-server/issues/329))
    - return document links for the `file` attribute of a service object's `credential_spec` ([docker/docker-language-server#338](https://github.com/docker/docker-language-server/issues/338))
  - textDocument/documentSymbol
    - show model objects in the document symbol tree ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))
  - textDocument/prepareRename
    - allow preparing rename on model objects ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))
  - textDocument/rename
    - support renaming model objects ([docker/docker-language-server#343](https://github.com/docker/docker-language-server/issues/343))

### Fixed

- Compose
  - textDocument/completion
    - prevent errors if an empty JSON object is the content of the YAML file ([docker/docker-language-server#330](https://github.com/docker/docker-language-server/issues/330))
    - check character offset before processing to prevent errors ([docker/docker-language-server#333](https://github.com/docker/docker-language-server/issues/333))

## [0.11.0] - 2025-06-23

### Added

- Dockerfile
  - include the Dockerfile Language Server written in TypeScript into the extension
  - draw horizontal lines between each `FROM` instruction to help users visually distinguish the different parts of a Dockerfile ([#147](https://github.com/docker/vscode-extension/issues/147))
    - a new `docker.extension.editor.dockerfileBuildStageDecorationLines` setting to toggle the divider lines, defaults to `true`

## [0.10.0] - 2025-06-12

### Added

- Dockerfile
  - textDocument/publishDiagnostics
    - provide code actions to easily ignore build checks ([docker/docker-language-server#320](https://github.com/docker/docker-language-server/issues/320))
- Compose
  - textDocument/completion
    - add support for suggesting `include` properties ([docker/docker-language-server#316](https://github.com/docker/docker-language-server/issues/316))

### Fixed

- Compose
  - textDocument/completion
    - fix error case triggered by using code completion before the first node ([docker/docker-language-server#314](https://github.com/docker/docker-language-server/issues/314))
  - textDocument/definition
    - check the type of a dependency node's value before assuming it is a map and recursing into it ([docker/docker-language-server#324](https://github.com/docker/docker-language-server/issues/324))
  - textDocument/hover
    - protect the processing of included files if the node is not a proper array ([docker/docker-language-server#322](https://github.com/docker/docker-language-server/issues/322))
- Bake
  - textDocument/inlineCompletion
    - check that the request is within the document's bounds when processing the request ([docker/docker-language-server#318](https://github.com/docker/docker-language-server/issues/318))

## [0.9.0] - 2025-06-10

### Added

- Compose
  - textDocument/definition
    - recurse into anchors when evaluating the cursor's position ([docker/docker-language-server#305](https://github.com/docker/docker-language-server/issues/305))
  - textDocument/documentHighlight
    - recurse into anchors when evaluating the cursor's position ([docker/docker-language-server#305](https://github.com/docker/docker-language-server/issues/305))
  - textDocument/hover
    - resolve anchors when constructing the path of the hovered item ([docker/docker-language-server#303](https://github.com/docker/docker-language-server/issues/303))
  - textDocument/prepareRename
    - recurse into anchors when evaluating the cursor's position ([docker/docker-language-server#305](https://github.com/docker/docker-language-server/issues/305))
  - textDocument/rename
    - recurse into anchors when evaluating the cursor's position ([docker/docker-language-server#305](https://github.com/docker/docker-language-server/issues/305))

### Fixed

- Compose
  - textDocument/completion
    - stop volume named references from causing volume attributes to not be suggested ([docker/docker-language-server#309](https://github.com/docker/docker-language-server/issues/309))
  - textDocument/documentLink
    - ensure the image attribute is valid before trying to process it for document links ([docker/docker-language-server#306](https://github.com/docker/docker-language-server/issues/306))
- Bake
  - textDocument/definition
    - fix nil pointers when navigating around a top level attribute that is not in any block ([docker/docker-language-server#311](https://github.com/docker/docker-language-server/issues/311))

## [0.8.1] - 2025-06-06

### Fixed

- lock cache manager when deleting to prevent concurrent map writes ([docker/docker-language-server#298](https://github.com/docker/docker-language-server/issues/298))
- initialize
  - return JSON-RPC error if an invalid URI was sent with the request ([docker/docker-language-server#292](https://github.com/docker/docker-language-server/issues/292))
- Compose
  - textDocument/completion
    - check for whitespace when performing prefix calculations for build target suggestions ([docker/docker-language-server#294](https://github.com/docker/docker-language-server/issues/294))
    - return an empty result instead of an internal server error if the request's parameters are outside the document's bounds ([docker/docker-language-server#296](https://github.com/docker/docker-language-server/issues/296))
    - check the node path's length before recursing deeper for pattern properties matches ([docker/docker-language-server#300](https://github.com/docker/docker-language-server/issues/300))
  - textDocument/hover
    - fix error caused by casting a node without checking its type first ([docker/docker-language-server#290](https://github.com/docker/docker-language-server/issues/290))

## [0.8.0] - 2025-06-05

### Added

- send errors to BugSnag if error telemetry is configured to be allowed and sent
- Dockerfile
  - provide code actions for Scout vulnerabilities that will open the settings page so that users can opt-out of them easily ([#130](https://github.com/docker/vscode-extension/issues/130))
  - textDocument/hover
    - support configuring specific vulnerability hovers with an experimental setting ([#101](https://github.com/docker/vscode-extension/issues/101))
  - textDocument/publishDiagnostics
    - support filtering specific vulnerability diagnostics with an experimental setting ([#101](https://github.com/docker/vscode-extension/issues/101))
- Compose
  - created `docker.extension.enableComposeLanguageServer` for globally toggling Compose editor features
  - updated Compose schema to the latest version ([docker/docker-language-server#117](https://github.com/docker/docker-language-server/issues/117))
  - textDocument/completion
    - add support for attribute name and value completion
    - suggest dependent service names for the `depends_on` attribute ([docker/docker-language-server#131](https://github.com/docker/docker-language-server/issues/131))
    - suggest dependent network names for the `networks` attribute ([docker/docker-language-server#132](https://github.com/docker/docker-language-server/issues/132))
    - suggest dependent volume names for the `volumes` attribute ([docker/docker-language-server#133](https://github.com/docker/docker-language-server/issues/133))
    - suggest dependent config names for the `configs` attribute ([docker/docker-language-server#134](https://github.com/docker/docker-language-server/issues/134))
    - suggest dependent secret names for the `secrets` attribute ([docker/docker-language-server#135](https://github.com/docker/docker-language-server/issues/135))
    - improve code completion by automatically including required attributes in completion items ([docker/docker-language-server#155](https://github.com/docker/docker-language-server/issues/155))
    - support build stage names for the `target` attribute ([docker/docker-language-server#173](https://github.com/docker/docker-language-server/issues/173))
    - suggest service names for a service's `extends` or `extends.service` attribute ([docker/docker-language-server#184](https://github.com/docker/docker-language-server/issues/184))
  - textDocument/definition
    - support looking up volume references ([docker/docker-language-server#147](https://github.com/docker/docker-language-server/issues/147))
    - support navigating to a dependency that is defined in another file ([docker/docker-language-server#190](https://github.com/docker/docker-language-server/issues/190))
    - support navigating to the defined YAML anchor from an alias reference ([#264](https://github.com/docker/docker-language-server/issues/264))
  - textDocument/documentHighlight
    - support highlighting object references and anchors and aliases
  - textDocument/documentLink
    - support opening a referenced Dockerfile from the `build` object's `dockerfile` attribute ([#69](https://github.com/docker/docker-language-server/issues/69))
    - support opening a referenced file from a config's `file` attribute ([#271](https://github.com/docker/docker-language-server/issues/271))
    - support opening a referenced file from a secret's `file` attribute ([#272](https://github.com/docker/docker-language-server/issues/272))
    - provide document links when an included file is also a YAML anchor ([#275](https://github.com/docker/docker-language-server/issues/275))
    - consider quotes when calculating the link's range ([#242](https://github.com/docker/docker-language-server/issues/242))
    - consider anchors and aliases instead of assuming everything are strings ([#266](https://github.com/docker/docker-language-server/issues/266))
  - textDocument/formatting
    - add support to format YAML files that do not have clear syntactical errors ([docker/docker-language-server#165](https://github.com/docker/docker-language-server/issues/165))
  - textDocument/hover
    - add support for hovering over attribute keys and showing the descriptions in the schema with links to the schema and the online documentation
    - render a referenced object's or YAML anchor or alias's textual YAML content as a hover
    - include the range of the hovered element to clearly identify what is being hovered over for the client ([#256](https://github.com/docker/docker-language-server/issues/256))
  - textDocument/inlayHint
    - show the parent service's value if it is being overridden and they are not object attributes ([docker/docker-language-server#156](https://github.com/docker/docker-language-server/issues/156))
  - textDocument/publishDiagnostics
    - report YAML syntax errors ([docker/docker-language-server#167](https://github.com/docker/docker-language-server/issues/167))
  - textDocument/prepareRename
    - support rename preparation requests ([docker/docker-language-server#150](https://github.com/docker/docker-language-server/issues/150))
  - textDocument/rename
    - support renaming named object references and YAML anchors and aliases
- Bake
  - textDocument/publishDiagnostics
    - support filtering specific vulnerability diagnostics with an experimental setting ([#101](https://github.com/docker/vscode-extension/issues/101))

### Changed

- diagnostics will now include Docker DX in its name to help users identify which diagnostics are coming from this extension ([#127](https://github.com/docker/vscode-extension/issues/127))
- Dockerfile
  - textDocument/hover
    - `recommended_tag` diagnostics are now hidden by default ([docker/docker-language-server#223](https://github.com/docker/docker-language-server/issues/223))
  - textDocument/publishDiagnostics
    - hide `not_pinned_digest` diagnostics from Scout by default ([docker/docker-language-server#216](https://github.com/docker/docker-language-server/issues/216))
    - recommended tag hovers are now hidden by default ([docker/docker-language-server#223](https://github.com/docker/docker-language-server/issues/223))

### Fixed

- Dockerfile
  - textDocument/codeAction
    - preserve instruction flags when fixing a `not_pinned_digest` diagnostic ([docker/docker-language-server#123](https://github.com/docker/docker-language-server/issues/123))
  - textDocument/definition
    - fix range calculation when the element is quoted ([#255](https://github.com/docker/docker-language-server/issues/255))
  - textDocument/hover
    - hide vulnerability hovers if the top level setting is disabled ([docker/docker-language-server#226](https://github.com/docker/docker-language-server/issues/226))
  - textDocument/publishDiagnostics
    - ignore the diagnostic's URL and do not set it if it is evaluated to be the empty string ([docker/docker-language-server#219](https://github.com/docker/docker-language-server/issues/219))
    - consider flag changes when determining whether to scan a file again or not ([docker/docker-language-server#224](https://github.com/docker/docker-language-server/issues/224))
- Compose
  - textDocument/completion
    - resolved a spacing offset issue with object or array completions ([docker/docker-language-server#115](https://github.com/docker/docker-language-server/issues/115))
    - suggest completion items for array items that use an object schema directly ([docker/docker-language-server#161](https://github.com/docker/docker-language-server/issues/161))
  - textDocument/definition
    - consider `extends` when looking up a service reference ([docker/docker-language-server#170](https://github.com/docker/docker-language-server/issues/170))
    - recurse into YAML anchors if they are defined on a service object ([#287](https://github.com/docker/docker-language-server/issues/287))
  - textDocument/hover
    - fixed a case where an object reference's description would not be returned in a hover result ([docker/docker-language-server#233](https://github.com/docker/docker-language-server/issues/233))
- Bake
  - textDocument/publishDiagnostics
    - stop flagging `BUILDKIT_SYNTAX` as an unrecognized `ARG` ([docker/docker-language-server#187](https://github.com/docker/docker-language-server/issues/187))
    - use inheritance to determine if an `ARG` is truly unused ([docker/docker-language-server#198](https://github.com/docker/docker-language-server/issues/198))
    - correct range calculations for malformed variable interpolation errors ([docker/docker-language-server#203](https://github.com/docker/docker-language-server/issues/203))
    - filter out variables when resolving Dockerfile paths to prevent false positives from being reported ([docker/docker-language-server#263](https://github.com/docker/docker-language-server/issues/263))

### Removed

- Compose
  - removed the `docker.extension.experimental.composeCompletions` setting in favour for the new `docker.extension.enableComposeLanguageServer` setting

## [0.7.0] - 2025-05-21

### Added

- tagged appropriate settings to make them easier to search for
- suggest the user install Docker Desktop if Scout cannot be found
- prompt the user about duplicated Compose features if Red Hat's YAML extension is also installed

## [0.6.0] - 2025-04-29

### Added

- Compose
  - textDocument/definition
    - support lookup of `configs`, `networks`, and `secrets` referenced inside `services` object ([#91](https://github.com/docker/docker-language-server/issues/91))
  - textDocument/documentLink
    - support opening a referenced image's page as a link ([#91](https://github.com/docker/docker-language-server/issues/91))
  - textDocument/hover
    - extract descriptions and enum values from the Compose specification and display them as hovers ([#101](https://github.com/docker/docker-language-server/issues/101))

## [0.5.0] - 2025-04-28

### Added

- add support for the `alpine-x64` and `alpine-arm64` targets ([#93](https://github.com/docker/vscode-extension/issues/93))
- Bake
  - textDocument/definition
    - allow jumping to a target block when referencing its attribute ([docker/docker-language-server#78](https://github.com/docker/docker-language-server/issues/78))
- Compose
  - textDocument/definition
    - allow looking up referenced services when using the short form syntax for `depends_on` ([docker/docker-language-server#67](https://github.com/docker/docker-language-server/issues/67))
    - allow looking up referenced services when using the long form syntax for `depends_on` ([docker/docker-language-server#68](https://github.com/docker/docker-language-server/issues/68))

### Fixed

- Bake
  - textDocument/semanticTokens/full
    - ensure semantic tokens are only calculated for Bake files ([docker/docker-language-server#85](https://github.com/docker/docker-language-server/pull/85))

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

[Unreleased]: https://github.com/docker/docker-language-server/compare/v0.18.0...main
[0.18.0]: https://github.com/docker/docker-language-server/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/docker/docker-language-server/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/docker/docker-language-server/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/docker/docker-language-server/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/docker/vscode-extension/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/docker/vscode-extension/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/docker/vscode-extension/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/docker/vscode-extension/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/docker/vscode-extension/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/docker/vscode-extension/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/docker/vscode-extension/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/docker/vscode-extension/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/docker/vscode-extension/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/docker/vscode-extension/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/docker/vscode-extension/compare/v0.4.10...v0.5.0
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
