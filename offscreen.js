
const player = document.getElementById("player");

console.log("[adSwap offscreen] Audio player ready");

chrome.runtime.onMessage.addListener((message) => {
    // Only handle commands forwarded by background.js.
    if (message.target !== "offscreen") {
        return;
    }

    if (message.action === "PLAY_AUDIO") {
        player.currentTime = 0;

        player.play().catch((error) => {
            console.error("[adSwap offscreen] Playback failed:", error);
        });
    }

    if (message.action === "STOP_AUDIO") {
        player.pause();
        player.currentTime = 0;
    }
});
