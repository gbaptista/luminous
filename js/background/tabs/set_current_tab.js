chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'current_tab_id') {
    if(sender.tab) {
      sendResponse({ current_tab_id: sender.tab.id });
    }
  }
});
