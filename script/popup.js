chrome.storage.local.get("videoPlayerSize", (content) => {
	if (content.videoPlayerSize !== undefined) {
		document.querySelector("select[name=\"video-player-size\"] option[value=\"" + content.videoPlayerSize + "\"]").setAttribute("selected", "");
	}
});

chrome.storage.local.get("iconType", (content) => {
	if (content.iconType !== undefined) {
		document.querySelector("select[name=\"icon-type\"] option[value=\"" + content.iconType + "\"]").setAttribute("selected", "");
	}
});

document.querySelector("select[name=\"video-player-size\"]").addEventListener("change", () => {
	chrome.storage.local.set({ videoPlayerSize: document.querySelector("select[name=\"video-player-size\"]").value });
});

document.querySelector("select[name=\"icon-type\"]").addEventListener("change", () => {
	chrome.storage.local.set({ iconType: document.querySelector("select[name=\"icon-type\"]").value });
});