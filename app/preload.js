require("./log.js")
const { remote, ipcRenderer } = require('electron');
const gameWindow = remote.getCurrentWindow();
const consts = require('./constants.js');
const Store = require('electron-store');
const config = new Store();
const Utilities = require('./utilities.js');

console.log(__filename)

const initIPC = () => {
	window.prompt = (text) => ipcRenderer.sendSync('prompt', {
		type: 'text',
		data: text
	});

	ipcRenderer.on('esc', () => {
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		document.exitPointerLock();
	});
	ipcRenderer.on('ACTIVITY_JOIN_REQUEST', (event, data) => {
		window.rp.insertNotification(data.user);
	});
	ipcRenderer.on('ACTIVITY_INVITE', (event, data) => {
		window.rp.insertNotification(data.user, data.type, data.activity.session_id, data.channel_id, data.message_id);
	});
	ipcRenderer.on('log', console.log);
};
initIPC();

const isDiscordRPCEnabled = !config.get("utilities_disableDiscordRPC")

const RichPresence = window.rp = isDiscordRPCEnabled ? {

	init() {
		this.gameInfo = [];
		this.getGameInfo();
		setInterval(() => {
			RichPresence.update();
		}, 15e3);
		if (location.href.isGame()) {
			setInterval(() => {
				RichPresence.getGameInfo();
			}, 25000);
		}
	},
		getGameInfo() {
		if (!(this.info && this.info.id) || this.isIdle() || !gameWindow.rpc.isConnected) return;
		fetch('https://matchmaker.krunker.io/game-info?game=' + this.info.id)
			.then(res => res.json())
			.then(json => {
				this.gameInfo = json;
			})
			.catch(console.warn);
	},
		isIdle() {
		return instructionHolder.innerText.includes('Try seeking a new game');
	},
		update() {
		if (!gameWindow.rpc.isConnected) return;
		if (location.href.isEditor()) return this.sendEditor();
		if (location.href.isViewer()) return this.sendOther(3, 'browsing viewer');
		if (location.href.isSocial()) return this.sendOther(2, 'browsing social');
		if (location.href.isGame()) return this.isIdle() ? this.sendOther(0, 'idle') : this.sendGame();
	},
		sendEditor() {
		let mapN = document.querySelectorAll('div[class="c"]')[0].firstElementChild.value;
		let activity = {
			largeImageKey: 'icon',
			details: "Map Editor",
			state: "Working on '" + mapN + "'",
			instance: false
		};
		gameWindow.rpc.setActivity2(1, activity);
	},
		sendGame() {
		this.info = window.getGameActivity();
		if (!this.info || !this.info.mode) return this.sendOther(0, 'in the menu');
		let activity = {
			largeImageKey: 'icon',
			largeImageText: this.info.user,
			instance: true
		};
		if (this.info.time) activity.endTimestamp = Math.floor(Date.now() / 1000) + this.info.time;
		if (this.info.id) {
			activity.partyId = this.info.id;
			activity.joinSecret = location.hostname + '|join|' + this.info.id;
		}
			if (this.info.class.index) {
			activity.smallImageKey = 'icon_' + this.info.class.index;
			activity.smallImageText = this.info.class.name;
		}
		if (this.gameInfo.length && this.gameInfo[2] != undefined && this.gameInfo[3] != undefined) {
			activity.partySize = this.gameInfo[2];
			activity.partyMax = this.gameInfo[3];
		}

		activity.state = (this.info.custom ? 'Custom Match' : 'Public Match')
		activity.details = this.info.mode + " on " + this.info.map;
		gameWindow.rpc.setActivity2(0, activity);
	},
		sendOther(win, txt) {
		gameWindow.rpc.setActivity2(win, {
			details: txt,
			largeImageKey: 'icon',
			instance: false
		});
	},
		sendIgnore(user) {
		gameWindow.rpc.closeJoinRequest(user);
	},
		sendAccept(user, type, session, channel, message) {
		if (type != undefined) {
			gameWindow.rpc.request('ACCEPT_ACTIVITY_INVITE', {
				"user_id": user,
				"type": type,
				"session_id": session,
				"channel_id": channel,
				"message_id": message
			});
		} else gameWindow.rpc.sendJoinInvite(user);
	},

	insertNotification(user, type, session, channel, message) {
		if (this.gameInfo.length && this.gameInfo[2] == this.gameInfo[3] && type != undefined) return this.sendIgnore(user);
		for (chatList.innerHTML += `<div class='chatItem'>${user.username} ${type == undefined ? 'wants to join':'invited you'} <span class='chatMsg'>
        <input onclick='window.rp.sendAccept(${user.id}, ${type}, ${session}, ${channel}, ${message}); this.parentNode.innerHTML = "Accepted";' type='button' value='Accept' style='color: #9eeb56; border: none; background-color: #ffffff22; border-radius: 3px'>
        <input onclick='window.rp.sendIgnore(${user.id}); this.parentNode.innerHTML = "Declined";' type='button' value='Decline' style='color: #eb5656; border: none; background-color: #ffffff22; border-radius: 3px'></span></div><br/>`; chatList.scrollHeight >= 250;) chatList.removeChild(chatList.childNodes[0])
	}
} : null;

document.addEventListener("DOMContentLoaded", () => {
	if (isDiscordRPCEnabled) RichPresence.init();

	if (location.href.isGame()) {
		window.utilities = new Utilities();

		// Custom CSS for utilities
		let customUtilityCSS = document.createElement("style")
		customUtilityCSS.innerHTML = `.customUtility {
			color: #7847ff;
		}`
		document.head.appendChild(customUtilityCSS)

		// Server Browser refresh button
		window.refreshServers = () => {
			let serverBrowser = windows.find(window => window.hasOwnProperty("serverListData"))
			serverBrowser.lastLoadTime = 0
			serverBrowser.loadData()
		}
		new MutationObserver(() => {
			if (document.getElementById("serverFilters")) menuWindow.getElementsByClassName("menuLink")[0].insertAdjacentHTML("afterend", ` | <a class="menuLink" onclick="refreshServers()">Refresh</a>`)
		}).observe(windowHeader, { childList: true })

	} else if (location.href.isEditor()) {
		window.onbeforeunload = null;
	} else if (location.href.isSocial()) {
		// CSS used in utilities
		let newUtilityCSS = document.createElement("style")
		newUtilityCSS.innerHTML = `${config.get("utilities_customFontsCSSFix", true) ? consts.css.customFontsFix : ""}
		${config.get("utilities_hideAds", true) ? consts.css.hideAds : ""}`
		document.head.appendChild(newUtilityCSS)

		// Jump to user
		let userJumpInput = document.createElement("input")
		userJumpInput.id = "userJump"
		userJumpInput.placeholder = "Jump to user..."
		userJumpInput.addEventListener("keydown", event => {
			if (!event.isComposing && event.key == "Enter") {
				location.search = `?p=profile&q=${event.target.value}`
			}
		})
		navButtons.appendChild(userJumpInput)

		// CSS for Social window
		let socialCSS = document.createElement("style")
		socialCSS.innerHTML = `#userJump {
			width: 140px;
			padding: 10px;
			font-size: 20px;
			border-radius: 8px;
			border: none;
		}`
		document.head.appendChild(socialCSS)
	}
}, false);