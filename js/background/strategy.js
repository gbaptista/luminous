var injection_strategy = 'cookie';

if(
  typeof browser !== 'undefined'
  &&
  browser.webRequest
  &&
  browser.webRequest.filterResponseData
) {

  // has filterResponseData support (Firefox 57+ only)
  injection_strategy = 'filterResponseData';
}
