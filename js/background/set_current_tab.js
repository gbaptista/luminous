chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'current_tab_id') {
    sendResponse({ current_tab_id: sender.tab.id });
  }
});

var reset_counters_for_tab = function(tab_id) {
  var tab_id = tab_id.toString();

  chrome.storage.local.get(tab_id, function(current_storage_data) {
    var data_to_write = current_storage_data;

    if(!data_to_write) { data_to_write = {}; }
    if(!data_to_write[tab_id]) { data_to_write[tab_id] = {}; }

    if(data_to_write[tab_id]['badge']) {
      data_to_write[tab_id]['counters'] = {};
      data_to_write[tab_id]['badge'] = { 'text': '', 'calls': 0 };
      chrome.storage.local.set(data_to_write);
    }
  });
}

var remove_data_for_tab = function(tab_id) {
  chrome.storage.local.remove(tab_id.toString());
}

chrome.tabs.onCreated.addListener(function(tab) { reset_counters_for_tab(tab.id); });
chrome.tabs.onUpdated.addListener(function(tab_id) { reset_counters_for_tab(tab_id); });
chrome.tabs.onRemoved.addListener(function(tab_id) { remove_data_for_tab(tab_id); });
