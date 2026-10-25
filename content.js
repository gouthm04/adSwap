console.log("[adSwap] Spotify detector started");
let previousResult = "";

function detectSpotifyContent() {
    const player = document.querySelector(
        'aside[aria-label="Now playing bar"]'
    );

    if (!player) {
        console.log("[adSwap] Player not found");
        return;
    }

    const playerText = player.innerText;

    const isAdvertisement =
        /\bAdvertisement\s*[·•]/i.test(playerText);

    const titleElement = player.querySelector(
        'span[data-encore-id="text"]'
    );

    console.log("[adSwap] Debug:", {
        playerFound: Boolean(player),
        titleElementFound: Boolean(titleElement),
        titleText: titleElement?.innerText,
        matchingSpans: player
            ? [...player.querySelectorAll('span[data-encore-id="text"]')]
                .map(el => el.innerText.trim())
                .filter(Boolean)
            : []
    });

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
        isAdvertisement
    };

const resultKey = JSON.stringify(result);

if (resultKey !== previousResult) {
    console.log("[adSwap] Detection result:", result);
    previousResult = resultKey;
}
}

detectSpotifyContent();
setInterval(detectSpotifyContent, 3000);