function set_domain_settings_for_urls(urls) {
  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      for(i in urls) {
        var a_element = document.createElement('a');
        a_element.href = urls[i];
        var domain = a_element.hostname;

        if(/\./.test(domain)) {

          if(sync_data['options']['auto_settings']['domains']['code_injection']) {
            if(sync_data['options']['injection_disabled'][domain] == undefined) {
              sync_data['options']['injection_disabled'][domain] = false;
            }
          }

          if(sync_data['options']['auto_settings']['domains']['website_rules']) {
            if(sync_data['options']['disabled'][domain] == undefined) {
              sync_data['options']['disabled'][domain] = {};
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

            chrome.storage.sync.get('options', function(sync_data) {
              var changed = false;

              for(kind in local_data[tab.id]['counters']) {
                for(code in local_data[tab.id]['counters'][kind]) {

                  // S should website?
                  if(sync_data['options']['disabled'][domain] == undefined) {
                    sync_data['options']['disabled'][domain] = {};
                  }

                  if(!sync_data['options']['disabled'][domain][kind]) {
                    sync_data['options']['disabled'][domain][kind] = {}
                  }
                  if(sync_data['options']['disabled'][domain][kind][code] == undefined) {
                    sync_data['options']['disabled'][domain][kind][code] = false;
                    changed = true;
                  }
                  // E should website?

                  // S should default?
                  if(!sync_data['options']['default_disabled'][kind]) {
                    sync_data['options']['default_disabled'][kind] = {}
                  }

                  if(sync_data['options']['default_disabled'][kind][code] == undefined) {
                    sync_data['options']['default_disabled'][kind][code] = false;
                    changed = true;
                  }
                  // E should default?
                  // console.log(kind + ' - ' + code);
                  // E should?

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
