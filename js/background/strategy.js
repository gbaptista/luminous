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

  // has filterResponseData support (Firefox 57+ only)
  injection_strategy = 'filterResponseData';
}
