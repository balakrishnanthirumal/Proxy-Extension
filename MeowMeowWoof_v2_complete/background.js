
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ bookmarks: [] });
    console.log("Extension installed and storage initialized.");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'popup.html' });
});
