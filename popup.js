
const toggle = document.getElementById("enabled");
const status = document.getElementById("status");

// Read the saved setting when the popup opens.
chrome.storage.local.get(
    { enabled: true },
    function (settings) {
        toggle.checked = settings.enabled;
        updateStatus(settings.enabled);
    }
);

// Save the setting whenever the checkbox changes.
toggle.addEventListener("change", function () {
    const enabled = toggle.checked;

    chrome.storage.local.set({ enabled: enabled });
    updateStatus(enabled);

    // Tell the content script that the setting changed.
    chrome.tabs.query(
        { url: "https://open.spotify.com/*" },
        function (tabs) {
            for (const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {
                    action: "SET_ENABLED",
                    enabled: enabled
                }).catch(() => {});
            }
        }
    );
});

function updateStatus(enabled) {
    status.textContent = enabled
        ? "AdSwap is enabled"
        : "AdSwap is disabled";
}


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
