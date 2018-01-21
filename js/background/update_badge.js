var load_store_data_from_tab = function(tab_id) {
  chrome.storage.local.get(tab_id, function(data) {
    if(!data) { data = {}; }

    if(data[tab_id] && data[tab_id]['badge']) {
      chrome.browserAction.setBadgeText(
        { text: data[tab_id]['badge']['text'].toString() }
      );

      var calls = parseInt(data[tab_id]['badge']['calls']);

      chrome.browserAction.setBadgeBackgroundColor(
        { color: background_color_for_badge(calls) }
      );
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  });
}

var load_stored_data = function(changes) {
  chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
      var current_tab_id = 'x';

      if(tabs[0]) { current_tab_id = tabs[0].id.toString(); }

      if(!changes || changes[current_tab_id]) {
        load_store_data_from_tab(current_tab_id);
      }
    }
  )
};

chrome.tabs.onActivated.addListener(function (_activeInfo) { load_stored_data(); });

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if(namespace == 'local') { load_stored_data(changes); }
});

load_stored_data();
