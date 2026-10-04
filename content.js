let enabled = false;

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "set-enabled") {
        enabled = message.enabled;
    }
});

function getImageUrl(img) {
    return new URL(
        img.currentSrc ||
        img.src ||
        img.getAttribute("data-src") ||
        img.getAttribute("data-original")
    );
}

function getAuthorAnchor(div) {
    let current = div;

    for (let i = 0; i < 6; i++) {
        current = current.parentElement;

        const link = current.querySelector("a[href]")

        if (link) {
            return link;
        };
    }
    return null;
}

function handleClick(event) {
    if (!enabled) {
        return;
    }

    const target = event.target;

    const img = target instanceof Element
        ? target.closest("img")
        : null;

    if (!img) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const div = img.closest("div");

    if (!div) {
        return;
    }

    const imageUrl = getImageUrl(img);

    if (!imageUrl) {
        return;
    }

    imageUrl.searchParams.set("name", "4096x4096");

    const finalUrl = imageUrl.toString();

    const format = imageUrl.searchParams.get("format") ?? "";

    const author = getAuthorAnchor(div)?.href?.split("/")?.[3] || "unknown";

    const filename = author + "." + format;

    browser.runtime.sendMessage({
        type: "download-image",
        url: finalUrl,
        name: filename
    });
}

document.addEventListener("click", handleClick, true);
