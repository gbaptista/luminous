var common_webapis = [
  // WebAPIs
  'fetch',
  'setInterval', 'setInterval.call',
  'setTimeout', 'setTimeout.call',
  'XMLHttpRequest.open', 'XMLHttpRequest.send',
];

for(i in common_webapis) {
  common_webapis[i] = common_webapis[i].toLowerCase();
}

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
  // Uncategorized events
  'localized', 'message', 'open', 'show'
];

for(i in common_events) {
  common_events[i] = common_events[i].toLowerCase();
}

var validates_code = function(code, validation) {
  code = code.toLowerCase();

  if(validation == 'all') {
    return true;
  } else if(validation == 'almost_all') {
    for(i in common_webapis) {
      if(code == common_webapis[i]) {
        return true;
      }
    }

    return !/\W|_/.test(code);
  } else if(validation == 'common') {
    for(i in common_webapis) {
      if(code == common_webapis[i]) {
        return true;
      }
    }

    for(i in common_events) {
      if(code == common_events[i]) {
        return true;
      }
    }
  } else {
    return false;
  }
}
