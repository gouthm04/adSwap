
console.log("[adSwap] Spotify detector started");

let previousResult = "";
let previousAdState = false;
let adSwapEnabled = false;



// Receive checkbox changes from the popup.
chrome.runtime.onMessage.addListener((message) => {
    if (message.action !== "SET_ENABLED") {
        return;
    }

    adSwapEnabled = message.enabled;
    console.log("[adSwap] Received enabled setting:", adSwapEnabled);

    if (adSwapEnabled) {
        startDetection();
    } else {
        stopDetection();
    }
});

function detectSpotifyContent() {
    const player = document.querySelector(
        'aside[aria-label="Now playing bar"]'
    );

    if (!player) {
        return;
    }

    const playerText = player.innerText;

    const adDetected =
        /\bAdvertisement\s*[·•]/i.test(playerText);

    if (adDetected !== previousAdState) {
        previousAdState = adDetected;

        if (adSwapEnabled) {
            chrome.runtime.sendMessage({
                action: adDetected ? "PLAY_AUDIO" : "STOP_AUDIO"
            }).catch(error => {
                console.error("[adSwap] Audio message failed:", error);
            });
        }

        console.log("[adSwap] Ad detected:", adDetected);
    }

    const titleElement = player.querySelector(
        'span[data-encore-id="text"]'
    );

    const playPauseButton = player.querySelector(
        '[data-testid="control-button-playpause"]'
    );

    const title = titleElement?.innerText.trim() || "Unknown";
    const buttonLabel = playPauseButton?.getAttribute("aria-label");

    const playbackState =
        buttonLabel === "Pause" ? "Playing" :
        buttonLabel === "Play" ? "Paused" :
        "Unknown";

    const result = {
        title,
        playbackState,
        isAdvertisement: adDetected
    };

    const resultKey = JSON.stringify(result);

    if (resultKey !== previousResult) {
        console.log("[adSwap] Detection result:", result);
        previousResult = resultKey;
    }
}


let detectionInterval = null;

function startDetection() {
    if (detectionInterval !== null) {
        return; // Already running
    }

    console.log("[adSwap] Detection started");
    detectSpotifyContent();

    detectionInterval = setInterval(detectSpotifyContent, 3000);
}

function stopDetection() {
    if (detectionInterval === null) {
        return; // Already stopped
    }

    clearInterval(detectionInterval);
    detectionInterval = null;

    previousAdState = false;
    previousResult = "";

    console.log("[adSwap] Detection stopped");

    chrome.runtime.sendMessage({
        action: "STOP_AUDIO"
    }).catch(() => {});
}

// Start or stop detection based on the saved setting.
chrome.storage.local.get(
    { enabled: true },
    function (settings) {
        adSwapEnabled = settings.enabled;

        if (adSwapEnabled) {
            startDetection();
        } else {
            stopDetection();
        }
    }
);