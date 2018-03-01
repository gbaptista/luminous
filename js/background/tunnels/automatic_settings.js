var current_synched_data = {};

chrome.storage.sync.get(null, function(sync_data) {
  current_synched_data = sync_data;
});

chrome.storage.onChanged.addListener(function(_changes, namespace) {
  if(namespace == 'sync') {
    chrome.storage.sync.get(null, function(sync_data) {
      current_synched_data = sync_data;
    });
  }
});

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(message.action == 'log_input') {
    // TODO: Fix MAX_WRITE_OPERATIONS_PER_MINUTE
    var domain = message.domain;
    var kind = message.data.kind;
    var code = message.data.type;

    var changed = false;

    if(validates_code(code, current_synched_data['auto_settings']['website_events'])) {
      if(current_synched_data['disabled_' + domain] == undefined) {
        current_synched_data['disabled_' + domain] = {};
      }

      if(!current_synched_data['disabled_' + domain][kind]) {
        current_synched_data['disabled_' + domain][kind] = {}
      }
      if(current_synched_data['disabled_' + domain][kind][code] == undefined) {
        current_synched_data['disabled_' + domain][kind][code] = false;
        changed = true;
      }
    }

    if(validates_code(code, current_synched_data['auto_settings']['default_events'])) {
      if(!current_synched_data['default_disabled_' + kind]) {
        current_synched_data['default_disabled_' + kind] = {}
      }

      if(current_synched_data['default_disabled_' + kind][code] == undefined) {
        current_synched_data['default_disabled_' + kind][code] = false;
        changed = true;
      }
    }

    if(changed) {
      chrome.storage.sync.set(current_synched_data);
    }
  }
});
