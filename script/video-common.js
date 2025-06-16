/*
 * The video auto playback canceling feature is based on "niconico-autoplay-canceler", licensed under the MIT license.
 * Copyright (c) 2024 DNEK
 * Source code: https://github.com/dnek/nicovideo-autoplay-canceler
 * Lisence document: https://opensource.org/license/mit
 */

let niconicoClassicCurrentUri, niconicoClassicPreviousUri, niconicoClassicPageType;
let niconicoClassicVideoRankingDefaultType = "custom";
let niconicoClassicVideoId, niconicoClassicVideoAutoPlayback = true, niconicoClassicVideoAutoPlaybackIsCanceled = false;

const NICONICO_CLASSIC_WARIKOMI_TIMES = [{ hour: 0, minute: 0, second: 0 }, { hour: 2, minute: 0, second: 0 }, { hour: 19, minute: 0, second: 0 }];
const NICONICO_CLASSIC_WARIKOMI_IMAGES_SOURCE = [chrome.runtime.getURL("image/warikomi/logo.png"), chrome.runtime.getURL("image/warikomi/000.png"), chrome.runtime.getURL("image/warikomi/200.png"), chrome.runtime.getURL("image/warikomi/1900.png")];
const NICONICO_CLASSIC_WARIKOMI_CHIMES_SOURCE = [chrome.runtime.getURL("sound/warikomi/000.wav"), chrome.runtime.getURL("sound/warikomi/200.wav") ,chrome.runtime.getURL("sound/warikomi/1900.wav")];
let niconicoClassicWarikomiEnabled = false, niconicoClassicWarikomiInterval;

chrome.storage.local.get("videoWatchPageLayout", (content) => { if (content.videoWatchPageLayout !== undefined && content.videoWatchPageLayout !== "") document.body.classList.add("niconico-classic_video-watch-page-layout-is-" + content.videoWatchPageLayout); });
chrome.storage.local.get("videoPlayerSize", (content) => { if (content.videoPlayerSize !== undefined && content.videoPlayerSize !== "" && content.videoPlayerSize !== "variable") document.body.classList.add("niconico-classic_video-player-size-is-fixed", "niconico-classic_video-player-width-is-" + content.videoPlayerSize); });
chrome.storage.local.get("videoPlayerOverlayIcon", (content) => { if (content.videoPlayerOverlayIcon !== "shown") document.body.classList.add("niconico-classic_video-player-overlay-icon-is-hidden"); });
chrome.storage.local.get("videoAutoPlayback", (content) => { if (content.videoAutoPlayback !== "true") niconicoClassicVideoAutoPlayback = false; });
chrome.storage.local.get("videoRankingAlign", (content) => { if (content.videoRankingAlign !== "left") document.body.classList.add("niconico-classic_video-ranking-align-is-center"); });
chrome.storage.local.get("videoRankingThumbnailSize", (content) => { if (content.videoRankingThumbnailSize !== "large") document.body.classList.add("niconico-classic_video-ranking-thumbnail-size-is-medium"); });
chrome.storage.local.get("videoRankingDefaultType", (content) => { if (content.videoRankingDefaultType !== undefined && content.videoRankingDefaultType !== "") niconicoClassicVideoRankingDefaultType = content.videoRankingDefaultType; });
chrome.storage.local.get("videoWarikomi", (content) => { if (content.videoWarikomi === "true") niconicoClassicWarikomiEnabled = true; });

setInterval(() => {
	niconicoClassicCurrentUri = window.location.pathname;
	
	if (niconicoClassicPreviousUri !== niconicoClassicCurrentUri) {
		niconicoClassicPreviousUri = niconicoClassicCurrentUri;

		if (niconicoClassicPageType !== niconicoClasicCheckPageType(niconicoClassicCurrentUri)) {
			niconicoClassicPageType = niconicoClasicCheckPageType(niconicoClassicCurrentUri);
			document.body.setAttribute("data-niconico-classic", niconicoClassicPageType);
			niconicoClassicInsertHidariueImage();
		}
	}

	if (niconicoClassicVideoRankingDefaultType !== "default") {
		let niconicoClassicVideoRankingLinkUrl, niconicoClassicVideoRankingDefaultTypeName;

		if (niconicoClassicVideoRankingDefaultType === "for-you") {
			niconicoClassicVideoRankingLinkUrl = "/ranking/for_you";
			niconicoClassicVideoRankingDefaultTypeName = "For you";
		} else {
			niconicoClassicVideoRankingLinkUrl = "/ranking/" + niconicoClassicVideoRankingDefaultType;

			switch (niconicoClassicVideoRankingDefaultType) {
				case "genre": niconicoClassicVideoRankingDefaultTypeName = "総合"; break;
				case "custom": niconicoClassicVideoRankingDefaultTypeName = "カスタム"; break;
			}
		}

		if (document.querySelector(`.simplebar-content a[href^="/ranking"]:not(.niconico-classic_video-simplebar-link)`)) {
			const NICOCNICO_CLASSIC_VIDEO_SIMPLEBAR_RANKING_LINK_ELEMENT = document.querySelector(`.simplebar-content a[href^="/ranking"]`);

			NICOCNICO_CLASSIC_VIDEO_SIMPLEBAR_RANKING_LINK_ELEMENT.insertAdjacentHTML(
				"afterend",
				`<a class="niconico-classic_video-simplebar-link" href="${niconicoClassicVideoRankingLinkUrl}"><svg viewBox="0 0 24 24"><path d="m7 2-1.3249 1.3265 3.6735 3.6735h-4.8486c-1.385 0-2.5 1.115-2.5 2.5v10c0 1.385 1.115 2.5 2.5 2.5h15c1.385 0 2.5-1.115 2.5-2.5v-10c0-1.385-1.115-2.5-2.5-2.5h-4.8486l3.6735-3.6735-1.3249-1.3265-5 5zm-1.875 7.8125h6.25v2.8125h-1.875v-0.9375h-2.5v5.625h2.5v-0.9375h1.875v2.8125h-6.25v-7.5zm7.5 0h6.25v2.8125h-1.875v-0.9375h-2.5v1.25l4.375 1.875v4.375h-6.25v-2.8125h1.875v0.9375h2.5v-1.25l-4.375-1.875v-2.5z" /></svg><span><span>${niconicoClassicVideoRankingDefaultTypeName}</span><span>ランキング</span></span></a>`
			);

			NICOCNICO_CLASSIC_VIDEO_SIMPLEBAR_RANKING_LINK_ELEMENT.remove();
		}

		if (document.querySelector(`.nico-CommonHeaderRoot a[href^="https://www.nicovideo.jp/ranking"]:not(.niconico-classic_common-header-menu-link)`)) {
			const NICOCNICO_CLASSIC_COMMON_HEADER_RANKING_LINK_ELEMENT = document.querySelector(`.nico-CommonHeaderRoot a[href^="https://www.nicovideo.jp/ranking"]`);

			NICOCNICO_CLASSIC_COMMON_HEADER_RANKING_LINK_ELEMENT.insertAdjacentHTML(
				"afterend",
				`<a class="niconico-classic_common-header-menu-link" href="${niconicoClassicVideoRankingLinkUrl}"><span>動画ランキング<br />（${niconicoClassicVideoRankingDefaultTypeName}）</span><svg viewBox="0 0 24 24"><path d="M17.357 12a.498.498 0 01-.146.356l-8.29 8.29a.5.5 0 01-.708 0l-1.41-1.41a.5.5 0 010-.707L13.333 12l-6.53-6.53a.5.5 0 010-.707l1.41-1.41a.5.5 0 01.707 0l8.29 8.29a.499.499 0 01.147.357Z" fill-rule="evenodd" clip-rule="evenodd" /></svg></a>`
			);

			NICOCNICO_CLASSIC_COMMON_HEADER_RANKING_LINK_ELEMENT.remove();
		}
	}

	switch (niconicoClassicPageType) {
		case "video-watch":
			if (!niconicoClassicVideoAutoPlayback) niconicoClassicCancelVideoAutoPlayback();
			
			if (document.querySelector(`.grid-area_\\[bottom\\] h1`)) {
				if (!document.querySelector(`.grid-area_\\[player\\] > .w_\\[100dvw\\].h_\\[100dvh\\]`)) {
					document.body.style.setProperty("--niconico-classic-video-player-offset-height", document.querySelector(`.grid-area_\\[player\\]`).offsetHeight + "px");
					document.body.style.setProperty("--niconico-classic-video-player-offset-top", document.querySelector(`.grid-area_\\[bottom\\] > div.flex-wrap_wrap`).offsetTop + document.querySelector(`.grid-area_\\[bottom\\] > div.flex-wrap_wrap`).offsetHeight + 16 + "px");
					document.body.style.setProperty("--niconico-classic-video-sidebar-initial-offset-top", document.querySelector(`.grid-area_\\[bottom\\]`).offsetTop + document.querySelector(`.grid-area_\\[bottom\\]`).offsetHeight + 16 + "px");
				}

				if (niconicoClassicVideoId !== niconicoClassicCurrentUri.match(/[a-z]{2}\d+/)[0]) {
					niconicoClassicVideoId = niconicoClassicCurrentUri.match(/[a-z]{2}\d+/)[0];
					niconicoClassicVideoAutoPlaybackIsCanceled = false;
					document.querySelectorAll(`.niconico-classic_video-details-additional-link`).forEach((link) => { link.remove(); });
					niconicoClassicInsertHidariueImage();
					niconicoClassicAddScrollEventToVideoOwnerMenuButton();
				}

				niconicoClassicInsertVideoDetailsAdditionalLinks();
				if (niconicoClassicWarikomiEnabled && !document.querySelector(`#niconico-classic_video-player-marquee-wrapper`)) niconicoClassicSetWarikomi();
			} else {
				document.body.style.setProperty("--niconico-classic-nicovideo-content-margin-top", "24px");
			}

			break;
		case "video-ranking_for-you":
		case "video-ranking_genre":
		case "video-ranking_custom":
			break;
	}

	if (niconicoClassicPageType !== "video-watch") clearInterval(niconicoClassicWarikomiInterval); 
}, 10);

const NICONICO_CLASSIC_VIDEO_COMMON_MUTATION_OBSERVER = new MutationObserver(() => {
	if (document.querySelector(`#niconico-classic_hidariue`) === null) niconicoClassicInsertHidariueImage();
});

function niconicoClasicCheckPageType(uri) {
	if (uri.match(/^\/watch\//)) {
		return "video-watch";
	} else if (uri.match(/^\/ranking/)) {
		if (uri.match(/^\/ranking\/genre/)) {
			return "video-ranking_genre";
		} else if (uri.match(/^\/ranking\/custom/)) {
			return "video-ranking_custom";
		} else {
			return "video-ranking_for-you";
		}
	} else {
		return "default";
	}
}

function niconicoClassicInsertHidariueImage() {
	if (document.querySelector(`a[data-anchor-area="web_header"][href="/video_top"]`)) {
		if (document.querySelector(`#niconico-classic_hidariue`)) {
			document.querySelector(`#niconico-classic_hidariue img`).setAttribute("src", "https://resource.video.nimg.jp/web/img/base/head/icon/nico/" + Math.floor(Math.random() * 100).toString().padStart(3, "0") + ".gif");
		} else {
			document.querySelector(`a[data-anchor-area="web_header"][href="/video_top"]`).insertAdjacentHTML(
				"beforebegin",
				`<a id="niconico-classic_hidariue" href="/hidariue" target="_blank"><img src="https://resource.video.nimg.jp/web/img/base/head/icon/nico/${Math.floor(Math.random() * 100).toString().padStart(3, "0")}.gif" alt="" /></a>`
			);
		}
	}
}

function niconicoClassicCancelVideoAutoPlayback() {
	const NICONICO_CLASSIC_VIDEO_PLAYER_PLAY_BUTTON_ELEMENT = document.querySelector(`.grid-area_\\[player\\] button:has(> svg > path[d="M21.17 10.6a1.6 1.6 0 0 1 0 2.8L6.31 20.85A1.6 1.6 0 0 1 4 19.44V4.56a1.6 1.6 0 0 1 2.31-1.4z"])`);
	const NICONICO_CLASSIC_VIDEO_PLAYER_CONTEXT_TRIGGER_ELEMENT = document.querySelector(`.grid-area_\\[player\\] [data-part="context-trigger"]`);

	if (NICONICO_CLASSIC_VIDEO_PLAYER_PLAY_BUTTON_ELEMENT && !NICONICO_CLASSIC_VIDEO_PLAYER_PLAY_BUTTON_ELEMENT.dataset.niconicoClassicClicked) {
		NICONICO_CLASSIC_VIDEO_PLAYER_PLAY_BUTTON_ELEMENT.addEventListener("click", () => {
			if (niconicoClassicVideoAutoPlaybackIsCanceled) return;
			niconicoClassicVideoAutoPlaybackIsCanceled = true;
		});

		NICONICO_CLASSIC_VIDEO_PLAYER_PLAY_BUTTON_ELEMENT.dataset.niconicoClassicClicked = true;
	}

	if (NICONICO_CLASSIC_VIDEO_PLAYER_CONTEXT_TRIGGER_ELEMENT && !NICONICO_CLASSIC_VIDEO_PLAYER_CONTEXT_TRIGGER_ELEMENT.dataset.niconicoClassicClicked) {
		NICONICO_CLASSIC_VIDEO_PLAYER_CONTEXT_TRIGGER_ELEMENT.addEventListener("click", () => {
			if (niconicoClassicVideoAutoPlaybackIsCanceled) return;
			niconicoClassicVideoAutoPlaybackIsCanceled = true;
		});

		NICONICO_CLASSIC_VIDEO_PLAYER_CONTEXT_TRIGGER_ELEMENT.dataset.niconicoClassicClicked = true;
	}

	if (niconicoClassicPageType !== "video-watch" || niconicoClassicVideoAutoPlaybackIsCanceled) return;
	const NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT = document.querySelector(`video[data-name="video-content"]`);
	if (NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT === null || NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.paused || NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.ended) return;
	NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.pause();
	if (NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.currentTime < 3) NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.currentTime = 0;
	niconicoClassicVideoAutoPlaybackIsCanceled = true;
}

function niconicoClassicAddScrollEventToVideoOwnerMenuButton() {
	const NICONICO_CLASSIC_VIDEO_OWNER_MENU_BUTTON_ELEMENT = document.querySelector(`.grid-area_\\[bottom\\] .w_\\[var\\(--watch-owner-information-width\\)\\] button[data-watch-floating-panel]`);

	if(NICONICO_CLASSIC_VIDEO_OWNER_MENU_BUTTON_ELEMENT) {
		NICONICO_CLASSIC_VIDEO_OWNER_MENU_BUTTON_ELEMENT.addEventListener("click", () => {
			window.scrollTo({
				top: document.querySelector(`.grid-area_\\[player\\]`).getBoundingClientRect().top + window.pageYOffset - 160,
				behavior: "smooth"
			});
		});

		NICONICO_CLASSIC_VIDEO_OWNER_MENU_BUTTON_ELEMENT.setAttribute("data-event-added", "");
	}
}

function niconicoClassicInsertVideoDetailsAdditionalLinks() {
	if (document.querySelector(`section:has(header.h_var\\(--watch-collapsible-panel-header-height\\)) dl`) && !document.querySelector(`.niconico-classic_video-details-additional-link`)) {
		document.querySelector(`section:has(header.h_var\\(--watch-collapsible-panel-header-height\\)) dl + .d_flex:has(> .grid-template-areas_\\[_\\"icon_title\\"_\\"\\._data\\"_\\])`).insertAdjacentHTML(
			"beforeend",
			`<div class="niconico-classic_video-details-additional-link pedia"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6.94 7.82a.44.44 0 0 1-.44-.44v-.44a.44.44 0 0 1 .44-.44h10.12a.44.44 0 0 1 .44.44v.44a.44.44 0 0 1-.44.44h-3.74L12 9.14h4.18a.44.44 0 0 1 .44.44v7.48c0 .24-.2.44-.44.44H7.82a.44.44 0 0 1-.44-.44V9.58a.44.44 0 0 1 .44-.44H9.8l1.32-1.32zm2.86 5.72a.2.2 0 0 0-.22.22v2.2a.2.2 0 0 0 .22.22h4.4a.2.2 0 0 0 .22-.22v-2.2a.2.2 0 0 0-.22-.22zm0-3.08c-.12 0-.22.1-.22.22V12c0 .12.1.22.22.22h4.4c.12 0 .22-.1.22-.22v-1.32c0-.12-.1-.22-.22-.22z" clip-rule="evenodd"></path></svg><span>ニコニコ大百科</span><a href="https://dic.nicovideo.jp/v/${niconicoClassicVideoId}">この動画の動画記事</a></div><div class="niconico-classic_video-details-additional-link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 6h-3.89L12.3 3.99A3 3 0 0 0 10.07 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3"></path></svg><a href="https://www.nicovideo.jp/openlist/${niconicoClassicVideoId}">この動画を登録している公開マイリスト</a></div>`
		);
	}
}

function niconicoClassicSetWarikomi() {
	if (document.querySelector(`.grid-area_\\[player\\]`)) {
		document.querySelector(`.grid-area_\\[player\\]`).insertAdjacentHTML(
			"afterbegin",
			`<div id="niconico-classic_video-player-marquee-wrapper"><canvas id="niconico-classic_niconico-warikomi" width="1088" height="112"></canvas></div>`
		);

		const NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT = document.querySelector(`video[data-name="video-content"]`);
		const NICONICO_CLASSIC_WARIKOMI_ELEMENT = document.querySelector(`#niconico-classic_niconico-warikomi`);
		const NICONICO_CLASSIC_WARIKOMI_CONTEXT =  NICONICO_CLASSIC_WARIKOMI_ELEMENT.getContext("2d");
		let niconicoClassicWarikomiImagesLoaded = false, niconicoClassicWarikomiChimesLoaded = false, niconicoClassicVideoPlayingBeforeWarikomi = false;
		let niconicoClassicWarikomiLastAnnouncedTime = "", niconicoClassicWarikomiStartUnixTime;

		let niconicoClassicWarikomiImages = new Array(4);
		let niconicoClassicWarikomiLoadedImagesCount = 0;

		NICONICO_CLASSIC_WARIKOMI_IMAGES_SOURCE.forEach((image, index) => {
			niconicoClassicWarikomiImages[index] = new Image();
			niconicoClassicWarikomiImages[index].src = image;

			niconicoClassicWarikomiImages[index].onload = () => {
				niconicoClassicWarikomiLoadedImagesCount++;
				if (niconicoClassicWarikomiLoadedImagesCount >= 4) niconicoClassicWarikomiImagesLoaded = true;
			}
		});
		
		let niconicoClassicWarikomiChimes = new Array(3);
		let niconicoClassicWarikomiLoadedChimesCount = 0;

		NICONICO_CLASSIC_WARIKOMI_CHIMES_SOURCE.forEach((chime, index) => {
			niconicoClassicWarikomiChimes[index] = new Audio(chime);
			niconicoClassicWarikomiChimes[index].load();

			niconicoClassicWarikomiChimes[index].addEventListener("canplay", () => {
				niconicoClassicWarikomiLoadedChimesCount++;
				if (niconicoClassicWarikomiLoadedChimesCount >= 3) niconicoClassicWarikomiChimesLoaded = true;
			});
		});

		function niconicoClassicPadWarikomiTimeNumber(number) {
			return number.toString().padStart(2, "0");
		}

		function niconicoClassicCheckWarikomiTime() {
			const NICONICO_CLASSIC_WARIKOMI_NOW = new Date();
			const NICONICO_CLASSIC_WARIKOMI_NOW_STRING = `${niconicoClassicPadWarikomiTimeNumber(NICONICO_CLASSIC_WARIKOMI_NOW.getHours())}:${niconicoClassicPadWarikomiTimeNumber(NICONICO_CLASSIC_WARIKOMI_NOW.getMinutes())}:${niconicoClassicPadWarikomiTimeNumber(NICONICO_CLASSIC_WARIKOMI_NOW.getSeconds())}`;
			const NICONICO_CLASSIC_WARIKOMI_TIME_MATCHED = NICONICO_CLASSIC_WARIKOMI_TIMES.some(time => NICONICO_CLASSIC_WARIKOMI_NOW.getHours() === time.hour && NICONICO_CLASSIC_WARIKOMI_NOW.getMinutes() === time.minute && NICONICO_CLASSIC_WARIKOMI_NOW.getSeconds() === time.second);

			if (NICONICO_CLASSIC_WARIKOMI_TIME_MATCHED) {
				if (niconicoClassicWarikomiLastAnnouncedTime !== NICONICO_CLASSIC_WARIKOMI_NOW_STRING) {
					niconicoClassicWarikomiLastAnnouncedTime = NICONICO_CLASSIC_WARIKOMI_NOW_STRING;
					niconicoClassicWarikomiStartUnixTime = NICONICO_CLASSIC_WARIKOMI_NOW.getTime();
					NICONICO_CLASSIC_WARIKOMI_ELEMENT.classList.add("is-playing");

					if (NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.paused || NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.ended) {
						niconicoClassicVideoPlayingBeforeWarikomi = false;
					} else {
						niconicoClassicVideoPlayingBeforeWarikomi = true;
						NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.pause();
					}

					niconicoClassicPlayWarikomiAnimation();

					switch (niconicoClassicWarikomiLastAnnouncedTime) {
						case "19:00:00": niconicoClassicWarikomiChimes[2].play(); break;
						case "02:00:00": niconicoClassicWarikomiChimes[1].play(); break;
						default: niconicoClassicWarikomiChimes[0].play(); break;
					}
				}
			}
		}

		function niconicoClassicPlayWarikomiAnimation() {
			NICONICO_CLASSIC_WARIKOMI_CONTEXT.clearRect(0, 0, NICONICO_CLASSIC_WARIKOMI_ELEMENT.width, NICONICO_CLASSIC_WARIKOMI_ELEMENT.height);
			NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = 1;
			let niconicoClassicWarikomiElapsedMilliSeconds = Date.now() - niconicoClassicWarikomiStartUnixTime;

			if (100 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 1100) NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = (niconicoClassicWarikomiElapsedMilliSeconds - 100) / 1000;
			if (3300 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 4300) NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = 1 - ((niconicoClassicWarikomiElapsedMilliSeconds - 3300) / 1000);
			if (100 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 4300) NICONICO_CLASSIC_WARIKOMI_CONTEXT.drawImage(niconicoClassicWarikomiImages[0], (NICONICO_CLASSIC_WARIKOMI_ELEMENT.width - 560) / 2, 8, 560, 96);

			if (4750 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 5750) NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = (niconicoClassicWarikomiElapsedMilliSeconds - 4750) / 1000;

			if ((4750 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 10000) || (11000 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 12000) || (13000 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 15000)) {
				switch (niconicoClassicWarikomiLastAnnouncedTime) {
					case "19:00:00": NICONICO_CLASSIC_WARIKOMI_CONTEXT.drawImage(niconicoClassicWarikomiImages[3], (NICONICO_CLASSIC_WARIKOMI_ELEMENT.width - 368) / 2, 8, 368, 96); break;
					case "02:00:00": NICONICO_CLASSIC_WARIKOMI_CONTEXT.drawImage(niconicoClassicWarikomiImages[2], (NICONICO_CLASSIC_WARIKOMI_ELEMENT.width - 368) / 2, 8, 368, 96); break;
					default: NICONICO_CLASSIC_WARIKOMI_CONTEXT.drawImage(niconicoClassicWarikomiImages[1], (NICONICO_CLASSIC_WARIKOMI_ELEMENT.width - 368) / 2, 8, 368, 96); break;
				}
			}

			if (14000 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 14667) NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = (niconicoClassicWarikomiElapsedMilliSeconds - 14000) / 667;
			if (15333 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 16000) NICONICO_CLASSIC_WARIKOMI_CONTEXT.globalAlpha = 1 - ((niconicoClassicWarikomiElapsedMilliSeconds - 15333) / 667);
			
			if (14000 <= niconicoClassicWarikomiElapsedMilliSeconds && niconicoClassicWarikomiElapsedMilliSeconds < 16000) {
				NICONICO_CLASSIC_WARIKOMI_CONTEXT.fillStyle = "#FFFFFF";
				NICONICO_CLASSIC_WARIKOMI_CONTEXT.fillRect(0, 0, NICONICO_CLASSIC_WARIKOMI_ELEMENT.width, NICONICO_CLASSIC_WARIKOMI_ELEMENT.height);
			}
			
			if (niconicoClassicWarikomiElapsedMilliSeconds < 16000) {
				NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.pause();
				requestAnimationFrame(niconicoClassicPlayWarikomiAnimation);
			} else {
				NICONICO_CLASSIC_WARIKOMI_ELEMENT.classList.remove("is-playing");
				if (niconicoClassicVideoPlayingBeforeWarikomi) NICONICO_CLASSIC_VIDEO_PLAYER_VIDEO_CONTENT_ELEMENT.play();
			}
		}

		niconicoClassicWarikomiInterval = setInterval(() => {
			NICONICO_CLASSIC_WARIKOMI_ELEMENT.setAttribute("width", NICONICO_CLASSIC_WARIKOMI_ELEMENT.clientWidth * 2);
			if (niconicoClassicWarikomiImagesLoaded && niconicoClassicWarikomiChimesLoaded) niconicoClassicCheckWarikomiTime();
		}, 50);
	}
}

NICONICO_CLASSIC_VIDEO_COMMON_MUTATION_OBSERVER.observe(document.body, { childList: true });