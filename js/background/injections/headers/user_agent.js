var should_remove_user_agent = function(url) {
  if(should_intercept_request(url)) {
    var settings = settings_for_url(url);

    return (
      settings['WebAPIs'] && settings['WebAPIs']['headers.User-Agent']
    );
  } else {
    return false;
  }
}

var apply_user_agent_rules = function(request_details) {
  var url = url_for_request(request_details);

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
