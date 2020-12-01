# Change Log

All notable changes to the "nodemcu-tools" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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