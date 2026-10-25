
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
        justification: "adSwap needs the hidden page to play replacement audio while Spotify is interrupted."
    });
}

chrome.runtime.onMessage.addListener(async (message) => {
    // Ignore messages that have already been forwarded.
    if (message.target === "offscreen") {
        return;
    }

    // Only handle audio commands.
    if (message.action !== "PLAY_AUDIO" &&
        message.action !== "STOP_AUDIO") {
        return;
    }

    try {
        await ensureOffscreenDocument();

        await chrome.runtime.sendMessage({
            action: message.action,
            target: "offscreen"
        });
    } catch (error) {
        console.error("adSwap audio error:", error);
    }
});
