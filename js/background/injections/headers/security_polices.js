var update_security_policies = function(request_details) {
  var url = url_for_request(request_details);

  if(should_intercept_request(url)) {
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
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
  ['responseHeaders', 'blocking']
);
