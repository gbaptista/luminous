function set_domain_settings_for_urls(urls) {
  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      for(i in urls) {
        var a_element = document.createElement('a');
        a_element.href = urls[i];
        var domain = a_element.hostname;

        if(/\./.test(domain)) {
          if(sync_data['options']['injection_disabled'][domain] == undefined) {
            sync_data['options']['injection_disabled'][domain] = false;
          }

          if(sync_data['options']['disabled'][domain] == undefined) {
            sync_data['options']['disabled'][domain] = {};
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
  set_domain_settings_for_urls([details.url]);
}

chrome.webRequest.onBeforeRequest.addListener(
  set_request_settings,
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
