var injection_disabled = {};

var should_intercept_header = function(url) {
  if(injection_disabled['general']) {
    return false;
  } else {
    var a_element = document.createElement('a');
    a_element.href = url;
    var domain = a_element.hostname;

    if(injection_disabled[domain]) { return false; } else { return true; }
  }
}

var update_security_policies = function(request_details) {
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

  return { responseHeaders: request_details.responseHeaders };
}

chrome.webRequest.onHeadersReceived.addListener(
  update_security_policies,
  { 'urls': ['<all_urls>'] },
  ['responseHeaders', 'blocking']
);

chrome.storage.sync.get('options', function(sync_data) {
  if(!sync_data['options']) sync_data['options'] = {};
  if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};

  injection_disabled = sync_data['options']['injection_disabled'];
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if(namespace == 'sync' && changes['options'] && changes['options'].newValue['injection_disabled']) {
    injection_disabled = changes['options'].newValue['injection_disabled'];
  }
});
