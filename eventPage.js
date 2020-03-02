chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'tfsTeamShowIcon') {
    chrome.pageAction.show(sender.tab.id);
    chrome.pageAction.setTitle({
      tabId: sender.tab.id,
      title: `test`
    });
  }
  if (request.todo == 'showPageAction') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.pageAction.show(tabs[0].id);
    });
  }
});

chrome.storage.onChanged.addListener(function(changes, storageName) {
  chrome.browserAction.setBadgeText({
    text: changes.summary.newValue.toString()
  });
});
