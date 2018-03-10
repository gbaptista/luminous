var injection_strategy = 'cookie';

if(typeof browser !== 'undefined') {
  // Probably a Gecko-based browser

  // TODO Firefox 57+ only
  injection_strategy = 'filterResponseData';
}
