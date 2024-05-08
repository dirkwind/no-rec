const host = "https://www.youtube.com";

function injection(host) {
  function log(...args) {
    console.log("no-rec:", ...args);
  }

  function makePath(path = "") {
    return `${host}/${path}`;
  }

  function repeatUntilTrue(func, interval = 100) {
    const inner = () => {
      if (!func()) setTimeout(inner, interval);
    };
    inner();
  }

  function hidePrimary() {
    log("Hiding primary element");
    const primary = document.getElementById("primary");
    if (primary != null && primary.className !== "") {
      primary.hidden = true;
      return true;
    }
    return false;
  }

  function showPrimary() {
    log("Showing primary element");
    const primary = document.getElementById("primary");
    if (primary != null) {
      primary.hidden = false;
      return true;
    }
    return false;
  }

  function hideRelated() {
    log("Hiding related element");
    const related = document.getElementById("related");
    if (related != null && related.className !== "") {
      related.hidden = true;
      return true;
    }
    return false;
  }

  function removeEndscreen() {
    setTimeout(() => {
      log("removing endscreen element");
      document
        .getElementsByClassName(
          "html5-endscreen ytp-player-content videowall-endscreen"
        )[0]
        .remove();
    }, 2000);
  }

  function listener() {
    const url = window.location.href;

    if (url === host || url === makePath("")) {
      log("Detected homepage");
      repeatUntilTrue(hidePrimary);
    } else if (url.startsWith(makePath("shorts"))) {
      log("Detected shorts page");
      window.location.href = makePath(`watch?v=${url.split("/").pop()}`);
      showPrimary();
      repeatUntilTrue(hideRelated);
      removeEndscreen();
    } else if (url.startsWith(makePath("watch"))) {
      log("Detected watch page");
      showPrimary();
      repeatUntilTrue(hideRelated);
      removeEndscreen();
    }
  }

  window.addEventListener("popstate", listener);
  listener();
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  const tab = await chrome.tabs.get(tabId);

  if (info.status !== "complete" || !tab.url.startsWith(host)) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injection,
    args: [host],
  });
});
