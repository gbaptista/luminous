var set_default_settings = function() {
  chrome.storage.sync.get('options', function(sync_data) {
    if(!sync_data) sync_data = {};

    if(!sync_data['options']) sync_data['options'] = {};

    if(!sync_data['options']['auto_settings']) {
      sync_data['options']['auto_settings'] = {};
    }

    if(!sync_data['options']['auto_settings']['domains']) {
      sync_data['options']['auto_settings']['domains'] = {};
    }

    if(sync_data['options']['auto_settings']['domains']['code_injection'] == undefined) {
      sync_data['options']['auto_settings']['domains']['code_injection'] = false;
    }

    if(sync_data['options']['auto_settings']['domains']['website_rules'] == undefined) {
      sync_data['options']['auto_settings']['domains']['website_rules'] = false;
    }

    if(sync_data['options']['auto_settings']['website_events'] == undefined) {
      sync_data['options']['auto_settings']['website_events'] = 'nothing';
    }

    if(sync_data['options']['auto_settings']['default_events'] == undefined) {
      sync_data['options']['auto_settings']['default_events'] = 'nothing';
    }

    if(!sync_data['options']['badge_counter']) {
      sync_data['options']['badge_counter'] = {};
    }

    if(sync_data['options']['badge_counter']['sum_by'] == undefined) {
      sync_data['options']['badge_counter']['sum_by'] = 'executions';
    }

    if(sync_data['options']['badge_counter']['executions'] == undefined) {
      sync_data['options']['badge_counter']['executions'] = 'allowed';
    }

    if(!sync_data['options']['badge_counter']['kinds']) {
      sync_data['options']['badge_counter']['kinds'] = {};
    }

    if(sync_data['options']['badge_counter']['kinds']['WebAPIs'] == undefined) {
      sync_data['options']['badge_counter']['kinds']['WebAPIs'] = false;
    }

    if(sync_data['options']['badge_counter']['kinds']['addEventListener'] == undefined) {
      sync_data['options']['badge_counter']['kinds']['addEventListener'] = true;
    }

    if(sync_data['options']['badge_counter']['kinds']['handleEvent'] == undefined) {
      sync_data['options']['badge_counter']['kinds']['handleEvent'] = true;
    }

    if(!sync_data['options']['injection_disabled']) {
      sync_data['options']['injection_disabled'] = {};
    }

    if(sync_data['options']['injection_disabled']['general'] == undefined) {
      sync_data['options']['injection_disabled']['general'] = false;
    }

    if(!sync_data['options']['popup']) {
      sync_data['options']['popup'] = {};
    }

    if(sync_data['options']['popup']['show_code_details'] == undefined) {
      sync_data['options']['popup']['show_code_details'] = false;
    }

    if(!sync_data['options']['disabled']) sync_data['options']['disabled'] = {};

    // default
    if(!sync_data['options']['default_disabled']) sync_data['options']['default_disabled'] = {};

    if(!sync_data['options']['default_disabled']['WebAPIs']) {
      sync_data['options']['default_disabled']['WebAPIs'] = {}
    }

    if(!sync_data['options']['default_disabled']['handleEvent']) {
      sync_data['options']['default_disabled']['handleEvent'] = {}
    }

    if(!sync_data['options']['default_disabled']['addEventListener']) {
      sync_data['options']['default_disabled']['addEventListener'] = {}
    }

    // From "Most Common Categories" at https://developer.mozilla.org/en-US/docs/Web/Events
    event_names = [
      // Resource Events
      'beforeunload', 'unload',
      // Focus Events
      'focus', 'blur',
      // Websocket Events
      'open', 'message', 'error', 'close',
      // Session History Events
      'pagehide', 'pageshow', 'popstate',
      // Form Events
      'reset', 'submit',
      // Text Composition Events
      'compositionstart', 'compositionupdate', 'compositionend',
      // View Events
      'resize', 'scroll',
      // Clipboard Events
      'cut', 'copy', 'paste',
      // Keyboard Events
      'keydown', 'keypress', 'keyup',
      // Mouse Events
      'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup',
      'auxclick', 'click', 'dblclick', 'contextmenu', 'wheel', 'mouseleave',
      'mouseout', 'select', 'pointerlockchange', 'pointerlockerror',
      // Drag & Drop Events
      'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
      // Storage events
      'change', 'storage'
    ];

    event_names = [
      'mousemove'
    ];

    for(i in event_names) {
      if(sync_data['options']['default_disabled']['addEventListener'][event_names[i]] == undefined) {
        sync_data['options']['default_disabled']['addEventListener'][event_names[i]] = false;
      }

      if(sync_data['options']['default_disabled']['handleEvent'][event_names[i]] == undefined) {
        sync_data['options']['default_disabled']['handleEvent'][event_names[i]] = false;
      }
    }

    var event_names = [
      'fetch',
      'setInterval', 'setInterval.call',
      'setTimeout', 'setTimeout.call',
      'XMLHttpRequest.open', 'XMLHttpRequest.send'
    ];

    for(i in event_names) {
      if(sync_data['options']['default_disabled']['WebAPIs'][event_names[i]] == undefined) {
        sync_data['options']['default_disabled']['WebAPIs'][event_names[i]] = false;
      }
    }

    chrome.storage.sync.set(sync_data);
  });
}

set_default_settings();

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if(message.action == 'set_default_settings') {
    set_default_settings();
  }
});
