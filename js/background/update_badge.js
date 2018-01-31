var load_store_data_from_tab = function(tab_id, url) {
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

  chrome.storage.sync.get('options', function(sync_data) {
    if(!sync_data['options']) sync_data['options'] = {};
    if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};

    injection_disabled = sync_data['options']['injection_disabled'];

    var a_element = document.createElement('a');
    a_element.href = current_tab_url;
    var domain = a_element.hostname;

    if(injection_disabled['general'] || injection_disabled[domain]) {
      chrome.browserAction.setIcon({
        path: {
          16: 'images/icons/16-gray.png',
          20: 'images/icons/20-gray.png',
          24: 'images/icons/24-gray.png',
          32: 'images/icons/32-gray.png',
          48: 'images/icons/48-gray.png',
          64: 'images/icons/64-gray.png',
          128: 'images/icons/128-gray.png',
          256: 'images/icons/256-gray.png',
          512: 'images/icons/512-gray.png'
        }
      });
    } else {
      chrome.browserAction.setIcon({
        path: {
          16: 'images/icons/16.png',
          20: 'images/icons/20.png',
          24: 'images/icons/24.png',
          32: 'images/icons/32.png',
          48: 'images/icons/48.png',
          64: 'images/icons/64.png',
          128: 'images/icons/128.png',
          256: 'images/icons/256.png',
          512: 'images/icons/512.png'
        }
      });
    }
  });
}

var load_stored_data = function(changes) {
  chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
      var current_tab_id = 'x';

      if(tabs[0]) {
        current_tab_id = tabs[0].id.toString();
        current_tab_url = tabs[0].url;

        load_store_data_from_tab(current_tab_id, current_tab_url);
      }
    }
  )
};

chrome.tabs.onActivated.addListener(function (_activeInfo) { load_stored_data(); });

chrome.storage.onChanged.addListener(function(changes, namespace) {
  load_stored_data(changes);
});

load_stored_data();
