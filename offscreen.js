const player = document.getElementById("player");

console.log("adSwap offscreen audio player is ready");

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "PLAY_AUDIO") {
        player.currentTime = 0;

        player.play().catch((error) => {
            console.error("adSwap playback failed:", error);
        });
    }

    if (message.action === "STOP_AUDIO") {
        player.pause();
        player.currentTime = 0;
    }
});