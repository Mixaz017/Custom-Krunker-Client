# Custom-Krunker-Client
An Open-Source, Customized Krunker Desktop Client.  
We have a [Discord Server](https://discord.gg/Gwb8psk) and providing supports!  
Please report bugs and crashes, it helps fixing things by a lot.

Worst client name in the universe btw

## Status
I purely enjoy working on this project, but this project is not my job and developments can be unstable.
As of now, this client is based on the official client, and main focus is to bring bugfixes, tweaks, and more customizability to the client.

I'm looking for a developer to maintain this client because I don't play Krunker anymore.
If you are interested and thinks that your skill is enough to maintain this client, join the Discord and DM me.

I'm also accepting bug reports, suggestions and feedbacks in our Discord.

Using [CClient](https://discord.gg/5ZMvrGT) is recommended over this client because the client is more stable and provides more actually useful features.
Also Cuffuffles, the developer of CClient, is a awesome guy

## Why this Client?
- This client is meant to be a superior of the official client.
- Many extra features available. You can suggest features you want in the Discord to improve the client as well.

## Features
- Every single features from official client is available ( Resource Swapper, Unlimited FPS, etc. ) 
---
- Patches
	- Adds compatibility with custom fonts to few social and market pages ( optional )
	- Fixes "Clear Cache" button ( also works faster )
	- Fixes a bug with the Discord RPC
	- Fixes splash screen font size
- General Tweaks
	- Remembers server search keywords ( optional )
	- Seek for new server by pressing F6 key
- Interface Tweaks
	- Adds a button that refresh the server browser
	- Ability to hide various elements ( ads ( you can still claim Free KR ), merch, etc. )
	- Ability to use custom CSS file
	- Customizable health display type
	- Customizable offsets for various elements ( scope, game overlay, etc. )
	- Customizable opacity for various elements ( scope, crosshair, etc. )
	- Remove text shadows ( optional, useful for custom fonts )
- Splash Screen
	- Customizable background and fonts for splash screen
- Client Tweaks
	- Ability to change auto updater behavior from settings or `--update=<download|check|skip>` argument ( argument method temporary overrides config )
	- Ability to disable Discord RPC ( optional )
	- Ability to disable Resource Swapper ( optional )
	- Adds a button that opens `appData` directory
	- Adds a button that relaunch the client
	- Auto updater support with GitHub - When there is a new custom client release, auto updater automatically installs it
	- Export current game state to a file - Can be used for some Twitch bot that reads local file, etc.
	- Relanch the client by pressing Alt + Ctrl + Shift + R key
- Network
	- Ability to dump network resources ( useful for making mods and customizations / may reduce performance / optional / disable Resource Swapper if you want to dump all files since it prevents dumper from duming some files )
- Debugging
	- Adds keyboard shortcut for toggle DevTools ( Alt + Command + I for macOS, Ctrl + Shift + I for other platforms)
	- Ability to always enable debug mode ( optional )
	- Few minor tweaks for debugging
---
- Options that added by the custom client is highlighted in orange.
- Some of options has to restart the client or reload the page to apply.

### Known Issues
- Updating the client will remove the pinned icon from taskbar. This also happens with the official client. This is a [known issue](https://github.com/electron-userland/electron-builder/issues/2514) of `electron-builder` and I don't have a fix for it, sorry.

## Running the Client

### Releases
Releases are prebuilt binaries, these are not always latest but one of the easiest way to get the client.  
You can download them from the [release page](https://github.com/Mixaz017/Custom-Krunker-Client/releases/latest).

You don't have to download `.blockmap` or `.yml` files, because those files are released only for auto update purpose.

### Running from source code
If your system doesn't support those released files, or you want to get latest version of the client, you can run the client by following the guide below.  
**Note that macOS is NOT officially supported, but the tutorial is here just because you can.**  
**Since auto updater relies on prebuilt binaries, macOS is unable to auto update. You have to update it manually.**  
**Expect some things may not work as intended on macOS.**
- Requirements for both methods
	1. Install [Node.js](https://nodejs.org/en/download/).  
	Versions above 9.0.0 should works fine. If you using `apt` to install Node.js, please note that apt may not work because apt provides very old version of Node.js. You can use [nvm](https://github.com/nvm-sh/nvm) to easily manage Node.js versions so it is highly recommended. You can check the version of Node by running `node -v`.
	2. [Download ZIP](https://github.com/Mixaz017/Custom-Krunker-Client/archive/master.zip) and extract, or clone this repository. We call the extracted directory or the cloned repository "local repository".
	3. Open CLI ( Command Prompt, Terminal, etc. ) from local repository and run `npm i`. This command should install all dependency modules.
- Build method ( recommended )  
	With this method, you can build executable files like `.exe`.
	1. Open CLI and run `npm i electron-builder -g`. This command should install `electron-builder` module globally.
	2. Run `electron-builder -c.win="" -c.mac="" -c.linux=""`. **If this command shows errors, please run the command with administrator permission (Run as administrator in Windows, prefix the command with `sudo` (`sudo electron-builder -c.win="" -c.mac="" -c.linux=""`) in macOS/Linux )** The executable file will be created in `dist` directory.
	3. Run the executable file in `dist` directory.
- No build method  
	This method simply launches the client directly, without building. You have to do this method every time you want to launch the client if you prefer this method.
	1. Open CLI and run `npm start`. This command should launch the client.