injections_controller(function() {

  var load_options_for_domain = function(domain) {
    chrome.storage.sync.get(null, function(sync_data) {
      if(!sync_data['disabled_' + domain]) {
        sync_data['disabled_' + domain] = {};
      }

      // Apply default rules
      for(kind in sync_data['default_disabled']) {
        if(!sync_data['disabled_' + domain][kind]) {
          sync_data['disabled_' + domain][kind] = {};
        }

        for(code in sync_data['default_disabled'][kind]) {
          if(sync_data['disabled_' + domain][kind][code] == undefined) {
            if(sync_data['default_disabled'][kind][code]) {
              sync_data['disabled_' + domain][kind][code] = sync_data['default_disabled'][kind][code];
            }
          }
        }
      }

      var options = {}

      options['disabled'] = sync_data['disabled_' + domain];
      options['injection_disabled'] = (
        sync_data['injection_disabled']['general'] || sync_data['injection_disabled'][domain]
      );

      options['collect_details'] = sync_data['popup']['show_code_details'];

      var json_options_element = document.getElementById('luminous-options');

      if(!json_options_element) {
        var json_options_injection = document.createElement('script');
        json_options_injection.type = 'application/json';
        json_options_injection.id = 'luminous-options';
        json_options_injection.innerHTML = JSON.stringify(options);
        json_options_injection.setAttribute('data-changed', 'true');
        document.documentElement.insertBefore(json_options_injection, document.documentElement.firstChild);
      } else {
        json_options_element.innerHTML = JSON.stringify(options);
        json_options_element.setAttribute('data-changed', 'true');
      }
    });
  }

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(namespace == 'sync') {
      var domain = window.location.hostname;

      if(changes) {
        changes = changes;

        var disabled_for_domain = false;
        if(changes.newValue && changes.newValue['disabled_' + domain]) {
          if(changes.oldValue && changes.oldValue['disabled_' + domain]) {
            disabled_for_domain = changes.newValue['disabled_' + domain] != changes.oldValue['disabled_' + domain];
          } else {
            disabled_for_domain = true;
          }
        }

        var injection_disabled_for_domain = false;
        var injection_disabled_for_general = false;

        if(changes.newValue && changes.newValue['injection_disabled']) {
          if(changes.oldValue && changes.oldValue['injection_disabled']) {
            injection_disabled_for_domain = changes.newValue['injection_disabled'][domain] != changes.oldValue['injection_disabled'][domain];
            injection_disabled_for_general = changes.newValue['injection_disabled']['general'] != changes.oldValue['injection_disabled']['general'];
          } else {
            injection_disabled_for_domain = true;
            injection_disabled_for_general = true;
          }
        }

        if(disabled_for_domain || injection_disabled_for_domain || injection_disabled_for_general) {
          load_options_for_domain(domain);
        }
      }
    }
  });

  load_options_for_domain(window.location.hostname);

});
