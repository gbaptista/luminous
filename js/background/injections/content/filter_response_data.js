if(injection_strategy != 'cookie') {
  var interceptor_html_string = undefined;
  var data_html_string = undefined;

  // TODO remove cache for development enviroment
  load_interceptor_element(function(element) {
    interceptor_html_string = element_to_html_string(element);
  });

  load_data_element(function(element) {
    data_element = element;
  });

  var inject_interceptor_and_settings = function(request_details) {
    var url = url_for_request(request_details);

    if(should_intercept_request(url)) {
      var options = full_options_for_url(url);

      load_options_element(options, 'filterResponseData', function(element) {
        var options_html_string = element_to_html_string(element);

        let filter = browser.webRequest.filterResponseData(request_details.requestId);
        let encoder = new TextEncoder();

        data_element.setAttribute('data-tab', request_details.tabId);

        data_html_string = element_to_html_string(data_element);

        var content_to_write = options_html_string + data_html_string + interceptor_html_string;

        filter.onstart = event => {
          filter.write(encoder.encode(content_to_write));
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
