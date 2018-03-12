if(injection_strategy != 'cookie') {
  var interceptor_html_string = undefined;
  var data_html_string = undefined;

  // TODO remove cache for development enviroment
  load_interceptor_element('filterResponseData', function(element) {
    interceptor_html_string = element_to_html_string(element);
  });

  load_data_element('filterResponseData', function(element) {
    data_element = element;
  });

  var inject_interceptor_and_settings = function(request_details) {
    var url = url_for_request(request_details);

    if(should_intercept_request(url)) {
      var options = full_options_for_url(url);

      load_options_element(options, 'filterResponseData', function(element) {
        var options_html_string = element_to_html_string(element);

        var filter = browser.webRequest.filterResponseData(request_details.requestId);
        var encoder = new TextEncoder();
        var decoder = new TextDecoder('utf-8');

        data_element.setAttribute('data-tab', request_details.tabId);

        data_html_string = element_to_html_string(data_element);

        var content_to_write = options_html_string + data_html_string + interceptor_html_string;

        filter.ondata = event => {
          var content = decoder.decode(event.data, {stream: true});

          var match = /DOCTYPE(.|[\r\n])*?>/i.exec(content);

          if(match && match.index < 10 && match[0].length < 200) {
            var to_replace = content.slice(0, match.index + match[0].length);

            content = content.replace(to_replace, to_replace + content_to_write);
          } else {
            content = content_to_write + content;
          }

          filter.write(encoder.encode(content));

          filter.disconnect();
        }
      });
    }

    return {};
  }

  chrome.webRequest.onBeforeRequest.addListener(
    inject_interceptor_and_settings,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['blocking']
  );
}
