
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
    const tab = await chrome.tabs.get(tabId)
    
    if (info.status !== "complete" || !tab.url.startsWith("https://www.youtube.com/")) {
        return
    }

    let func

    if (tab.url === "https://www.youtube.com/") {
        func = () => {
            for (const element of document.getElementsByTagName("ytd-two-column-browse-results-renderer")) {
                element.remove()
            }
        }
    } else if (tab.url.startsWith("https://www.youtube.com/watch")) {
        func = () => {
            document.getElementById("secondary").remove()
        }
    } else if (tab.url.startsWith("https://www.youtube.com/shorts/")) {
        chrome.tabs.update(tab.id, {url: `https://www.youtube.com/watch?v=${tab.url.split("/").pop()}`})
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