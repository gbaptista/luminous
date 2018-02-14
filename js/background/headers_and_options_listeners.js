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
    injection_disabled: !should_intercept_header(url)
  };
};

var settings_for_url = function(url, compressed) {
  var a_element = document.createElement('a');
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

chrome.webNavigation.onCommitted.addListener(function(details) {
  if(settings_defined) {
    chrome.tabs.sendMessage(
      details.tabId, {
        action: 'options_from_on_committed',
        options: full_options_for_url(details.url)
      }
    );
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'options_from_on_message') {
    if(settings_defined) {
      sendResponse({ options: full_options_for_url(sender.url) });
    }
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

var should_intercept_header = function(url) {
  if(cached_settings['injection_disabled']['general']) {
    return false;
  } else {
    var a_element = document.createElement('a');
    a_element.href = url;
    var domain = a_element.hostname;

    if(cached_settings['injection_disabled'][domain]) { return false; } else { return true; }
  }
}

var update_security_policies_and_set_cookies = function(request_details) {
  if(should_intercept_header(request_details.url)) {
    for(let header of request_details.responseHeaders) {
      if(
        (header.name.toLowerCase() == 'content-security-policy' || header.name.toLowerCase() == 'x-content-security-policy')
        &&
        /script-src\s/i.test(header.value)
      ) {
        var script_src_rules = header.value.split(/script-src\s/i)[1].split(';')[0];

        if(!/unsafe-inline/i.test(script_src_rules)) {
          header.value = header.value.replace(
            /script-src\s{1,}/i,
            "script-src 'nonce-3b34aae43a' "
          );
        }
      }
    }
  }

  if(cached_settings) {
    // TODO check if cookie names exist.
    var le_cookie_value = 'f';

    if(should_intercept_header(request_details.url)) {
      le_cookie_value = 't';
    }

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'le=' + le_cookie_value + '; Path=/; Max-Age=1'
    });

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'ls=' + settings_for_url(request_details.url, true) + '; Path=/; Max-Age=1'
    });

    var ld_value = 'f';

    if(cached_settings['popup']['show_code_details']) {
      ld_value = 't';
    }

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'ld=' + ld_value + '; Path=/; Max-Age=1'
    });
  }

  return { responseHeaders: request_details.responseHeaders };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(request_details) {
    // TODO Remove cookies from haders.

    return { responseHeaders: request_details.responseHeaders };
  },
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
  ['requestHeaders', 'blocking']
)

chrome.webRequest.onHeadersReceived.addListener(
  update_security_policies_and_set_cookies,
  { 'urls': ['<all_urls>'] },
  ['responseHeaders', 'blocking']
);
