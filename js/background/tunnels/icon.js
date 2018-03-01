var update_icon_for_tab = function(tab_id, url) {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};
    if(!sync_data['injection_disabled']) sync_data['injection_disabled'] = {};

    injection_disabled = sync_data['injection_disabled'];

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

var update_icon = function() {
  chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
      var current_tab_id = 'x';

      if(tabs[0]) {
        current_tab_id = tabs[0].id.toString();
        current_tab_url = tabs[0].url;

        update_icon_for_tab(
          current_tab_id, current_tab_url
        );
      }
    }
  )
};

chrome.tabs.onActivated.addListener(function (_activeInfo) {
  update_icon();
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if(namespace == 'sync' && changes['injection_disabled']) {
    update_icon();
  }
});

update_icon();
