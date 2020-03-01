var update_security_policies = function(request_details) {
  var url = url_for_request(request_details);

  if(should_intercept_request(url)) {
    for(let header of request_details.responseHeaders) {
      if(
        (
          header.name.toLowerCase() == 'content-security-policy'
          ||
          header.name.toLowerCase() == 'x-content-security-policy'
          ||
          header.name.toLowerCase() == 'content-security-policy-report-only'
          ||
          header.name.toLowerCase() == 'x-content-security-policy-report-only'
        )
        &&
        /script-src\s/i.test(header.value)
      ) {
        header.value = header.value.replace(/script-src\s{1,}/ig, 'script-src ');

        var script_src_rules = header.value.split(/script-src /i);

        for(i in script_src_rules) {
          if(i > 0) {
            var rule = script_src_rules[i].split(';')[0];

            if(
              rule && rule != '' && !/nonce-3b34aae43a/.test(rule)
              &&
              (!/unsafe-inline/i.test(rule) || /nonce-/i.test(rule))
            ) {
              header.value = header.value.replace(
                'script-src ' + rule, "script-src 'nonce-3b34aae43a' " + rule
              );
            }
          }
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
