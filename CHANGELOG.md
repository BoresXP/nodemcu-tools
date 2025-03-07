# Change Log

All notable changes to the "nodemcu-tools" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.2.0] - 2025-03-01

## Added

- added the ability to increase the speed of uploading files to ESP. The baud rate is set in the `uploadBaudrate` setting.
- added folder deletion on the device

## [5.1.0] - 2025-01-26

## Added

- add webview localization

## [5.0.0] - 2025-01-25

 ⚠️  **BREAKING CHANGE**

- Change name of `minify.enabled` setting to `minifyLua.enabled`

### Added

- extension localization. Russian language is now available.
- minify JSON file before uploading to the device. New `minifyJSON.enabled` setting controls whether a JSON file should be minified before uploading to the device. Default: `false`

### Fixed

- some esp8266 boards did not connect (on Windows) due to Error: Open (SetCommState): Unknown error code 31
- the `sendLine` command should not be active if 'editorHasSelection == true'

 ### Changed

- Update dependencies

## [4.6.0] - 2024-12-27

 ⚠️  **BREAKING CHANGE**

- Bump the minimum NodeJS version to v20.18.1 - which aligns with `serialport` v13's minimum.

 ### Added

 - Reveals `foldername/filename.ext` as a tree in the 'Device Tree View'. Only one nesting level is allowed.

 ### Changed

- Migrate to ESLint v9
- Update dependencies

## [4.5.0] - 2024-12-10

- Added support for esp32 `console` module

### Fixed

- Fixed file downloading in edge case for legacy esp32 firmware.
- Make the color line output to the log more reliable.

## [4.4.0] - 2024-10-10

### Added

- Added support for esp32 firmware compiled from the stale dev-esp32-idf3-final branch
- Added 'Espressif' to known vendorIDs list

## [4.3.1] - 2024-09-21

### Fixed

- Automatically rebuild tasks if the configuration file has been changed
- Do not show unwanted `No config file '.nodemcutools'` message.

### Changed

- Update dependencies

## [4.3.0] - 2024-08-02

 ⚠️  **Breaking changes**

- Default value for "Include path" in the config file has been removed. You'll have to specify a list of glob patterns that match files to be included in LFS image yourself. For example, './lfs/\*lua' to include all *.lua* files under the **./lfs** folder.

### Added

- Added support for new esp32 feature - **node.info()**.

- Added the feature of creating *resource.lua* file to use it with [file_lfs](https://nodemcu.readthedocs.io/en/release/lua-modules/file_lfs/#file-lfs-module) module.

  New option **resourceDir** in the config file specifies the folder containing the files to be included in resource.lua. (e.g. ./resource)
  The created *resource.lua* will be emitted to *OutDir* folder and automatically included in the LFS image build.

- Added new **connectionDelay** setting - connection delay (in milliseconds) between opening the serial device and starting the communication.  
This parameter is intended to fix Reset-on-Connect Issue. See [Fixing Reset-on-Connect Issue](https://github.com/AndiDittrich/NodeMCU-Tool/blob/master/docs/Reset_on_Connect.md)

### Changed

- Update dependencies

## [4.2.0] - 2024-05-23

### Added

- collectgarbage() in "Globals" snippet
- New command 'nodemcu-tools.uploadActiveFile' to upload file in the currently active editor to device.
The command is also accessible from editor context menu.
- All esp32 models (e.g. esp32s2, esp32h6) are displayed in status bar
- Support handling of IDF LF/LF line endings

### Fixed

- run chunk on esp32

### Changed

- Re-arrange control buttons in Termimal container

## [4.1.1] - 2024-02-16
### Added
- Add extension logo

## [4.1.0] - 2024-02-11
### Added
- Command to upload all files under folder to device. “folder_name/” will be prepended to the file_names uploaded to the device
- Command to upload all files under folder to device without adding path to the file names

### Changed
- Upload multiple selected files with any extension. Not only *.lua
- Update dependencies

## [4.0.1] - 2024-01-08
### Changed
- Update dependencies

### Fixed
- file upload failure in edge cases

## [4.0.0] - 2023-10-10
### Breaking Changes
- Drop node v14
- VS Code version should be >= 1.74.0
- Built-in auto-completion of NodeMCU functions was removed . It is suggested to use sumneko's [LuaLS](https://github.com/LuaLS/lua-language-server ) with [addons](https://github.com/LuaLS/lua-language-server/wiki/Addons ) *nodemcu-esp32* and *nodemcu-esp8266* instead.

### Changed
- Sequences of white space are preserved when rendering in the terminal
- Default snippets related to the chip architecture were removed
- Handling the newline character received from device
- Use new native bindings
- Update dependencies

### Added
- Interaction with the **ESP32** device
- New commands:
  - **sendLine** command to send a line of code from the editor window to the device. The string length must be less or equal 254 bytes
  - **sendBlock** command to send the selected code snippet from the editor window to the device. The fragment size can exceed 254 bytes
  - **Compile file and upload**: Building *lfs.img* file and uploading it to the device
  - **buildLfs**: Builds *lfs.img* on host machine. Command is available in build tasks menu
  - **crossCompile**: Compiles a file on the host machine. Command is available in Explorer context menu by pressing ALT key (SHIFT key on Linux) when opening menu
  - **Upload to device**: uploading multiple selected files to device
- New options:
  - **nodemcu-tools.overwriteSnippets**. Defaults **true**
  - **nodemcu-tools.deviceFilterActive**. Defaults **true**
  - **nodemcu-tools.minify.enabled**. Defaults **false**
- **'Run'** icon in tree view: *.lua* or *.lc*:  file can be runned on device by pressing on **▷** icon.
- **Format** button was added to the TerminalContainer
- Renders *chipID* in tooltip on hover chipArch in StatusBar
-  *Globals* snippet was added, it's common to both architectures
- *VendorID* for FTDI232 adapter was added in list of known devices
- Support for *com0com* virtual port
- Colored output to the terminal. These ANSI color codes are supported:
  - 0;31m Red
  - 0;32m Green
  - 0;33m Yellow
  - 0;34m Blue
  - 0;35m Magenta
  - 0;36m Cyan

### Fixed
- Fix file zero size uploading/downloading
- Sort files on device

## [3.5.0] - 2022-08-01
## Changed
- Use new native bindings
- Use new hook to search for bindings
- Update dependencies
- Update toolchain and build actions

## [3.4.3] - 2021-11-30
### Changed
- Update native bindings
- Update dependencies

## [3.4.2] - 2021-03-16
### Changed
- Update native bindings
- Update dependencies

## [3.4.1] - 2020-02-01
### Changed
- Fix set as LFS command hangs
- Fix autoscroll
- Update dependencies

## [3.4.0] - 2021-01-18
### Added
- Command to run file on device
- Button to scroll terminal to bottom
- Command to upload file on device as LFS
- Command to upload file on device with rename

### Changed
- Do not scroll terminal to bottom if scrolled up
- Make margins smaller leaving more space for terminal
- Change text buttons to icons, make buttons smaller
- Prevent running empty command
- Prevent adding equal commands to history
- Update dependencies

## [3.3.0] - 2020-12-17
### Added
- Status bar with device info
- Tooltip for snippets and status bar

### Changed
- Migrate to Effector

## [3.2.0] - 2020-11-27
### Added
- Settings for terminal scrollback, command history and snippets
- Download as command

## Changed
- Update readme

## [3.1.0] - 2020-11-26
### Changed
- Fix Run file command
- Relax VSCode verion requirement
- Fix Upload and compile command was not wirking

## [3.0.0] - 2020-11-25
### Added
- New extension window (with terminal)
- Snippets (on new extension window)
- Command line on new window has history now
- New output window is colored

### Changed
- Fix commands may interfere with node output
- File operations (upload/download) are much faster now
- Sort files on device alpabetically

### Removed
- Old terminal
- Reset command (moved to snippet)
- Extension telemetry

## [2.2.0] - 2020-10-30
### Changed
- Fix downloading files with encoder. Thanx to David Thornley.

## [2.1.0] - 2020-10-29
### Added
- Extension telemetry

### Changed
- Correct error is shown if failed to load native SerialPort binding

## [2.0.0] - 2020-10-20
### Added
- Ability to work on all platforms (Windows, Linux, MacOS)

### Changed
- Reduced extension package size (not including mode_modules anymore, use bundling)

## [1.1.0] - 2020-10-15
### Added
- Code completion for NodeMCU modules

## [1.0.0] - 2020-10-12
- Initial release
