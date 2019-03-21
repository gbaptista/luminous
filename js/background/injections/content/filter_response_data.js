if(injection_strategy != 'cookie') {

  var should_intercept_content_type = function(content_type) {
    var should_intercept = false;

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
    var splitted_content_type = content_type.toLowerCase().split(
      ';'
    )[0].toLowerCase().split('/');

    var type = splitted_content_type[0];
    var subtype = splitted_content_type[1];

    // TODO: Improve content_type check to fix issue #107:
    // https://github.com/gbaptista/luminous/issues/107
    if (['text', 'application'].includes(type)) {
      should_intercept = /html/.test(subtype);
    }

    console.log('should_intercept?', type, subtype, should_intercept);

    return should_intercept;
  }

  var interceptor_html_string = undefined;
  var data_html_string = undefined;

  // TODO remove cache for development enviroment
  load_interceptor_element('filterResponseData', function(element) {
    interceptor_html_string = element_to_html_string(element);
  });

  load_data_element('filterResponseData', function(element) {
    data_element = element;
  });

  var encoder = new TextEncoder();
  var decoder = new TextDecoder('utf-8');

  var requests_content_types = {};

  var detect_request_type = function(request_details) {
    requests_content_types[request_details.requestId] = undefined;

    var url = url_for_request(request_details);

    if(should_intercept_request(url)) {
      for(let header of request_details.responseHeaders) {
        if(header.name.toLowerCase() == 'content-type') {
          requests_content_types[request_details.requestId] = header.value;
        }
      }
    }
  }

  var inject_interceptor_and_settings = function(request_details) {
    var url = url_for_request(request_details);

    // TODO: Improve should_intercept_request to fix issue #107:
    // https://github.com/gbaptista/luminous/issues/107
    if(should_intercept_request(url)) {
      var options = full_options_for_url(url);

      load_options_element(options, 'filterResponseData', function(element) {
        var options_html_string = element_to_html_string(element);

        var filter = browser.webRequest.filterResponseData(request_details.requestId);

        data_element.setAttribute('data-tab', request_details.tabId);

        data_html_string = element_to_html_string(data_element);

        var content_to_write = options_html_string + data_html_string + interceptor_html_string;

        filter.ondata = event => {
          var content_type = requests_content_types[request_details.requestId];

          var content = decoder.decode(event.data, {stream: true});

          // binary content? Image, PDF...
          var binary = /\0/.exec(content);

          if(!binary && should_intercept_content_type(content_type)) {
            var match = /DOCTYPE(.|[\r\n])*?>/i.exec(content);

            if(match && match.index < 10 && match[0].length < 200) {
              var to_replace = content.slice(0, match.index + match[0].length);

              content = content.replace(to_replace, to_replace + content_to_write);
            } else {
              content = content_to_write + content;
            }

            filter.write(encoder.encode(content));
          } else {
            filter.write(event.data);
          }

          filter.disconnect();
        }
      });
    }

    return {};
  }

  chrome.webRequest.onHeadersReceived.addListener(
    detect_request_type,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['responseHeaders', 'blocking']
  );


  chrome.webRequest.onBeforeRequest.addListener(
    inject_interceptor_and_settings,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['blocking']
  );
}
