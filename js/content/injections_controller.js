var injections_controller = function(injection_function) {
  chrome.storage.sync.get(null, function(sync_data) {

    injection_disabled = sync_data['injection_disabled'];

    if(!injection_disabled['general'] && !injection_disabled[window.location.hostname]) {
      injection_function();
    }

  });
}
