var injection_strategy = 'cookie';

// if(typeof browser !== 'undefined') {
//   // Probably a Gecko-based browser
//
//   // TODO A very bad strategy, if there is any
//   // spoofing of useragent, this will not work ...
//   var current_browser = UAParser().browser;
//
//   if(
//     current_browser.name == 'Firefox'
//     &&
//     parseInt(current_browser.major) < 57
//   ) {
//     // Firefox without filterResponseData support...
//     injection_strategy = 'cookie';
//   } else {
//     // Let's hope it's a Firefox 57+ or
//     // something with filterResponseData support.
//     injection_strategy = 'filterResponseData';
//   }
// }
