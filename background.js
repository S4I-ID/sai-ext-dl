const enabledTabs = new Set();

async function setEnabled(tabId, enabled) {
    await browser.action.setIcon({
        tabId,
        path: {
            48: enabled
                ? "icons/active.svg"
                : "icons/inactive.svg"
        }
    });

    await browser.action.setTitle({
        tabId,
        title: enabled
            ? "Sai's Image Downloader: ON"
            : "Sai's Image Downloader: OFF"
    });

    await browser.tabs.sendMessage(tabId, {
        type: "set-enabled",
        enabled: enabled
    });
}

function isAllowedSite(url) {
    return url.toString().includes("x.com")
}

browser.action.onClicked.addListener(async (tab) => {
    if (!tab || !tab.id || !isAllowedSite(tab.url)) {
        return;
    }

    const enabled = !enabledTabs.has(tab.id);

    if (enabled) {
        enabledTabs.add(tab.id);
    } else {
        enabledTabs.delete(tab.id);
    }

    await setEnabled(tab.id, enabled);
});

browser.runtime.onMessage.addListener(async (message) => {
    if (message.type !== "download-image") {
        return;
    }

    if (!message.url) {
        return;
    }

    await browser.downloads.download({
        url: message.url,
        filename: message.name,
        saveAs: false
    });
});

browser.tabs.onRemoved.addListener((tabId) => {
    enabledTabs.delete(tabId);
});
