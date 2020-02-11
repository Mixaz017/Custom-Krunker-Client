const isMain = process.type == "browser"
const { remote } = require('electron');

console.log(__filename)

if (isMain) console.debug("-------------------- Client Start --------------------");

if ((isMain ? process : remote.process).argv.includes('--log')) Object.assign(console, require('electron-log').functions)

if (isMain) {
	process.on('uncaughtException', error => {
		if (error) console.error(error);
	});
}