var update_security_policies = function(request_details) {
  for (let header of request_details.responseHeaders) {
    if (header.name.toLowerCase() == 'content-security-policy' || header.name.toLowerCase() == 'x-content-security-policy') {
      header.value = header.value.replace(
        /script-src\s{1,}/,
        "script-src 'nonce-3b34aae43a' "
      );
    }
  }

  return { responseHeaders: request_details.responseHeaders };
}

chrome.webRequest.onHeadersReceived.addListener(
  update_security_policies,
  { 'urls': ['<all_urls>'] },
  ['responseHeaders', 'blocking']
);
