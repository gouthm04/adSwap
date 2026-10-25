
const toggle = document.getElementById("enabled");
const status = document.getElementById("status");
const playAudio = document.getElementById("playAudio");
const stopAudio = document.getElementById("stopAudio");

toggle.addEventListener("change", function () {
    if (toggle.checked) {
        status.textContent = "AdSwap is enabled";
    } else {
        status.textContent = "AdSwap is disabled";
    }
});

playAudio.addEventListener("click", async () => {
    try {
        await chrome.runtime.sendMessage({
            action: "PLAY_AUDIO"
        });
        console.log("Play request sent");
    } catch (error) {
        console.error("Failed to send play request:", error);
    }
});

stopAudio.addEventListener("click", async () => {
    try {
        await chrome.runtime.sendMessage({
            action: "STOP_AUDIO"
        });
        console.log("Stop request sent");
    } catch (error) {
        console.error("Failed to send stop request:", error);
    }
});
