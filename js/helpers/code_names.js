var common_webapis = [
  // WebAPIs
  'getBattery',
  'fetch',
  'getGamepads',
  'geo.getCurrentPosition', 'geo.watchPosition',
  'headers.User-Agent', 'NavigatorID.userAgent',
  'setInterval', 'setInterval.call',
  'setTimeout', 'setTimeout.call',
  'WebSocket.send',
  'XMLHttpRequest.open', 'XMLHttpRequest.send'
];

var common_events = [
  // Resource Events
  'abort', 'beforeunload', 'unload',
  // Focus Events
  'focus', 'blur',
  // Websocket Events
  'open', 'message', 'close',
  // Session History Events
  'pagehide', 'pageshow', 'popstate',
  // Form Events
  'reset', 'submit',
  // Text Composition Events
  'compositionstart', 'compositionupdate', 'compositionend',
  // View Events
  'fullscreenchange', 'fullscreenerror', 'resize', 'scroll',
  // Clipboard Events
  'cut', 'copy', 'paste',
  // Keyboard Events
  'keydown', 'keypress', 'keyup',
  // Mouse Events
  'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup', 'auxclick',
  'click', 'dblclick', 'contextmenu', 'wheel', 'mouseleave', 'mouseout',
  'select', 'pointerlockchange', 'pointerlockerror',
  // Drag & Drop Events
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
  // Media Events
  'canplay', 'canplaythrough', 'ended', 'play', 'playing', 'pause', 'volumechange',
  // Storage events
  'storage', 'change',
  // Value change events
  'broadcast', 'CheckboxStateChange', 'hashchange', 'input',
  'RadioStateChange', 'readystatechange', 'ValueChange',
  // Gamepad API events
  'gamepadconnected', 'gamepaddisconnected',
  // Uncategorized events
  'localized', 'message', 'open', 'show'
];

var validates_code = function(code, validation) {
  code = code.toLowerCase();

  if(validation == 'all') {
    return true;
  } else if(validation == 'almost_all') {
    for(i in common_webapis) {
      if(code.toLowerCase() == common_webapis[i].toLowerCase()) {
        return true;
      }
    }

    return !/\W|_/.test(code);
  } else if(validation == 'common') {
    for(i in common_webapis) {
      if(code.toLowerCase() == common_webapis[i].toLowerCase()) {
        return true;
      }
    }

    for(i in common_events) {
      if(code.toLowerCase() == common_events[i].toLowerCase()) {
        return true;
      }
    }
  } else {
    return false;
  }
}
