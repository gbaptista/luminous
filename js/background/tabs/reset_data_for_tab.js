var remove_data_for_tab = function(tab_id) {
  var tab_id = tab_id.toString();

  chrome.storage.local.remove(tab_id);
}

chrome.tabs.onCreated.addListener(function(tab) {
  remove_data_for_tab(tab.id);
});

chrome.tabs.onRemoved.addListener(function(tab_id) {
  remove_data_for_tab(tab_id);
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    remove_data_for_tab(details.tabId);
  },
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
