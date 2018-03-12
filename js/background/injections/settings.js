var a_element = document.createElement('a');
var settings_defined = false;
var cached_settings = {};

var update_cached_settings = function() {
  chrome.storage.sync.get(null, function(sync_data) {
    if(sync_data) {
      settings_defined = true;
      cached_settings = sync_data;
    }
  });
}

update_cached_settings();

var full_options_for_url = function(url) {
  return {
    disabled: settings_for_url(url),
    collect_details: cached_settings['popup']['show_code_details'],
    injection_disabled: !should_intercept_request(url)
  };
};

var settings_for_url = function(url, compressed) {
  a_element.href = url;
  var domain = a_element.hostname;

  if(compressed) {
    return compress_settings(
      apply_settings_for_domain(cached_settings, domain)['disabled_' + domain]
    );
  } else {
    return apply_settings_for_domain(cached_settings, domain)['disabled_' + domain];
  }
}

if(injection_strategy == 'cookie') {
  chrome.webNavigation.onCommitted.addListener(function(details) {
    if(settings_defined) {
      a_element.href = details.url;
      var domain = a_element.hostname;

      chrome.tabs.sendMessage(
        details.tabId, {
          action: 'options_from_on_committed',
          domain: domain,
          options: full_options_for_url(details.url)
        }
      );
    }
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'options_from_on_message') {
    if(settings_defined) {
      sendResponse({ options: full_options_for_url(sender.tab.url) });
    }
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'main_url_for_tab') {
    sendResponse({ url: cached_urls[sender.tab.id] });
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if(namespace == 'sync') {
    if(changes['injection_disabled']) {
      cached_settings['injection_disabled'] = changes['injection_disabled'].newValue;
    }

    update_cached_settings();
  }
});

var should_intercept_request = function(url) {
  if(cached_settings['injection_disabled']['general']) {
    return false;
  } else {
    a_element.href = url;
    var domain = a_element.hostname;

    if(cached_settings['injection_disabled'][domain]) { return false; } else { return true; }
  }
}

var cached_urls = {};

var url_for_request = function(request_details) {
  var url = request_details.url;

  if(request_details.type == 'main_frame') {
    cached_urls[request_details.tabId] = request_details.url;
  } else {
    if(cached_urls[request_details.tabId]) {
      url = cached_urls[request_details.tabId];
    }
  }

  return url;
}
