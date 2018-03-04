$(document).ready(function() {
  load_template('html/settings/templates/performance/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            disable_text: chrome.i18n.getMessage('disableText'),
            performance_options: {
              popup: {
                title: chrome.i18n.getMessage('settingsPopupTitle'),
                code_details: {
                  label: chrome.i18n.getMessage('checkboxShowCodeDetails'),
                  value: !sync_data['popup']['show_code_details'],
                  checked: !sync_data['popup']['show_code_details']
                }
              },
              reports: {
                title: chrome.i18n.getMessage('settingsReportsTitle'),
                generation: {
                  label: chrome.i18n.getMessage('settingsEnableReportsGenerationText'),
                  value: !sync_data['reports']['collect_data'],
                  checked: !sync_data['reports']['collect_data']
                }
              },
              auto_settings: {
                title: chrome.i18n.getMessage('settingsAutomaticSettingsOptionsTitle'),
                domains: {
                  title: chrome.i18n.getMessage('settingsDomainDetectedTitle'),
                  code_injection: {
                    label: chrome.i18n.getMessage('settingsAddDomainToCodeInjectionLabel'),
                    value: 'code_injection',
                    checked: !sync_data['auto_settings']['domains']['code_injection']
                  },
                  website_rules: {
                    label: chrome.i18n.getMessage('settingsAddDomainToWebsiteRulesLabel'),
                    value: 'website_rules',
                    checked: !sync_data['auto_settings']['domains']['website_rules']
                  }
                },
                events: {
                  title: chrome.i18n.getMessage('settingsEventDetectedTitle'),
                  default_rules: {
                    label: chrome.i18n.getMessage('settingsAddEventToDefaultTitle'),
                    value: 'none',
                    checked: (sync_data['auto_settings']['default_events'] == 'none')
                  },
                  website_rules: {
                    label: chrome.i18n.getMessage('settingsAddEventToWebsiteTitle'),
                    value: 'none',
                    checked: (sync_data['auto_settings']['website_events'] == 'none')
                  }
                }
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
