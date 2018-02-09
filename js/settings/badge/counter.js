$(document).ready(function() {
  load_template('html/settings/templates/badge/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),

            badge_options: {
              counter: {
                sum_by_title: chrome.i18n.getMessage('settingsBadgeCounterSumByTitle'),
                sum_by: [
                  {
                    label: chrome.i18n.getMessage('settingsBadgeCounterSumByExecutionsLabel'),
                    value: 'executions',
                    checked: 'executions' ==  sync_data['badge_counter']['sum_by']
                  },
                  {
                    label: chrome.i18n.getMessage('settingsBadgeCounterSumByKindLabel'),
                    value: 'kind',
                    checked: 'kind' ==  sync_data['badge_counter']['sum_by']
                  },
                ],
                executions_title: chrome.i18n.getMessage('settingsBadgeCounterExectutionsTitle'),
                executions: [
                  {
                    label: chrome.i18n.getMessage('allowedText') + ' + ' + chrome.i18n.getMessage('blockedText'),
                    value: 'allowed_blocked',
                    checked: 'allowed_blocked' ==  sync_data['badge_counter']['executions']
                  },
                  {
                    label: chrome.i18n.getMessage('allowedText'),
                    value: 'allowed',
                    checked: 'allowed' ==  sync_data['badge_counter']['executions']
                  },
                  {
                    label: chrome.i18n.getMessage('blockedText'),
                    value: 'blocked',
                    checked: 'blocked' ==  sync_data['badge_counter']['executions']
                  }
                ],
                kinds_title: chrome.i18n.getMessage('settingsBadgeCounterKindsTitle'),
                kinds: [
                  {
                    label: chrome.i18n.getMessage('titleWebAPIs'),
                    value: 'WebAPIs',
                    checked: sync_data['badge_counter']['kinds']['WebAPIs']
                  },
                  {
                    label: chrome.i18n.getMessage('titleHandleEvent'),
                    value: 'handleEvent',
                    checked: sync_data['badge_counter']['kinds']['handleEvent']
                  },
                  {
                    label: chrome.i18n.getMessage('titleAddEventListener'),
                    value: 'addEventListener',
                    checked: sync_data['badge_counter']['kinds']['addEventListener']
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

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(namespace == 'sync' && changes) {
        loading();
        load_sync_data();
      }
    });

    load_sync_data();
  });
});
