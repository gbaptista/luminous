var inject_interceptor_and_settings = function(request_details) {
  var url = request_details.url;

  if(request_details.parentFrameId < 0) {
    cached_urls[request_details.tabId] = request_details.url;
  } else {
    if(cached_urls[request_details.tabId]) {
      url = cached_urls[request_details.tabId];
    }
  }

  var settings = full_options_for_url(url);

  var json_options_injection = document.createElement('script');
  json_options_injection.type = 'application/json';
  json_options_injection.id = 'luminous-options';
  json_options_injection.innerHTML = JSON.stringify(settings);
  json_options_injection.setAttribute('data-changed', 'true');
  json_options_injection.setAttribute('data-from', 'filterResponseData');

  var element_container = document.createElement('div');
  element_container.appendChild(json_options_injection);

  // TODO append data element and injector code

  let filter = chrome.webRequest.filterResponseData(request_details.requestId);
  let encoder = new TextEncoder();

  filter.onstart = event => {
    filter.write(encoder.encode(element_container.innerHTML));
    filter.disconnect();
  }

  return {};
}

if(chrome.webRequest.filterResponseData) {
  chrome.webRequest.onBeforeRequest.addListener(
    inject_interceptor_and_settings,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['blocking']
  );
}
