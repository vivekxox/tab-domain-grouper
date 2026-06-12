// Tab Domain Grouper — background service worker (Manifest V3)
//
// Behaviour when the toolbar icon is clicked:
//   1. Look at every tab in the current window.
//   2. Leave the tab you're currently on exactly as it is.
//   3. Leave pinned tabs and non-http(s) tabs (chrome://, etc.) as they are.
//   4. Group the rest by domain (hostname).
//   5. Any domain with 2+ tabs -> open one collection page listing them,
//      then close the originals.
//   6. Any domain with only 1 tab -> left alone.

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

chrome.action.onClicked.addListener(async (clickedTab) => {
  const windowId = clickedTab.windowId;
  const activeTabId = clickedTab.id; // the tab you were on when you clicked

  const tabs = await chrome.tabs.query({ windowId });

  // hostname -> { items: [{title, url}], tabIds: [], favIconUrl }
  const groups = {};

  for (const tab of tabs) {
    if (tab.id === activeTabId) continue; // leave the current tab as is
    if (tab.pinned) continue;             // leave pinned tabs alone

    const url = tab.url || tab.pendingUrl || "";
    if (!/^https?:\/\//i.test(url)) continue; // only real web pages

    const host = getHostname(url);
    if (!host) continue;

    if (!groups[host]) {
      groups[host] = { items: [], tabIds: [], favIconUrl: "" };
    }
    groups[host].items.push({ title: tab.title || url, url });
    groups[host].tabIds.push(tab.id);
    if (!groups[host].favIconUrl && tab.favIconUrl) {
      groups[host].favIconUrl = tab.favIconUrl;
    }
  }

  const collectedAt = Date.now();
  let createdPages = 0;

  for (const host of Object.keys(groups)) {
    const group = groups[host];
    if (group.items.length < 2) continue; // single tab for this domain -> leave it

    const id = `tdg_${collectedAt}_${host}_${Math.random().toString(36).slice(2, 8)}`;
    const data = {
      id,
      domain: host,
      collectedAt,
      favIconUrl: group.favIconUrl || "",
      tabs: group.items
    };

    await chrome.storage.local.set({ [id]: data });

    // Open the collection page in the background so it doesn't steal focus
    // from the tab you're currently on.
    await chrome.tabs.create({
      windowId,
      url: chrome.runtime.getURL(`group.html?id=${encodeURIComponent(id)}`),
      active: false
    });

    // Close the original tabs that were folded into the page.
    try {
      await chrome.tabs.remove(group.tabIds);
    } catch (e) {
      // A tab may have closed in the meantime; ignore.
    }

    createdPages++;
  }

  // Brief badge feedback on the toolbar icon.
  if (createdPages > 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#2f6bff" });
    chrome.action.setBadgeText({ text: String(createdPages) });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
    chrome.action.setBadgeText({ text: "0" });
  }
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
});
