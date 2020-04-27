const { remote } = require('electron');
const Store = require('electron-store');
const config = new Store();
const consts = require('./constants.js');
// const url = require('url');
// const rimraf = require('rimraf');
const fs = require("fs")
const path = require("path")

console.log(__filename)

// const CACHE_PATH = consts.joinPath(remote.app.getPath('appData'), remote.app.name, "Cache");

class Utilities {
	constructor() {
		this.consts = {};
		this.settings = null;
		this.onLoad();
	}

	createSettings() {
		this.settings = {
			unlimitedFrames: {
				name: "Unlimited FPS",
				pre: "<div class='setHed'>Performance</div>",
				val: true,
				html: _ => {
					return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("unlimitedFrames", this.checked);
						alert("This setting requires a client restart to take effect.");'
						${this.settings.unlimitedFrames.val ? 'checked' : ''}><span class='slider'></span></label>`;
				},
				set: (_, init) => {
					if (!init) {
						alert("App will now restart");
						remote.app.relaunch();
						remote.app.quit();
					}
				}
			},
			d3d9Mode: {
				name: "Window Capture",
				pre: "<div class='setHed'>Streaming</div>",
				val: false,
				html: _ => {
					return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("d3d9Mode", this.checked)' ${this.settings.d3d9Mode.val ? "checked" : ""}><span class='slider'></span></label>`;
				},
				set: (_, init) => {
					if (!init) {
						alert("App will now restart for setting to take effect.");
						remote.app.relaunch();
						remote.app.quit();
					}
				}
			},
			// frameLimit: {
			// 	name: "Hard FPS Limit",
			// 	pre: "<div class='setHed customUtility'>More Performance</div>",
			// 	val: 0,
			// 	min: 0,
			// 	max: 1000,
			// 	step: 1,
			// 	html: () => generateSetting("slider", "frameLimit", this)
			// },
			customFontsCSSFix: {
				name: "Fix CSS for Custom Fonts",
				pre: "<div class='setHed customUtility'>Patch</div>",
				val: true,
				html: () => generateSetting("checkbox", "customFontsCSSFix", this)
			},
			// chatSpecialChars: {
			// 	name: "Chat Special Characters",
			// 	pre: "<div class='setHed customUtility'>General Tweak</div>",
			// 	val: false,
			// 	html: () => generateSetting("checkbox", "chatSpecialChars", this),
			// 	set: (value, init) => {
			// 		if (value && init) chatInput.addEventListener("keydown", event => {
			// 			if (!event.isComposing && (event.key == "Enter" || event.key == "e" && event.ctrlKey) && document.activeElement == chatInput) {
			// 				chatInput.value = "&" + Array.from(chatInput.value).map(char => {
			// 					let codePoint = char.codePointAt()
			// 					return (31 < codePoint && codePoint < 128) ? char : `&#x${codePoint.toString(16)};`
			// 				}).join("")
			// 			}
			// 		})
			// 	}
			// },
			rememberSearch: {
				name: "Remember Server Search Keywords",
				val: false,
				html: () => generateSetting("checkbox", "rememberSearch", this),
				resources: {
					menuObserver: new MutationObserver(() => {
						if (document.getElementById("serverSearch")) {
							serverSearch.addEventListener("input", () => localStorage.setItem("moc_serverSearch", serverSearch.value))
							serverSearch.value = localStorage.getItem("moc_serverSearch")
							serverSearch.oninput()
							this.settings.rememberSearch.resources.menuObserver.disconnect()
						}
					})
				},
				set: value => {
					if (value) {
						this.settings.rememberSearch.resources.menuObserver.observe(menuWindow, {
							childList: true
						})
					} else {
						this.settings.rememberSearch.resources.menuObserver.disconnect()
					}
				}
			},
			scopeOffsetX: {
				name: "Scope X Offset",
				pre: "<div class='setHed customUtility'>Interface Tweak</div>",
				val: "0%",
				html: () => generateSetting("text", "scopeOffsetX", this, "Scope X Offset CSS Value"),
				set: value => aimRecticle.style.transform = `translate(${value}, ${this.settings.scopeOffsetY.val})`
			},
			scopeOffsetY: {
				name: "Scope Y Offset",
				val: "0%",
				html: () => generateSetting("text", "scopeOffsetY", this, "Scope Y Offset CSS Value"),
				set: value => aimRecticle.style.transform = `translate(${this.settings.scopeOffsetX.val}, ${value})`
			},
			scopeOpacity: {
				name: "Scope Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "scopeOpacity", this),
				set: value => recticleImg.style.opacity = value
			},
			gameOverlayOffsetX: {
				name: "Game Overlay X Offset",
				val: "0%",
				html: () => generateSetting("text", "gameOverlayOffsetX", this, "Game Overlay X Offset CSS Value"),
				set: value => overlay.style.transform = `translate(${value}, ${this.settings.gameOverlayOffsetY.val})`
			},
			gameOverlayOffsetY: {
				name: "Game Overlay Y Offset",
				val: "0%",
				html: () => generateSetting("text", "gameOverlayOffsetY", this, "Game Overlay Y Offset CSS Value"),
				set: value => overlay.style.transform = `translate(${this.settings.gameOverlayOffsetX.val}, ${value})`
			},
			gameOverlayOpacity: {
				name: "Game Overlay Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "gameOverlayOpacity", this),
				set: value => overlay.style.opacity = value
			},
			damageOverlayOffsetX: {
				name: "Damage Overlay X Offset",
				val: "0%",
				html: () => generateSetting("text", "damageOverlayOffsetX", this, "Damage Overlay X Offset CSS Value"),
				set: value => bloodDisplay.style.transform = `translate(${value}, ${this.settings.damageOverlayOffsetY.val})`
			},
			damageOverlayOffsetY: {
				name: "Damage Overlay Y Offset",
				val: "0%",
				html: () => generateSetting("text", "damageOverlayOffsetY", this, "Damage Overlay Y Offset CSS Value"),
				set: value => bloodDisplay.style.transform = `translate(${this.settings.damageOverlayOffsetY.val}, ${value})`
			},
			hidePopupScore: {
				name: "Hide Popup Score",
				val: false,
				html: () => generateSetting("checkbox", "hidePopupScore", this),
				set: (value, init) => {
					if (value) document.head.appendChild(this.consts.css.hidePopupScore)
					else if (!init) this.consts.css.hidePopupScore.remove()
				}
			},
			bonusScoreOpacity: {
				name: "Bonus Score Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "bonusScoreOpacity", this),
				set: value => chalDisplay.style.opacity = value
			},
			overlayOpacity: {
				name: "Crosshair, Nametag, etc. Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "overlayOpacity", this),
				set: value => window["game-overlay"].style.opacity = value
			},
			oldLeaderboardBackgroundOpacity: {
				name: "Old Scoreboard Background Opacity",
				val: 0.2,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "oldLeaderboardBackgroundOpacity", this),
				set: value => leaderDisplay.style.backgroundColor = `rgba(0,0,0,${value})`
			},
			newLeaderboardBackgroundOpacity: {
				name: "New Scoreboard Background Opacity",
				val: 0.7,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "newLeaderboardBackgroundOpacity", this),
				set: value => leaderContainerD.style.backgroundColor = `rgba(0,0,0,${value})`
			},
			countersBackgroundOpacity: {
				name: "Counters Background Opacity",
				val: 0.2,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "countersBackgroundOpacity", this),
				set: value => Array.from(document.querySelector('.topRightCounters').children).forEach(counter => counter.style.backgroundColor = `rgba(0,0,0,${value})`)
			},
			ammoDisplayBackgroundOpacity: {
				name: "Ammo Display Background Opacity",
				val: 0.3,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "ammoDisplayBackgroundOpacity", this),
				set: value => ammoDisplay.style.backgroundColor = `rgba(0,0,0,${value})`
			},
			weaponDisplayOpacity: {
				name: "Weapon Display Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "weaponDisplayOpacity", this),
				set: value => weapDisplay.style.opacity = value
			},
			timerBackgroundOpacity: {
				name: "Timer Background Opacity",
				val: 0.3,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "timerBackgroundOpacity", this),
				set: value => timerDisplay.style.backgroundColor = `rgba(0,0,0,${value})`
			},
			teamScoresBackgroundOpacity: {
				name: "Team Scores Background Opacity",
				val: 0.3,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "teamScoresBackgroundOpacity", this),
				set: value => teamScores.style.backgroundColor = `rgba(0,0,0,${value})`
			},
			reloadMessageOpacity: {
				name: "Reload Message Opacity",
				val: 1,
				min: 0,
				max: 1,
				step: 0.01,
				html: () => generateSetting("slider", "reloadMessageOpacity", this),
				set: value => reloadMsg.style.opacity = value
			},
			healthDisplayType: {
				name: "Health Display Type",
				val: "both",
				html: () => generateSetting("select", "healthDisplayType", this, {
					both: "Both",
					bar: "Bar",
					value: "Value",
					none: "None"
				}),
				set: value => {
					healthValueHolder.style.display = ["both", "value"].includes(value) ? "inherit" : "none"
					healthBar.style.display = ["both", "bar"].includes(value) ? "inherit" : "none"
				}
			},
			hideAds: {
				name: "Hide Ads",
				val: true,
				html: () => generateSetting("checkbox", "hideAds", this),
				set: (value, init) => {
					if (value) document.head.appendChild(this.consts.css.hideAds)
					else if (!init) this.consts.css.hideAds.remove()
				}
			},
			hideClaim: {
				name: "Hide Free KR",
				val: false,
				html: () => generateSetting("checkbox", "hideClaim", this),
				set: value => claimHolder.style.display = value ? "none" : "inherit"
			},
			hideMerch: {
				name: "Hide Merch",
				val: false,
				html: () => generateSetting("checkbox", "hideMerch", this),
				set: value => merchHolder.style.display = value ? "none" : "inherit"
			},
			hideSocials: {
				name: "Hide Social Buttons",
				val: false,
				html: () => generateSetting("checkbox", "hideSocials", this),
				set: (value, init) => {
					if (value) document.head.appendChild(this.consts.css.hideSocials)
					else if (!init) this.consts.css.hideSocials.remove()
				}
			},
			hideStreams: {
				name: "Hide Streams",
				val: false,
				html: () => generateSetting("checkbox", "hideStreams", this),
				set: value => streamContainer.style.display = value ? "none" : "inherit"
			},
			noTextShadows: {
				name: "Remove Text Shadows",
				val: false,
				html: () => generateSetting("checkbox", "noTextShadows", this),
				set: (value, init) => {
					if (value) document.head.appendChild(this.consts.css.noTextShadows)
					else if (!init) this.consts.css.noTextShadows.remove()
				}
			},
			customCSS: {
				name: "Custom CSS",
				val: "",
				html: () => generateSetting("url", "customCSS", this, "CSS File Path/URL"),
				resources: { css: document.createElement("link") },
				set: (value, init) => {
					this.settings.customCSS.resources.css.href = value
					if (init) {
						this.settings.customCSS.resources.css.rel = "stylesheet"
						document.head.appendChild(this.settings.customCSS.resources.css)
					}

				}
			},
			customSplashBackground: {
				name: "Custom Splash Screen Background",
				pre: "<div class='setHed customUtility'>Splash Screen</div>",
				val: "",
				html: () => "<span class='floatR'>| <a onclick='let dirPath = remote.dialog.showOpenDialogSync({properties: [\x22openFile\x22]}); if (dirPath && dirPath[0]) utilities.setSetting(\x22customSplashBackground\x22, dirPath[0])' class='menuLink'>Select</a> | <a onclick='window.utilities.openItem(window.utilities.settings.customSplashBackground.val)' class='menuLink'>Open</a></span>" + generateSetting("url", "customSplashBackground", this, "Splash Screen Background Path/URL")
			},
			customSplashFont: {
				name: "Custom Splash Screen Font",
				val: "",
				html: () => "<span class='floatR'>| <a onclick='let dirPath = remote.dialog.showOpenDialogSync({properties: [\x22openFile\x22]}); if (dirPath && dirPath[0]) utilities.setSetting(\x22customSplashFont\x22, dirPath[0])' class='menuLink'>Select</a> | <a onclick='window.utilities.openItem(window.utilities.settings.customSplashFont.val)' class='menuLink'>Open</a></span>" + generateSetting("url", "customSplashFont", this, "Splash Screen Font Path/URL")
			},
			autoUpdateType: {
				name: "Auto Update Behavior",
				pre: "<div class='setHed customUtility'>Client Tweak</div>",
				val: "download",
				html: () => generateSetting("select", "autoUpdateType", this, consts.autoUpdateTypes)
			},
			disableResourceSwapper: {
				name: "Disable Resource Swapper",
				val: false,
				html: () => generateSetting("checkbox", "disableResourceSwapper", this)
			},
			disableDiscordRPC: {
				name: "Disable Discord RPC",
				val: false,
				html: () => generateSetting("checkbox", "disableDiscordRPC", this)
			},
			exportActivity: {
				name: "Export Game Status",
				val: false,
				html: () => generateSetting("checkbox", "exportActivity", this),
				resources: {
					intervalId: null,
					writeActivity: template => {
						let activity = null
						try {
							activity = window.getGameActivity()
							let fullpath = config.get("utilities_exportActivityPath", path.join(remote.app.getPath("appData"), remote.app.getName(), "activity.txt"))
							if (!fs.existsSync(fullpath)) {
								!fs.existsSync(path.dirname(fullpath)) && fs.mkdirSync(path.dirname(fullpath))
							}
							fs.writeFileSync(fullpath, Object.entries(this.flattenObject(activity)).reduce((acc, cur) => acc.replace(new RegExp(`\\\${${cur[0]}}`, "g"), cur[1]), template).replace(/(?<!\\)\\n/g, "\n"))
						} catch (e) { return e }
					}
				},
				set: value => {
					if (value) this.settings.exportActivity.resources.intervalId = setInterval(() => {
						this.settings.exportActivity.resources.writeActivity(config.get("utilities_exportActivityString", "${id}"))
					}, 1000);
					else clearInterval(this.settings.exportActivity.resources.intervalId)
				}
			},
			exportActivityPath: {
				name: "Game Status Export Path",
				val: path.join(remote.app.getPath("appData"), remote.app.getName(), "activity.txt"),
				html: () => "<span class='floatR'>| <a onclick='window.utilities.openItem(window.utilities.settings.exportActivityPath.val || \x22./activity.txt\x22)' class='menuLink'>Open</a></span>" + generateSetting("url", "exportActivityPath", this, "Game Activity Export Path")
			},
			exportActivityString: {
				name: "Game Status Template String",
				val: "Current Room: ${mode} on ${map}\\nLink: https://krunker.io/?game=${id}\\n${time} seconds remaining. My username is ${user}, and using ${class.name}",
				html: () => generateSetting("text", "exportActivityString", this, "Game Activity Export Template String")
			},
			// Disabled This feature since beta server is down
			// betaServer: {
			// 	name: "Beta Server",
			// 	pre: "<div class='setHed customUtility'>Network</div>",
			// 	val: false,
			// 	html: () => `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("betaServer", this.checked)' ${this.settings.betaServer.val ? "checked" : ""}><span class='slider'></span></label>`
			// },
			dumpResources: {
				name: "Dump Resources",
				pre: "<div class='setHed customUtility'>Network</div>",
				val: false,
				html: () => generateSetting("checkbox", "dumpResources", this)
			},
			dumpPath: {
				name: "Dump Path",
				val: path.join(remote.app.getPath("documents"), "KrunkerResourceDump"),
				html: () => "<span class='floatR'>| <a onclick='let dirPath = remote.dialog.showOpenDialogSync({properties: [\x22openDirectory\x22]}); if (dirPath && dirPath[0]) utilities.setSetting(\x22dumpPath\x22, dirPath[0])' class='menuLink'>Select</a> | <a onclick='window.utilities.openItem(window.utilities.settings.dumpPath.val || path.join(remote.app.getPath(\x22documents\x22), \x22KrunkerResourceDump\x22), true)' class='menuLink'>Open</a></span>" + generateSetting("url", "dumpPath", this, "Resource Dump Output Path")
			},
			debugMode: {
				name: "Debug Mode",
				pre: "<div class='setHed customUtility'>Debugging</div>",
				val: false,
				html: () => generateSetting("checkbox", "debugMode", this)
			}
		};
		const inject = () => {
			window.windows[0].getCSettings = function () { // WILL ONLY WORK FOR 1.8.3+
				var tmpHTML = "";
				for (var key in window.utilities.settings) {
					if (window.utilities.settings[key].noShow) continue;
					if (window.utilities.settings[key].pre) tmpHTML += window.utilities.settings[key].pre;
					tmpHTML += "<div class='settName' id='" + key + "_div' style='display:" + (window.utilities.settings[key].hide ? 'none' : 'block') + "'>" + window.utilities.settings[key].name +
						" " + window.utilities.settings[key].html() + "</div>";
				}
				tmpHTML += `
	              <br>
	              <a onclick='window.utilities.clearCache()' class='menuLink'>Clear Cache</a>
	              |
				  <a onclick='window.utilities.resetSettings()' class='menuLink'>Reset Addons</a>
				  |
				  <a onclick='window.utilities.relaunchClient()' class='menuLink'>Relaunch Client</a>
				  |
				  <a onclick='remote.shell.openItem(path.join(remote.app.getPath("appData"), remote.app.getName()))' class='menuLink'>Open appData</a>
				  |
				  <a onclick='remote.shell.openItem(path.join(remote.app.getPath("documents"), "/KrunkerResourceSwapper"), true)' class='menuLink'>Open Resource Swapper<\a>
	           `;
				return tmpHTML;
			};
		}
		function generateSetting(type, name, object, extra, autoSave = true) {
			switch (type) {
				case 'checkbox': return `<label class="switch"><input type="checkbox" ${autoSave ? `onclick="window.utilities.setSetting('${name}', this.checked)"` : ""} ${object.settings[name]['val'] ? 'checked' : ''}><span class="slider"></span></label>`;
				case 'slider': return `<input type="number" class="sliderVal" id="slid_input_utilities_${name}"\nmin="${object.settings[name]['min']}" max="${object.settings[name]['max']}" value="${object.settings[name]['val']}" ${autoSave ? `onkeypress="window.delayExecuteClient(\x27${name}\x27, this)"` : ""} style="border-width:0px"/>\n<div class="slidecontainer">\n<input type="range" id="slid_utilities_${name}" min="${object.settings[name]['min']}" max="${object.settings[name]['max']}" step="${object.settings[name]['step']}"\nvalue="${object.settings[name]['val']}" class="sliderM" ${autoSave ? `oninput="window.utilities.setSetting(\x27${name}\x27, this.value)"` : ""}></div>`;
				case 'select':
					let temp = `<select ${autoSave ? `onchange="window.utilities.setSetting(\x27${name}\x27, this.value)"` : ""} class="inputGrey2">`;
					for (let option in extra) temp += '<option value="' + option + '" ' + (option == object.settings[name]['val'] ? 'selected' : '') + '>' + extra[option] + '</option>';
					return temp += '</select>';
				default: return `<input type="${type}" name="${type}" id="slid_utilities_${name}"\n${'color' == type ? 'style="float:right;margin-top:5px"' : `class="inputGrey2" placeholder="${extra}"`}\nvalue="${object.settings[name]['val']}" ${autoSave ? `oninput="window.utilities.setSetting(\x27${name}\x27, this.value)"` : ""}/>`;
			}
		}
		let waitForWindows = setInterval(_ => {
			if (window.windows) {
				inject();
				clearInterval(waitForWindows);
			}
		}, 100);
		this.setupSettings();
	}

	setupSettings() {
		for (const key in this.settings) {
			if (!this.settings[key].disabled) {
				var tmpVal = config.get(`utilities_${key}`, null);
				this.settings[key].val = tmpVal !== null ? tmpVal : this.settings[key].val;
				if (this.settings[key].val == "false") this.settings[key].val = false;
				if (this.settings[key].set) this.settings[key].set(this.settings[key].val, true);
			}
		}
	}

	createWatermark() {
		const el = document.createElement("div");
		el.id = "watermark";
		el.style.position = "absolute";
		el.style.color = "rgba(0,0,0, 0.3)";
		el.style.bottom = "0";
		el.style.left = "20px";
		el.style.fontSize = "6pt";
		el.innerHTML = "Custom Krunker.io Client v" + remote.app.getVersion();
		gameUI.appendChild(el);
	}

	resetSettings() {
		if (confirm("Are you sure you want to reset all your client addons? This will also refresh the page")) {
			Object.keys(config.store).filter(x => x.includes("utilities_")).forEach(x => config.delete(x));
			location.reload();
		}
	}

	clearCache() {
		if (confirm("Are you sure you want to clear your cache? This will also refresh the page")) {
			// rimraf(CACHE_PATH, () => {
			// 	alert("Cache cleared");
			// 	remote.app.relaunch();
			// 	remote.app.exit();
			// })

			// Clear cache fix
			remote.getCurrentWindow().webContents.session.clearCache().then(() => {
				alert("Cache cleared");
				remote.app.relaunch();
				remote.app.exit();
			})
		}
	}

	// Newer function
	setSetting(name, value) {
		this.settings[name].val = value;
		config.set(`utilities_${name}`, value);
		if (document.getElementById(`slid_utilities_${name}`)) document.getElementById(`slid_utilities_${name}`).value = value;
		if (document.getElementById(`slid_input_utilities_${name}`)) document.getElementById(`slid_input_utilities_${name}`).value = value;

		if (this.settings[name].set) this.settings[name].set(value);
	}

	fixMenuSettings() {
		[...document.querySelectorAll(".menuItemIcon")].forEach(el => el.style.height = "60px");
	}

	relaunchClient(options = {}) {
		remote.app.relaunch(options)
		remote.app.exit(0)
	}

	openItem(fullpath, dir = false, allowMake = true) {
		if (allowMake && !fs.existsSync(fullpath)) {
			!fs.existsSync(path.dirname(fullpath)) && fs.mkdirSync(path.dirname(fullpath), { recursive: true })
			dir ? fs.mkdirSync(fullpath) : fs.writeFileSync(fullpath, "")
		}
		remote.shell.showItemInFolder(path.resolve(fullpath))
	}

	generateStyle(text, id) {
		let newElement = document.createElement("style")
		newElement.id = id
		newElement.innerHTML = text
		return newElement
	}

	flattenObject(obj, prefix = '') {
		return Object.keys(obj).reduce((acc, cur) => {
			const pre = prefix.length ? prefix + '.' : ''
			if (obj[cur] && obj[cur].constructor.name == "Object") Object.assign(acc, this.flattenObject(obj[cur], pre + cur))
			else acc[pre + cur] = obj[cur]
			return acc
		}, {})
	}

	initConsts() {
		// CSS stuff used by utilities
		Object.entries(consts.css).forEach(entry => consts.css[entry[0]] = this.generateStyle(entry[1]))
		this.consts.css = consts.css
	}

	// waitGameInit() {
	// 	if (window.hasOwnProperty("windows")) {
	// 		// FPS Limit
	// 		const requestAnimFrameOrig = requestAnimFrame
	// 		let lastTime = 0
	// 		requestAnimFrame = function () {
	// 			if (utilities && utilities.settings.frameLimit.val > 0) {
	// 				for (let i = 0; i < Number.MAX_SAFE_INTEGER && performance.now() - lastTime < 1000 / utilities.settings.frameLimit.val; i++) { }
	// 				lastTime = performance.now()
	// 			}
	// 			requestAnimFrameOrig(...arguments)
	// 		}
	// 	} else setTimeout(() => this.waitGameInit(), 400)
	// }

	onLoad() {
		this.initConsts()
		this.fixMenuSettings();
		this.createWatermark();
		this.createSettings();

		window.remote = remote
		window.path = require("path")
		window.timeouts = {}
		window.delayExecuteClient = function (name, object, delay = 600) {
			return clearTimeout(timeouts[name]), timeouts[name] = setTimeout(function () {
				window.utilities.setSetting(name, object['value']);
			}, delay), true;
		};
		// this.waitGameInit()


	}
}

module.exports = Utilities;
