$(document).ready(function() {
  load_template('html/settings/templates/badge/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get('options', function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),

            badge_options: {
              title: 'Badge options:',
              counter: {
                title: 'Counter displayed:',
                sum_by_title: 'somar por:',
                sum_by: [
                  {
                    label: 'executions', value: 'executions',
                    checked: 'executions' ==  sync_data['options']['badge_counter']['sum_by']
                  },
                  {
                    label: 'kind', value: 'kind',
                    checked: 'kind' ==  sync_data['options']['badge_counter']['sum_by']
                  },
                ],
                executions_title: 'contar uma execução quando ela for:',
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
                kinds_title: 'tipos de execuções contadas:',
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
            }
          })
        );

        observe_form();

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
