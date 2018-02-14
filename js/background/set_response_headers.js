var cached_settings = {};

var update_cached_settings = function() {
  chrome.storage.sync.get(null, function(sync_data) {
    if(sync_data) cached_settings = sync_data;
  });
}

update_cached_settings();

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

var settings_for_url = function(url) {
  var a_element = document.createElement('a');
  a_element.href = url;
  var domain = a_element.hostname;

  return compress_settings(
    apply_settings_for_domain(cached_settings, domain)['disabled_' + domain]
  );
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

  if(cached_settings && false) {
    // Todo: check existing cookies
    var le_cookie_value = 'f';

    if(should_intercept_header(request_details.url)) {
      le_cookie_value = 't';
    }

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'le=' + le_cookie_value + '; Path=/'
    });

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'ls=' + settings_for_url(request_details.url) + '; Path=/'
    });

    var ld_value = 'f';

    if(cached_settings['popup']['show_code_details']) {
      ld_value = 't';
    }

    request_details.responseHeaders.push({
      name: 'Set-Cookie',
      value: 'ld=' + ld_value + '; Path=/'
    });
  }

  return { responseHeaders: request_details.responseHeaders };
}

chrome.webRequest.onHeadersReceived.addListener(
  update_security_policies_and_set_cookies,
  { 'urls': ['<all_urls>'] },
  ['responseHeaders', 'blocking']
);
