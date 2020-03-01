var migrate_legacy_settings = function(sync_data) {
  var legacy_data = Object.assign({}, sync_data);

  if(sync_data['options']) {
    delete sync_data['options']
  }

  if(legacy_data['options']) {

    if(legacy_data['options']['badge_counter'] && !sync_data['badge_counter']) {
      sync_data['badge_counter'] = legacy_data['options']['badge_counter'];
    }

    if(legacy_data['options']['popup'] && !sync_data['popup']) {
      sync_data['popup'] = legacy_data['options']['popup'];
    }

    if(legacy_data['options']['injection_disabled'] && !sync_data['injection_disabled']) {
      sync_data['injection_disabled'] = {};

      for(domain in legacy_data['options']['injection_disabled']) {
        if(
          domain != 'addons.mozilla.org'
          &&
          domain != 'addons.opera.com'
          &&
          domain != 'chrome.google.com'
          &&
          legacy_data['options']['injection_disabled'][domain]
        ) {
          sync_data['injection_disabled'][domain] = true;
        }
      }
    }

    kinds = ['WebAPIs', 'addEventListener', 'handleEvent'];

    if(legacy_data['options']['default_disabled']) {
      for(i in kinds) {
        var kind = kinds[i];
        if(
          legacy_data['options']['default_disabled'][kind]
          &&
          !sync_data['default_disabled_' + kind]
        ) {
          sync_data['default_disabled_' + kind] = {};

          for(code in legacy_data['options']['default_disabled'][kind]) {
            if(legacy_data['options']['default_disabled'][kind][code]) {
              sync_data['default_disabled_' + kind][code] = true;
            }
          }
        }
      }
    }

    if(legacy_data['options']['disabled']) {
      for(domain in legacy_data['options']['disabled']) {
        if(!sync_data['disabled_' + domain]) {
          sync_data['disabled_' + domain] = {};

          var has_something = false;

          for(i in kinds) {
            var kind = kinds[i];
            if(legacy_data['options']['disabled'][domain][kind]) {
              sync_data['disabled_' + domain][kind] = {};

              for(code in legacy_data['options']['disabled'][domain][kind]) {
                if(legacy_data['options']['disabled'][domain][kind][code]) {
                  if(!(domain == 'web.whatsapp.com' && code == 'wheel')) {
                    sync_data['disabled_' + domain][kind][code] = true;
                    has_something = true;
                  }
                }
              }
            }
          }

          if(!has_something) {
            delete sync_data['disabled_' + domain];
          }
        }
      }
    }
  }

  return sync_data;
}

var set_default_settings = function() {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};

    sync_data = migrate_legacy_settings(sync_data);

    if(!sync_data['reports']) {
      sync_data['reports'] = {};
    }

    if(sync_data['reports']['collect_data'] == undefined) {
      sync_data['reports']['collect_data'] = true;
    }

    if(!sync_data['auto_settings']) {
      sync_data['auto_settings'] = {};
    }

    if(!sync_data['advanced']) {
      sync_data['advanced'] = {};
    }

    if(sync_data['advanced']['try_filter_response_data'] == undefined) {
      sync_data['advanced']['try_filter_response_data'] = true;
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

    if(sync_data['injection_disabled']['www.youtube.com'] == undefined) {
      sync_data['injection_disabled']['www.youtube.com'] = true;
    }

    if(!sync_data['popup']) {
      sync_data['popup'] = {};
    }

    if(sync_data['popup']['show_code_details'] == undefined) {
      sync_data['popup']['show_code_details'] = false;
    }

    if(sync_data['popup']['zoom_in'] == undefined) {
      sync_data['popup']['zoom_in'] = false;
    }

    if(sync_data['popup']['apply_to_default'] == undefined) {
      sync_data['popup']['apply_to_default'] = false;
    }

    // default
    if(!sync_data['default_disabled_WebAPIs']) {
      sync_data['default_disabled_WebAPIs'] = {}
    }

    if(!sync_data['default_disabled_handleEvent']) {
      sync_data['default_disabled_handleEvent'] = {}
    }

    if(!sync_data['default_disabled_addEventListener']) {
      sync_data['default_disabled_addEventListener'] = {}
    }

    chrome.storage.sync.set(sync_data, function() {
      chrome.storage.sync.remove('options');
    });
  });
}

set_default_settings();

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if(message.action == 'set_default_settings') {
    set_default_settings();
  }
});
