Extension brings NodeMCU device interaction to Visual Studio Code.

## Features
*(see detailed description below)*
* Browse devices in a special TreeView
* Use terminal for each connected device to execute commands
* Upload file to device from VSCode explorer
* Download file from device to solution folder
* Compile, delete, run LUA file on device
* Work with many devices simultaneously
* Code completion for NodeMCU modules
* Works on all platforms (Windows, Linux, MacOS)

## In detail

Extension creates new TreeView in Explorer container:

![device tree view](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/c10205f6ad615c9737d81f0e9d2c5b2199aea054/resources/docs/tree.png)

In that view you can see all available NodeMCU devices and connect to them.

After connecting you can browse files on device, run command and snippets in terminal and see device output:

![connected device in treeview and terminal](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/c10205f6ad615c9737d81f0e9d2c5b2199aea054/resources/docs/tree-and-term.png)

You can run some actions on device with context menu: delete, compile, run. Also, you can run commands directly in terminal and see output.

VSCode explorer context menu gots new item too: upload to device. You can upload any file in solution to selected device:

![upload from explorer](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/c10205f6ad615c9737d81f0e9d2c5b2199aea054/resources/docs/explorer-menu.png)

Here is an example. Upload LUA-file to device, compile it, run compiled file from terminal and download compiled file back to local file system:

![upload-download example](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/c10205f6ad615c9737d81f0e9d2c5b2199aea054/resources/docs/upload-download.gif)

## Window layout

![](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/c10205f6ad615c9737d81f0e9d2c5b2199aea054/resources/docs/main-screen.png)

1. Terminal
2. Command input
3. [Snippets](#snippets)
4. Devices and files tree view
5. Command
6. Command output
7. Device (port)
8. File on device

## Keybindings & Commands

_(ALT commands are available by pressing ALT key when opening menu)_
* **Explorer context menu:**
  * **Upload to device:** upload selected file on device. If you have more than one device connected you will be presented with QuickPick UI to select device to upload file to.
  * **[ALT] Upload to device and compile:** upload file to device (see above), compiles it and removes source.
* **Device context menu (7):**
  * **Connect:** connect to this device. This will also open main window for this device.
  * **Disconnect:** disconnect from device. This will also close main window for device. By the way, closing main window will disconnect device too.
* **File on device context menu: (8)**
  * **[On LUA files only] Compile**: compile selected file on device and remove source.
  * **Delete:** delete selected file on device. No recovery possible.
  * **Download:** download file from device to host machine. File will be saved in the root of workspace.
  * **[ALT] Download as...:** download file to host machine (see above) but lets you change name under which file will be saved.
  * **Run:** run file on device. It just executes dofile command which you will see in terminal (1).

## Extension Settings

* **Terminal:**
  * **Scrollback Size:** how many lines of scrollback will terminal (1) have. Min - 10, max - 1000, default - 300.
  * **Command History Size:** how many commands will be held in history. You can navigate command history by pressing up and down arrow keys in command input box (2). Min - 0, max - 100, default - 30.
* <a name="snippets"></a>**Snippets:** snippets are buttons at the bottom of main window (3). These are just commands to run on device. You can configure it yourself with this setting. Setting itself is an object with each property representing one snippet: name is shown on a button, value is command text. You can set different snippets for each workspace. Workspace snippets _overrides_ ones set in user settings and defaults. With this behavior you can remove some default snippets. 

## What's New / Change Log

See [Changelog](https://bitbucket.org/BoresExpress/nodemcu-tools/src/master/CHANGELOG.md)

## Known issues

Please report issues here: [bugtracker](https://bitbucket.org/BoresExpress/nodemcu-tools/issues).

## Acknowledgments

- Andi Dittrich for the great console app [NodeMCU-Tool](https://github.com/AndiDittrich/NodeMCU-Tool)
- Furkan Duman for NodeMCU [extension for VSCode](https://github.com/fduman/vscode-nodemcu)

## License

This extension is licensed under the [MIT License](https://bitbucket.org/BoresExpress/nodemcu-tools/raw/cccc452c3dad7539e553ad45bafda68eaff7b9d7/LICENSE.md).