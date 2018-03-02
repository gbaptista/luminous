var auto_settings_stack_fifo = [];

var process_auto_settings_stack_timer = undefined;

var process_auto_settings_stack = function() {
  if(process_auto_settings_stack_timer) {
    clearTimeout(process_auto_settings_stack_timer);

    process_auto_settings_stack_timer = undefined;
  }

  chrome.storage.sync.get(null, function(sync_data) {
    var changed = false;

    while(auto_settings_stack_fifo.length > 0) {
      var data = auto_settings_stack_fifo.shift();

      var domain = data['domain'];
      var kind = data['kind'];
      var code = data['code'];

      if(validates_code(code, sync_data['auto_settings']['website_events'])) {
        if(sync_data['disabled_' + domain] == undefined) {
          sync_data['disabled_' + domain] = {};
        }

        if(!sync_data['disabled_' + domain][kind]) {
          sync_data['disabled_' + domain][kind] = {}
        }

        if(sync_data['disabled_' + domain][kind][code] == undefined) {
          changed = true;
          sync_data['disabled_' + domain][kind][code] = false;
        }
      }

      if(validates_code(code, sync_data['auto_settings']['default_events'])) {
        if(!sync_data['default_disabled_' + kind]) {
          sync_data['default_disabled_' + kind] = {}
        }

        if(sync_data['default_disabled_' + kind][code] == undefined) {
          changed = true;
          sync_data['default_disabled_' + kind][code] = false;
        }
      }

    }

    if(changed) { chrome.storage.sync.set(sync_data); }
  });
}

// ----------------------------------

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(message.action == 'log_input') {
    auto_settings_stack_fifo.push({
      domain: message.domain,
      kind: message.data.kind,
      code: message.data.type
    });

    if(!process_auto_settings_stack_timer) {
      process_auto_settings_stack_timer = setTimeout(function() {
        process_auto_settings_stack();
      }, 2000);
    }
  }
});
