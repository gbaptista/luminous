var load_store_data_from_tab = function(tab_id, url, update_badge = false, update_icon = false) {
  if(update_badge) {
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

  if(update_icon) {
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
            32: 'images/icons/32-gray.png',
            64: 'images/icons/64-gray.png'
          }
        });
      } else {
        chrome.browserAction.setIcon({
          path: {
            16: 'images/icons/16.png',
            32: 'images/icons/32.png',
            64: 'images/icons/64.png'
          }
        });
      }
    });
  }
}

var load_stored_data = function(update_badge = false, update_icon = false, changes) {
  chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
      var current_tab_id = 'x';

      if(tabs[0]) {
        current_tab_id = tabs[0].id.toString();
        current_tab_url = tabs[0].url;

        if(changes && changes[current_tab_id]) {
          update_badge = true;
        }

        if(changes && changes['options'] && changes['options'] && changes['options'].newValue && changes['options'].newValue['injection_disabled']) {
          update_icon = true;
        }

        load_store_data_from_tab(
          current_tab_id, current_tab_url, update_badge, update_icon
        );
      }
    }
  )
};

chrome.tabs.onActivated.addListener(function (_activeInfo) {
  load_stored_data(true, true);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  load_stored_data(false, false, changes);
});

load_stored_data(true, true);
