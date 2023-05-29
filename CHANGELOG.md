# Change Log

All notable changes to the "nodemcu-tools" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support com0com virtual port

## [3.5.12] - 2023-05-25
### Changed
- Upgrade serialport to v11
- Colored line handling was improved. New color code 35m was added
- Fixed, device should not busy when 'runChunk' command has been executed
- Fixed, content of received file should not be displayed in the terminal

## [3.5.11] - 2023-05-21
## Fixed
- Handling the newline character received from device
- Sort files on device

## [3.5.10] - 2023-05-20
### Added
- Support for colored output to the terminal. These ANSI color codes are supported:
  - 0;31m Red
  - 0;32m Green
  - 0;33m Yellow
  - 0;34m Blue
  - 0;36m Cyan

## Fixed
- Download fails sometimes due to leading unwanted chars in receive buffer.

## [3.5.9] - 2023-05-10
### Added
- New option **nodemcu-tools.deviceFilterActive**. Defaults **true**
- vendorID for FTDI232 adapter was added in list of known devices
- Update dependencies

## [3.5.8] - 2023-05-06
### Added
- New option **nodemcu-tools.overwriteSnippets**. Defaults **true**
- Update native bindings
- Update dependencies

## Fixed
- Catch errors when opening the serial port

## [3.5.7] - 2023-05-03
### Changed
- Fix incorrect file path in commands *Builds LFS on host machine* and *Compile on host machine*
- Improve UI

## [3.5.6] - 2023-05-02
### Added
- command 'buildLfs': Builds LFS on host machine. Command is available in build tasks menu;
- command 'crossCompile': Compiles a file on the host machine. Command is available in Explorer context menu by pressing ALT key (SHIFT key on Linux) when opening menu;
- Run icon in tree view
.lua or .lc file can be runned on device by pressing on Run icon in location: view/item/context.

## [3.5.5] - 2023-04-29
### Added
- Add command 'Compile file and upload'

### Changed
- Fixed, if compilation fails, the previous compiled file will still be loaded.

## [3.5.4] - 2023-04-26
### Added
- Building *lfs.img* file and uploading it to the device
- 'Format' button was added to the TerminalContainer

### Changed
- Improve UI

## [3.5.3] - 2023-04-12
### Added
- Uploading multiple selected files to device with 'Upload to device' command
- Renders chipID in tooltip on hover chipArch in StatusBar

### Changed
- Fix file zero size uploading/downloading
- Sequences of white space are preserved when rendering in the terminal
- Renders modules in StatusBar properly
- Improve 'sendLine' and 'sendBlock' commands
  - trims a string to be sent in the sendLine command
  - trims only leading spaces and tabs in the sendBlock command

## [3.5.2] - 2023-04-06
### Added
- Option to enable Lua code minifying. Minifying the code is disabled by default.

### Changed
- VS Code version requirement was relaxed to 1.74.0
- Fix a too long string could have been sent to the device.
- The annotation in the changelog for version 3.5.1 has been translated:

    the translate for v3.5.1
  - added support for working with the esp32 chip;
  - added the **sendLine** command to send a line of code from the editor window to the device. The string length must be less or equal 254 bytes;
  - added the **sendBlock** command to send the selected code snippet from the editor window to the device. The fragment size can exceed 254 bytes;
  - completely removed the built-in implementation of auto-completion of NodeMCU functions. Instead, it is suggested to use sumneko's [LuaLS](https://github.com/Lua/lua-language-server ) with connected [addons](https://github.com/LuaLS/lua-language-server/wiki/Addons ) nodemcu-esp32 and nodemcu-esp8266;
  - removed default snippets related to the chip architecture;
  - added the _Globals_ snippet, common to both architectures;
  - the minimum VS Code version should be 1.75.0

## [3.5.1] - 2023-03-31
- добавлена поддержка работы с чипом esp32;
- добавлена команда **sendLine** для отправки строки кода из окна редактора в устройство. Длина строки должна быть менее 254 байт;
- добавлена команда **sendBlock** для отправки выделенного фрагмента кода из окна редактора в устройство. Размер фрагмента может превышать 254 байта;
- полностью убрана встроенная реализация автодополнения функций nodeMcu. Вместо этого предлагается использовать sumneko's [LuaLS](https://github.com/LuaLS/lua-language-server) с подключенными [addons](https://github.com/LuaLS/lua-language-server/wiki/Addons) nodemcu-esp32 и nodemcu-esp8266;
- убраны сниппеты, установленные по умолчанию, относящиеся к архитектуре чипа;
- добавлен сниппет _Globals_, общий для обеих архитектур;
- минимальная версия VS Code должна быть 1.75.0

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
