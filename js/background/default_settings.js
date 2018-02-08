var set_default_settings = function() {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};

    if(!sync_data) sync_data = {};

    if(!sync_data['auto_settings']) {
      sync_data['auto_settings'] = {};
    }

    if(!sync_data['auto_settings']['domains']) {
      sync_data['auto_settings']['domains'] = {};
    }

    if(sync_data['auto_settings']['domains']['code_injection'] == undefined) {
      sync_data['auto_settings']['domains']['code_injection'] = false;
    }

    if(sync_data['auto_settings']['domains']['website_rules'] == undefined) {
      sync_data['auto_settings']['domains']['website_rules'] = false;
    }

    if(sync_data['auto_settings']['website_events'] == undefined) {
      sync_data['auto_settings']['website_events'] = 'none';
    }

    if(sync_data['auto_settings']['default_events'] == undefined) {
      sync_data['auto_settings']['default_events'] = 'common';
    }

    if(!sync_data['badge_counter']) {
      sync_data['badge_counter'] = {};
    }

    if(sync_data['badge_counter']['sum_by'] == undefined) {
      sync_data['badge_counter']['sum_by'] = 'executions';
    }

    if(sync_data['badge_counter']['executions'] == undefined) {
      sync_data['badge_counter']['executions'] = 'allowed';
    }

    if(!sync_data['badge_counter']['kinds']) {
      sync_data['badge_counter']['kinds'] = {};
    }

    if(sync_data['badge_counter']['kinds']['WebAPIs'] == undefined) {
      sync_data['badge_counter']['kinds']['WebAPIs'] = false;
    }

    if(sync_data['badge_counter']['kinds']['addEventListener'] == undefined) {
      sync_data['badge_counter']['kinds']['addEventListener'] = true;
    }

    if(sync_data['badge_counter']['kinds']['handleEvent'] == undefined) {
      sync_data['badge_counter']['kinds']['handleEvent'] = true;
    }

    if(!sync_data['injection_disabled']) {
      sync_data['injection_disabled'] = {};
    }

    if(sync_data['injection_disabled']['general'] == undefined) {
      sync_data['injection_disabled']['general'] = false;
    }

    if(!sync_data['popup']) {
      sync_data['popup'] = {};
    }

    if(sync_data['popup']['show_code_details'] == undefined) {
      sync_data['popup']['show_code_details'] = false;
    }

    // default
    if(!sync_data['default_disabled']) sync_data['default_disabled'] = {};

    if(!sync_data['default_disabled']['WebAPIs']) {
      sync_data['default_disabled']['WebAPIs'] = {}
    }

    if(!sync_data['default_disabled']['handleEvent']) {
      sync_data['default_disabled']['handleEvent'] = {}
    }

    if(!sync_data['default_disabled']['addEventListener']) {
      sync_data['default_disabled']['addEventListener'] = {}
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
