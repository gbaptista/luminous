var injections_controller = function(injection_function) {
  chrome.storage.sync.get('options', function(sync_data) {
    if(!sync_data['options']) sync_data['options'] = {};
    if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};

    injection_disabled = sync_data['options']['injection_disabled'];

    if(!injection_disabled['general'] && !injection_disabled[window.location.hostname]) {
      injection_function();
    }
  });
}
