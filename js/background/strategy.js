var injection_strategy = 'cookie';

if(typeof browser !== 'undefined' && browser.webRequest.filterResponseData) {
  injection_strategy = 'filterResponseData';
}
