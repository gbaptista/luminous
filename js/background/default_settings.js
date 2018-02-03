var set_default_settings = function() {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};

    if(!sync_data['options']) sync_data['options'] = {};

    if(!sync_data['options']['badge_counter']) {
      sync_data['options']['badge_counter'] = {};
    }

    if(sync_data['options']['badge_counter']['group_by'] == undefined) {
      sync_data['options']['badge_counter']['group_by'] = 'executions';
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

    if(sync_data['options']['popup']['show_listener_functions'] == undefined) {
      sync_data['options']['popup']['show_listener_functions'] = false;
    }

    // web.whatsapp.com
    if(!sync_data['options']['disabled']) sync_data['options']['disabled'] = {};

    if(!sync_data['options']['disabled']['web.whatsapp.com']) {
      sync_data['options']['disabled']['web.whatsapp.com'] = {}
    }

    if(!sync_data['options']['disabled']['web.whatsapp.com']['addEventListener']) {
      sync_data['options']['disabled']['web.whatsapp.com']['addEventListener'] = {}
    }

    if(sync_data['options']['disabled']['web.whatsapp.com']['addEventListener']['wheel'] == undefined) {
      sync_data['options']['disabled']['web.whatsapp.com']['addEventListener']['wheel'] = true;
    }

    if(!sync_data['options']['disabled']['web.whatsapp.com']['handleEvent']) {
      sync_data['options']['disabled']['web.whatsapp.com']['handleEvent'] = {}
    }

    if(sync_data['options']['disabled']['web.whatsapp.com']['handleEvent']['wheel'] == undefined) {
      sync_data['options']['disabled']['web.whatsapp.com']['handleEvent']['wheel'] = true;
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
