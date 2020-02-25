const os = require('os');
// const fs = require('fs');
const path = require('path');
// const url = require('url');
const yargs = require("yargs")

console.log(__filename)

module.exports.DEBUG = process.argv.includes('--dev');
module.exports.AUTO_UPDATE_TYPE = yargs.argv.update || null

module.exports.isAMDCPU = os.cpus().findIndex(cpu => cpu.model.includes("AMD")) != -1;

module.exports.windowResize = {
	social: 0.8,
	viewer: 0.6,
	editor: 0.8
};

module.exports.GAME_REGEX = /^(https?:\/\/)?(www\.)?(.+)(krunker\.io|127\.0\.0\.1:8080)(|\/|\/\?game=.+)$/;
module.exports.GAME_CODE_REGEX = /^([A-Z]+):(\w+)$/;
module.exports.EDITOR_REGEX = /^(https?:\/\/)?(www\.)?(.+)(krunker\.io|127\.0\.0\.1:8080)\/editor\.html$/;
module.exports.VIEWER_REGEX = /^(https?:\/\/)?(www\.)?(.+)(krunker\.io|127\.0\.0\.1:8080)\/viewer\.html(.*)$/;
module.exports.SOCIAL_REGEX = /^(https?:\/\/)?(www\.)?(.+)(krunker\.io|127\.0\.0\.1:8080)\/social\.html(.*)$/;
module.exports.SITE_REGEX = /^(https?:\/\/)?(www\.)?(.+\.|)(krunker\.io|127\.0\.0\.1:8080)(|\/|.+)$/;
module.exports.PING_REGION_CACHE_KEY = "pingRegion4";

module.exports.DISCORD_ID = '560173821533880322';

String.prototype.isCode = function () {
	return module.exports.GAME_CODE_REGEX.test(this + '');
};

String.prototype.isGame = function () {
	return module.exports.GAME_REGEX.test(this + '');
};

String.prototype.isEditor = function () {
	return module.exports.EDITOR_REGEX.test(this + '');
};

String.prototype.isViewer = function () {
	return module.exports.VIEWER_REGEX.test(this + '');
};

String.prototype.isSocial = function () {
	return module.exports.SOCIAL_REGEX.test(this + '');
};

String.prototype.isKrunker = function () {
	return module.exports.SITE_REGEX.test(this + '');
};

module.exports.joinPath = path.join

module.exports.hexToRGB = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
	(m, r, g, b) => '#' + r + r + g + g + b + b)
	.substring(1).match(/.{2}/g)
	.map(x => parseInt(x, 16));

module.exports.autoUpdateTypes = {
	download: "Download",
	check: "Check Only",
	skip: "Skip"
}

module.exports.css = {
	customFontsFix: `.purchBtn, .purchInfoBtn {
		position: absolute;
		bottom: 11px;
	}
	.scrollItem > div {
		overflow: auto;
	}`,
	noTextShadows: `*, .button.small, .bigShadowT {
		text-shadow: none !important;
	}`,
	hideAds: `#aHolder, #pre-content-container {
		display: none !important
	}`,
	hideSocials: `.headerBarRight > .verticalSeparator, .imageButton {
		display: none
	}`,
	hidePopupScore: `#scoreText {
		display: none !important
	}`
}