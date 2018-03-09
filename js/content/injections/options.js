injections_controller(function() {
  var a_element = document.createElement('a');

  var inject_options_for_domain = function(options, from) {
    var json_options_element = document.getElementById('luminous-options');
    
    if(!json_options_element) {
    //   var json_options_injection = document.createElement('script');
    //   json_options_injection.type = 'application/json';
    //   json_options_injection.id = 'luminous-options';
    //   json_options_injection.innerHTML = JSON.stringify(options);
    //   json_options_injection.setAttribute('data-changed', 'true');
    //   if(from) {
    //     json_options_injection.setAttribute('data-from', from);
    //   }
    //   document.documentElement.insertBefore(json_options_injection, document.documentElement.firstChild);
    } else {
      // json_options_element.innerHTML = JSON.stringify(options);
      // json_options_element.setAttribute('data-changed', 'true');
    }
  }

  if(Cookies.get('ld')) {
    var collect_details = (Cookies.get('ld') == 't') ? true : false;

    var options = {
      disabled: uncompress_settings(Cookies.get('ls')),
      collect_details: collect_details
    }

    if(!options['injection_disabled']) options['injection_disabled'] = false;

    inject_options_for_domain(options, 'cookies');
  }

  var received_from_on_message = false;

  var option_definer = setInterval(function() {
    try {
      chrome.runtime.sendMessage({ action: 'options_from_on_message' }, function(response) {
        if(response && response.options) {
          clearInterval(option_definer);
          if(!received_from_on_message) {
            received_from_on_message = true;

            inject_options_for_domain(response.options, 'setInterval:sendMessage');
          }
        }
      });
    } catch(_) {
      clearInterval(option_definer);
    }
  }, 0);

  chrome.runtime.sendMessage({ action: 'current_cached_settings' }, function(response) {
    if(response) {
      clearInterval(option_definer);

      if(!received_from_on_message) {
        received_from_on_message = true;

        inject_options_for_domain(options, 'sendMessage');
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    if(
      message.action == 'options_from_on_committed'
      &&
      window.location.host == message.domain
    ) {
      inject_options_for_domain(message.options, 'onCommitted');
    }
  });

  var load_options_for_domain = function(domain) {
    chrome.storage.sync.get(null, function(sync_data) {
      sync_data = apply_settings_for_domain(sync_data, domain);

      var options = {};

      options['disabled'] = sync_data['disabled_' + domain];
      options['injection_disabled'] = (
        sync_data['injection_disabled']['general'] || sync_data['injection_disabled'][domain]
      );

      if(!options['injection_disabled']) options['injection_disabled'] = false;

      options['collect_details'] = sync_data['popup']['show_code_details'];

      inject_options_for_domain(options, 'storage.sync');
    });
  }

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(namespace == 'sync') {
      chrome.runtime.sendMessage({ action: 'main_url_for_tab' }, function(response) {
        var domain = window.location.hostname;

        if(response && response.url) {
          a_element.href = response.url;
          domain = a_element.hostname;
        }

        if(changes) {
          var popup_changed = false;

          if(changes['popup'] && changes['popup'].newValue) {
            if(changes['popup'].oldValue) {
              if(changes['popup'].oldValue['show_code_details'] != changes['popup'].newValue['show_code_details']) {
                popup_changed = true;
              }
            } else {
              popup_changed = true;
            }
          }

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

          if(popup_changed || disabled_for_domain || injection_disabled_for_domain || injection_disabled_for_general) {
            load_options_for_domain(domain);
          }
        }
      });
    }
  });

  load_options_for_domain(window.location.hostname);
});
