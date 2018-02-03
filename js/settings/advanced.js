$(document).ready(function() {
  var loaded = function() {
    $('#loading').fadeOut(200);
  }

  var loading = function() {
    $('#loading').fadeIn(200);
  }

  var set_sync_option = function(name, value, namespace, value_as_namespace) {
    setTimeout(function() {
      chrome.storage.sync.get(null, function(sync_data) {
        if(namespace == 'injection_disabled') { value = !value; }

        if(value_as_namespace) {
          if(!sync_data['options'][namespace][name]) sync_data['options'][namespace][name] = {};
          sync_data['options'][namespace][name][value_as_namespace] = value;
        } else {
          sync_data['options'][namespace][name] = value;
        }

        chrome.storage.sync.set(sync_data);
      });
    }, 0);
  };

  load_template('html/settings/templates/advanced/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        var domains = [];

        for(domain in sync_data['options']['injection_disabled']) {
          if(domain != 'general') {
            domains.push({
              domain: domain,
              enabled: !sync_data['options']['injection_disabled'][domain]
            });
          }
        }

        $('#form').html(
          Mustache.render(template, {
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_listener_functions_title: chrome.i18n.getMessage('checkboxShowListenerFunctions'),

            badge_options: {
              title: 'Badge options:',
              counter: {
                title: 'Counter displayed:',
                group_by: [
                  {
                    label: 'executions', value: 'executions',
                    checked: 'executions' ==  sync_data['options']['badge_counter']['group_by']
                  },
                  {
                    label: 'kind', value: 'kind',
                    checked: 'kind' ==  sync_data['options']['badge_counter']['group_by']
                  },
                ],
                executions: [
                  {
                    label: 'Allowed + blocked', value: 'allowed_blocked',
                    checked: 'allowed_blocked' ==  sync_data['options']['badge_counter']['executions']
                  },
                  {
                    label: 'Allowed', value: 'allowed',
                    checked: 'allowed' ==  sync_data['options']['badge_counter']['executions']
                  },
                  {
                    label: 'blocked', value: 'blocked',
                    checked: 'blocked' ==  sync_data['options']['badge_counter']['executions']
                  }
                ],
                kinds: [
                  {
                    label: 'WebAPIs', value: 'WebAPIs',
                    checked: sync_data['options']['badge_counter']['kinds']['WebAPIs']
                  },
                  {
                    label: 'handleEvent', value: 'handleEvent',
                    checked: sync_data['options']['badge_counter']['kinds']['handleEvent']
                  },
                  {
                    label: 'addEventListener', value: 'addEventListener',
                    checked: sync_data['options']['badge_counter']['kinds']['addEventListener']
                  }
                ]
              }
            },
            popup_options_title: 'Popup options:',
            injection_title: 'Injection enabled for:',
            general_injection_enabled: !sync_data['options']['injection_disabled']['general'],
            show_listener_functions: sync_data['options']['popup']['show_listener_functions'],
            domains: domains
          })
        );

        $('#form input').change(function() {
          loading();

          var name = $(this).attr('name');
          var value = $(this).val();
          var value_as_namespace = false;

          if($(this).data('value-as-namespace')) {
            value_as_namespace = value;
          }

          if($(this).attr('type') == 'checkbox') {
            value = $(this).is(':checked');
          }

          namespace = $(this).data('namespace');

          set_sync_option(name, value, namespace, value_as_namespace);
        });

        loaded();
      });
    }

    chrome.storage.onChanged.addListener(function(changes, _namespace) {
      if(changes['options']) {
        loading();
        load_sync_data();
      }
    });

    load_sync_data();
  });
});
