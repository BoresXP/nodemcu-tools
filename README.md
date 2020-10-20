Extension brings NodeMCU device interaction to Visual Studio Code.

## Features
*(see detailed description below below)*
* Browse devices in a special TreeView
* Use terminal for each connected device to execute commands
* Upload file to device from VSCode explorer
* Download file from device to solution folder
* Compile, delete, run LUA file on device
* Reset device
* Code completion for NodeMCU modules
* Works on all platforms (Windows, Linux, MacOS)

## In detail

Extension creates new TreeView in Explorer container:

![device tree view](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/e82656bada7d0b54e60b3fc71ccd95617df5063b/resources/docs/tree.png)

In that view you can see all available NodeMCU devices, connect to them and do some device-wide things.

After connecting you can browse files on device and type in terminal:

![connected device in treeview and terminal](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/e82656bada7d0b54e60b3fc71ccd95617df5063b/resources/docs/tree-and-term.png)

You can run some actions on device with context menu: delete, compile, run. Also you can run command directly in terminal and see output.

VSCode explorer context menu gots new item too: upload to device. You can upload any file in solution to selected device:

![upload from explorer](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/e82656bada7d0b54e60b3fc71ccd95617df5063b/resources/docs/explorer-menu.png)

Here is an example. Upload LUA-file to device, compile it, run compiled file from terminal and download compiled file back to local file system:

![upload-download example](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/e82656bada7d0b54e60b3fc71ccd95617df5063b/resources/docs/upload-download.gif)

You can even work with many devices in the same session. Look, how easy you can download file from one device and upload it to another:

![work with two devices](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/e82656bada7d0b54e60b3fc71ccd95617df5063b/resources/docs/two.gif)

## Keybindings

No keybindings yet

## Extension Settings

No settings yet

## What's New / Change Log

See [Changelog](https://bitbucket.org/BoresExpress/nodemcu-tools/src/master/CHANGELOG.md)

## Known issues

* Up/down arros in terminal working strange

Please report issues here: [bugtracker](https://bitbucket.org/BoresExpress/nodemcu-tools/issues).

## Acknowledgments

- Andi Dittrich for the great console app [NodeMCU-Tool](https://github.com/AndiDittrich/NodeMCU-Tool)
- Furkan Duman for NodeMCU [extension for VSCode](https://github.com/fduman/vscode-nodemcu)

## License

This extension is licensed under the [MIT License](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/cccc452c3dad7539e553ad45bafda68eaff7b9d7/LICENSE.md).