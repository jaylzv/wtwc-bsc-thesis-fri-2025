async function openTabWithUrl(host, event) {
  const { href } = event.currentTarget;
  event.preventDefault();
  try {
    const tabs = await chrome.tabs.query({
      url: href.split("#")[0],
      currentWindow: true
    });
    if (tabs.length) {
      await chrome.tabs.update(tabs[0].id, {
        active: true,
        url: href !== tabs[0].url ? href : void 0
      });
      return;
    }
  } catch (e) {
    console.error("[utils|tabs] Error while try to find existing tab:", e);
  }
  chrome.tabs.create({ url: href });
}
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  if (tab.url !== window.location.href) {
    return tab;
  }
  const [otherTab] = await chrome.tabs.query({
    active: true,
    currentWindow: false
  });
  return otherTab || null;
}

export { getCurrentTab, openTabWithUrl };
