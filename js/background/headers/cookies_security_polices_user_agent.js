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
    injection_disabled: !should_intercept_header(url)
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

var should_intercept_header = function(url) {
  if(cached_settings['injection_disabled']['general']) {
    return false;
  } else {
    a_element.href = url;
    var domain = a_element.hostname;

    if(cached_settings['injection_disabled'][domain]) { return false; } else { return true; }
  }
}

var cached_urls = {};

var update_security_policies_and_set_cookies = function(request_details) {
  var url = request_details.url;

  if(request_details.parentFrameId < 0) {
    cached_urls[request_details.tabId] = request_details.url;
  } else {
    if(cached_urls[request_details.tabId]) {
      url = cached_urls[request_details.tabId];
    }
  }

  if(should_intercept_header(url)) {
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

  if(
    !chrome.webRequest.filterResponseData
    &&
    cached_settings
  ) {
    // TODO check if cookie names exist.
    var le_cookie_value = 'f';
    var ld_cookie_value = 'f';

    if(should_intercept_header(url)) {
      le_cookie_value = 't';
    }

    if(cached_settings['popup']['show_code_details']) {
      ld_cookie_value = 't';
    }

    var luminous_cookies = [];

    luminous_cookies.push('le=' + le_cookie_value + '; Path=/; Max-Age=1;');
    luminous_cookies.push(
      'ls=' + settings_for_url(url, true) + '; Path=/; Max-Age=1;'
    );
    luminous_cookies.push('ld=' + ld_cookie_value + '; Path=/; Max-Age=1;');

    var cookies_injected = false;

    if(typeof browser !== 'undefined') {
      // Probably a Gecko-based browser
      for(let header of request_details.responseHeaders) {
        if(!cookies_injected && header.name.toLowerCase() == 'set-cookie') {
          cookies_injected = true;
          header.value += "\n" + luminous_cookies.join("\n");
        }
      }

      if(!cookies_injected) {
        request_details.responseHeaders.push({
          name: 'Set-Cookie', value: luminous_cookies.join("\n")
        });
      }
    } else {
      // Probably a Chromium-based browser
      for(i in luminous_cookies) {
        request_details.responseHeaders.push({
          name: 'Set-Cookie', value: luminous_cookies[i]
        });
      }
    }
  }

  return { responseHeaders: request_details.responseHeaders };
}

var should_remove_user_agent = function(url) {
  if(should_intercept_header(url)) {
    var settings = settings_for_url(url);

    return (
      settings['WebAPIs'] && settings['WebAPIs']['headers.User-Agent']
    );
  } else {
    return false;
  }
}


var apply_user_agent_rules = function(request_details) {
  var url = request_details.url;

  if(request_details.parentFrameId < 0) {
    cached_urls[request_details.tabId] = request_details.url;
  } else {
    if(cached_urls[request_details.tabId]) {
      url = cached_urls[request_details.tabId];
    }
  }

  if(should_remove_user_agent(url)) {
    for (let header of request_details.requestHeaders) {
      if (header.name.toLowerCase() == 'user-agent') {
        header.value = 'Mozilla/5.0';
      }
    }
  }

  return { requestHeaders: request_details.requestHeaders };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  apply_user_agent_rules,
  { 'urls': ['<all_urls>'] },
  ['requestHeaders', 'blocking']
);

chrome.webRequest.onHeadersReceived.addListener(
  update_security_policies_and_set_cookies,
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
  ['responseHeaders', 'blocking']
);
