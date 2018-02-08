function set_domain_settings_for_urls(urls) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      for(i in urls) {
        var a_element = document.createElement('a');
        a_element.href = urls[i];
        var domain = a_element.hostname;

        if(/\./.test(domain)) {

          if(sync_data['auto_settings']['domains']['code_injection']) {
            if(sync_data['injection_disabled'][domain] == undefined) {
              sync_data['injection_disabled'][domain] = false;
            }
          }

          if(sync_data['auto_settings']['domains']['website_rules']) {
            if(sync_data['disabled_' + domain] == undefined) {
              sync_data['disabled_' + domain] = {};
            }
          }
        }
      }

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
}

chrome.tabs.query({}, function(tabs) {
  var urls = [];

  for(i in tabs) { urls.push(tabs[i].url); }

  setTimeout(function() {
    set_domain_settings_for_urls(urls);
  }, 500);
});

var set_request_settings = function(details) {
  // Avoid redirects:
  if(details.statusCode.toString()[0] != '3') {
    set_domain_settings_for_urls([details.url]);
  }
}

var common_webapis = [
  // WebAPIs
  'fetch',
  'setInterval', 'setInterval.call',
  'setTimeout', 'setTimeout.call',
  'XMLHttpRequest.open', 'XMLHttpRequest.send',
];

for(i in common_webapis) {
  common_webapis[i] = common_webapis[i].toLowerCase();
}

var common_events = [
  // Resource Events
  'abort', 'beforeunload', 'unload',
  // Focus Events
  'focus', 'blur',
  // Websocket Events
  'open', 'message', 'close',
  // Session History Events
  'pagehide', 'pageshow', 'popstate',
  // Form Events
  'reset', 'submit',
  // Text Composition Events
  'compositionstart', 'compositionupdate', 'compositionend',
  // View Events
  'fullscreenchange', 'fullscreenerror', 'resize', 'scroll',
  // Clipboard Events
  'cut', 'copy', 'paste',
  // Keyboard Events
  'keydown', 'keypress', 'keyup',
  // Mouse Events
  'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup', 'auxclick',
  'click', 'dblclick', 'contextmenu', 'wheel', 'mouseleave', 'mouseout',
  'select', 'pointerlockchange', 'pointerlockerror',
  // Drag & Drop Events
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
  // Media Events
  'canplay', 'canplaythrough', 'ended', 'play', 'playing', 'pause', 'volumechange',
  // Storage events
  'storage', 'change',
  // Value change events
  'broadcast', 'CheckboxStateChange', 'hashchange', 'input',
  'RadioStateChange', 'readystatechange', 'ValueChange',
  // Uncategorized events
  'localized', 'message', 'open', 'show'
];

for(i in common_events) {
  common_events[i] = common_events[i].toLowerCase();
}

var validates_code = function(code, validation) {
  code = code.toLowerCase();

  if(validation == 'all') {
    return true;
  } else if(validation == 'almost_all') {
    for(i in common_webapis) {
      if(code == common_webapis[i]) {
        return true;
      }
    }

    return !/\W|_/.test(code);
  } else if(validation == 'common') {
    for(i in common_webapis) {
      if(code == common_webapis[i]) {
        return true;
      }
    }

    for(i in common_events) {
      if(code == common_events[i]) {
        return true;
      }
    }
  } else {
    return false;
  }
}

var set_event_settings_for_tab = function(tab_ids) {
  chrome.storage.local.get(null, function(local_data) {
    for(i in tab_ids) {
      var tab_id = tab_ids[i];
      chrome.tabs.get(parseInt(tab_id), function(tab) {
        if(tab && local_data[tab.id]) {
          var a_element = document.createElement('a');
          a_element.href = tab.url;
          var domain = a_element.hostname;

          if(/\./.test(domain)) {

            chrome.storage.sync.get(null, function(sync_data) {
              var changed = false;

              for(kind in local_data[tab.id]['counters']) {
                for(code in local_data[tab.id]['counters'][kind]) {
                  if(validates_code(code, sync_data['auto_settings']['website_events'])) {
                    if(sync_data['disabled_' + domain] == undefined) {
                      sync_data['disabled_' + domain] = {};
                    }

                    if(!sync_data['disabled_' + domain][kind]) {
                      sync_data['disabled_' + domain][kind] = {}
                    }
                    if(sync_data['disabled_' + domain][kind][code] == undefined) {
                      sync_data['disabled_' + domain][kind][code] = false;
                      changed = true;
                    }
                  }

                  if(validates_code(code, sync_data['auto_settings']['default_events'])) {
                    if(!sync_data['default_disabled'][kind]) {
                      sync_data['default_disabled'][kind] = {}
                    }

                    if(sync_data['default_disabled'][kind][code] == undefined) {
                      sync_data['default_disabled'][kind][code] = false;
                      changed = true;
                    }
                  }
                }
              }

              if(changed) {
                chrome.storage.sync.set(sync_data);
              }
            });
          }
        }
      });
    }
  });
}

setInterval(function() {
  chrome.storage.local.get(null, function(local_data) {
    var tab_ids = [];

    for(tab_id in local_data) { tab_ids.push(tab_id) }

    set_event_settings_for_tab(tab_ids);
  });
}, 5000);

var set_tab_settings = function(activeInfo) {
  chrome.tabs.get(parseInt(activeInfo.tabId), function(tab) {
    if(tab) {
      set_domain_settings_for_urls([tab.url]);
      set_event_settings_for_tab([tab.id]);
    }
  });
}

chrome.tabs.onActivated.addListener(set_tab_settings);

chrome.webRequest.onCompleted.addListener(
  set_request_settings,
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
