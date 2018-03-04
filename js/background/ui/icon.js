var last_icon = undefined;

var update_icon_for_tab = function(url) {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};
    if(!sync_data['injection_disabled']) sync_data['injection_disabled'] = {};

    injection_disabled = sync_data['injection_disabled'];

    var a_element = document.createElement('a');
    a_element.href = url;
    var domain = a_element.hostname;

    if(injection_disabled['general'] || injection_disabled[domain]) {
      if(last_icon != 'gray') {
        chrome.browserAction.setIcon({
          path: {
            16: 'images/icons/16-gray.png',
            32: 'images/icons/32-gray.png',
            64: 'images/icons/64-gray.png'
          }
        });
        last_icon = 'gray';
      }
    } else {
      if(last_icon != 'color') {
        chrome.browserAction.setIcon({
          path: {
            16: 'images/icons/16.png',
            32: 'images/icons/32.png',
            64: 'images/icons/64.png'
          }
        });
        last_icon = 'color';
      }
    }
  });
}

var update_icon = function() {
  chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
      if(tabs[0]) { update_icon_for_tab(tabs[0].url); }
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

chrome.webRequest.onBeforeRequest.addListener(
  function(details) { update_icon_for_tab(details.url); },
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
