chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'showPageAction') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.pageAction.show(tabs[0].id);
    });
  }
});
