const host = "https://www.youtube.com/";

function makePath(path = "") {
  return `${host}${path}`;
}

function removeHomepage() {
  for (const element of document.getElementsByTagName(
    "ytd-two-column-browse-results-renderer"
  )) {
    element.remove();
  }
}

function removeRecommended() {
  document.getElementById("related").remove();

  // timeout because apparently the endscreen isn't loaded immediately
  setTimeout(() => {
    document
      .getElementsByClassName(
        "html5-endscreen ytp-player-content videowall-endscreen"
      )[0]
      .remove();
  }, 2000);
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  const tab = await chrome.tabs.get(tabId);

  if (info.status !== "complete" || !tab.url.startsWith(host)) {
    return;
  }

  let func;

  if (tab.url === host) {
    func = removeHomepage;
  } else if (tab.url.startsWith(makePath("watch"))) {
    func = removeRecommended;
  } else if (tab.url.startsWith(makePath("shorts"))) {
    chrome.tabs.update(tab.id, {
      url: makePath(`watch?v=${tab.url.split("/").pop()}`),
    });
    func = () => setTimeout(removeRecommended, 5000);
  } else {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func,
  });
});
