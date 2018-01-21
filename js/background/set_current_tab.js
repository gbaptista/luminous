setInterval(function() {
  chrome.tabs.query({ currentWindow: true, active: true, lastFocusedWindow: true }, function(tabs) {
    if(tabs[0]) {
      current_tab = tabs[0];
      chrome.tabs.sendMessage(
        current_tab.id, { action: 'set_current_tab_id', current_tab: current_tab }
      );
    }
  })
}, 0);
