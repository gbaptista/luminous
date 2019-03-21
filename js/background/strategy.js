var injection_strategy = 'cookie';

if(
  typeof browser !== 'undefined'
  &&
  browser.webRequest
  &&
  browser.webRequest.filterResponseData
) {
  // TODO: Use sync_data['advanced']['injection_strategy']
  //       if 'TryFilterResponseData': 'filterResponseData'
  //                             else: 'cookie'
  // Temporarily disabled because of issue #107:
  // https://github.com/gbaptista/luminous/issues/107

  // has filterResponseData support (Firefox 57+ only)
  // injection_strategy = 'filterResponseData';

  injection_strategy = 'cookie';
}
