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

var set_tab_settings = function(activeInfo) {
  chrome.tabs.get(parseInt(activeInfo.tabId), function(tab) {
    if(tab) {
      set_domain_settings_for_urls([tab.url]);
    }
  });
}

chrome.tabs.onActivated.addListener(set_tab_settings);

chrome.webRequest.onCompleted.addListener(
  set_request_settings,
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] }
);
