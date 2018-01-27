chrome.tabs.onCreated.addListener(function(tab) {
  var tab_id = tab.id.toString();

  chrome.storage.local.get(tab_id, function(current_storage_data) {
    var data_to_write = current_storage_data;

    if(!data_to_write) { data_to_write = {}; }
    if(!data_to_write[tab_id]) { data_to_write[tab_id] = {}; }

    data_to_write[tab_id]['counters'] = {};
    data_to_write[tab_id]['badge'] = { 'text': '', 'calls': 0 };

    chrome.storage.local.set(data_to_write);
  });
});

setInterval(function() {
  chrome.tabs.query({ currentWindow: true, active: true, lastFocusedWindow: true }, function(tabs) {
    if(tabs[0]) {
      current_tab = tabs[0];

      // Error: Could not establish connection. Receiving end does not exist.
      if(/^http/.test(current_tab.url)) {
        chrome.tabs.sendMessage(
          current_tab.id, { action: 'set_current_tab_id', current_tab: current_tab }
        );
      }
    }
  })
}, 0);
