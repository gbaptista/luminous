var set_cookies = function(request_details) {
  var url = url_for_request(request_details);

  if(cached_settings != {}) {
    // TODO check if cookie names exist.
    var le_cookie_value = 'f';
    var ld_cookie_value = 'f';

    if(should_intercept_request(url)) {
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

if(injection_strategy == 'cookie') {
  chrome.webRequest.onHeadersReceived.addListener(
    set_cookies,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['responseHeaders', 'blocking']
  );
}
