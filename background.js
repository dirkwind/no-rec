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
  // wrap the function to call repeatedly if needed.
  const inner = () => {
    const related = document.getElementById("related");

    if (related == null) {
      // if we didn't find the "related" item, try again after 1 second
      setTimeout(inner, 1000);
      return;
    }
    related.remove();

    // do one more check to make sure "related" was removed
    // sometimes, "related" can be added again after being deleted
    setTimeout(() => {
      const related = document.getElementById("related");
      if (related != null) {
        inner();
      }
    }, 2000);

    // remove the endscreen after a delay (it doesn't load instantly)
    setTimeout(() => {
      document
        .getElementsByClassName(
          "html5-endscreen ytp-player-content videowall-endscreen"
        )[0]
        .remove();
    }, 2000);
  };
  inner();
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  const tab = await chrome.tabs.get(tabId);

  if (info.status !== "complete" || !tab.url.startsWith(host)) {
    return;
  }

  let func = () => {};

  if (tab.url === host) {
    func = removeHomepage;
  } else if (tab.url.startsWith(makePath("watch"))) {
    func = removeRecommended;
  } else if (tab.url.startsWith(makePath("shorts"))) {
    chrome.tabs.update(tab.id, {
      url: makePath(`watch?v=${tab.url.split("/").pop()}`),
    });
  } else {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func,
  });
});
