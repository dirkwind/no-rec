function removeHomepage() {
    for (const element of document.getElementsByTagName("ytd-two-column-browse-results-renderer")) {
        element.remove()
    }
}

function removeRecommended() {
    document.getElementById("secondary").remove()

    setTimeout(() => {
        for (const element of document.getElementsByClassName("html5-endscreen")) {
            element.remove()
        }
    }, 1000)
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
    const tab = await chrome.tabs.get(tabId)
    
    if (info.status !== "complete" || !tab.url.startsWith("https://www.youtube.com/")) {
        return
    }

    let func

    if (tab.url === "https://www.youtube.com/") {
        func = removeHomepage
    } else if (tab.url.startsWith("https://www.youtube.com/watch")) {
        func = removeRecommended
    } else if (tab.url.startsWith("https://www.youtube.com/shorts/")) {
        chrome.tabs.update(tab.id, {url: `https://www.youtube.com/watch?v=${tab.url.split("/").pop()}`})
        func = removeRecommended
    } else {
        return
    }
    chrome.scripting.executeScript(
        {
            target: {tabId: tab.id},
            func: func
        }
    )
})