
let adTabId = null;
let adSwapMutedTabId = null;

async function ensureOffscreenDocument() {
    const activeContexts = await chrome.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: [chrome.runtime.getURL("offscreen.html")]
    });

    if (activeContexts.length > 0) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification:
            "adSwap needs a hidden page to play replacement audio during Spotify advertisements."
    });
}

async function controlAudio(action) {
    try {
        await ensureOffscreenDocument();

        await chrome.runtime.sendMessage({
            action,
            target: "offscreen"
        });
    } catch (error) {
        console.error("[adSwap] Audio error:", error);
    }
}

async function muteSpotifyTab() {
    const tabs = await chrome.tabs.query({
        url: "https://open.spotify.com/*"
    });

    const spotifyTab = tabs.find(tab => tab.active) || tabs[0];

    if (!spotifyTab || spotifyTab.id === undefined) {
        console.warn("[adSwap] Spotify tab not found");
        return;
    }

    adTabId = spotifyTab.id;

    // Preserve the user's existing mute state.
    if (spotifyTab.mutedInfo?.muted) {
        console.log("[adSwap] Spotify was already muted");
        return;
    }

    await chrome.tabs.update(adTabId, {
        muted: true
    });

    adSwapMutedTabId = adTabId;
    console.log("[adSwap] Spotify tab muted");
}
async function restoreSpotifyTab() {
    console.log(
        "[adSwap] Restore requested. Muted tab ID:",
        adSwapMutedTabId
    );

    if (adSwapMutedTabId === null) {
        console.warn("[adSwap] No tab recorded for restoration");
        return;
    }

    const tabId = adSwapMutedTabId;

    try {
        // Explicitly request that Chrome unmute the tab.
        await chrome.tabs.update(tabId, {
            muted: false
        });

        // Read the tab state again to verify the change.
        const tab = await chrome.tabs.get(tabId);

        console.log(
            "[adSwap] Mute state after restoration:",
            tab.mutedInfo?.muted
        );

        if (tab.mutedInfo?.muted) {
            console.error("[adSwap] Tab is still muted after restoration");
        } else {
            console.log("[adSwap] Spotify tab unmuted successfully");
        }
    } catch (error) {
        console.error("[adSwap] Failed to restore Spotify audio:", error);
    } finally {
        adSwapMutedTabId = null;
        adTabId = null;
    }
}

let transitionQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((message) => {
    console.log("[adSwap background] Received message:", message);

    // Keep the rest of your listener unchanged.
    if (message.target === "offscreen") {
        return;
    }

    if (
        message.action !== "PLAY_AUDIO" &&
        message.action !== "STOP_AUDIO"
    ) {
        return;
    }

    transitionQueue = transitionQueue
        .then(async () => {
            if (message.action === "PLAY_AUDIO") {
                await muteSpotifyTab();
                await controlAudio("PLAY_AUDIO");
            } else {
                console.log("[adSwap background] Processing STOP_AUDIO");
                await controlAudio("STOP_AUDIO");
                await restoreSpotifyTab();
            }
        })
        .catch(error => {
            console.error("[adSwap] Audio transition failed:", error);
        });
});
