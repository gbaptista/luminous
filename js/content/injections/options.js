injections_controller(function() {

  var load_options_for_domain = function(domain) {
    chrome.storage.sync.get(null, function(sync_data) {
      if(!sync_data['disabled_' + domain]) {
        sync_data['disabled_' + domain] = {};
      }

      var kinds = [];

      for(possible_kind in sync_data) {
        var regex = /^default_disabled_/;
        if(regex.test(possible_kind)) {
          kinds.push(possible_kind.replace(regex, ''));
        }
      }

      // Apply default rules
      for(i in kinds) {
        var kind = kinds[i];

        if(!sync_data['disabled_' + domain][kind]) {
          sync_data['disabled_' + domain][kind] = {};
        }

        for(code in sync_data['default_disabled_' + kind]) {
          if(sync_data['disabled_' + domain][kind][code] == undefined) {
            if(sync_data['default_disabled_' + kind][code]) {
              sync_data['disabled_' + domain][kind][code] = sync_data['default_disabled_' + kind][code];
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

        if(changes['disabled_' + domain] && changes['disabled_' + domain].newValue) {
          if(changes['disabled_' + domain].oldValue) {
            disabled_for_domain = changes['disabled_' + domain].newValue != changes['disabled_' + domain].oldValue;
          } else {
            disabled_for_domain = true;
          }
        }

        if(changes) {
          var default_keys = [];

          for(possible_kind in changes) {
            var regex = /^default_disabled_/;
            if(regex.test(possible_kind)) {
              default_keys.push(possible_kind.replace(regex, ''));
            }
          }

          if(default_keys.length > 0) {
            disabled_for_domain = true;
          }
        }

        var injection_disabled_for_domain = false;
        var injection_disabled_for_general = false;

        if(changes['injection_disabled'] && changes['injection_disabled'].newValue) {
          if(changes['injection_disabled'] && changes['injection_disabled'].oldValue) {
            injection_disabled_for_domain = changes['injection_disabled'].newValue[domain] != changes['injection_disabled'].oldValue[domain];
            injection_disabled_for_general = changes['injection_disabled'].newValue['general'] != changes['injection_disabled'].oldValue['general'];
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
