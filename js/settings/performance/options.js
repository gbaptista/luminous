$(document).ready(function() {
  load_template('html/settings/templates/performance/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),

            performance_options: {
              popup: {
                title: 'popup',
                code_details: {
                  label: 'disable code details',
                  value: !sync_data['popup']['show_code_details'],
                  checked: !sync_data['popup']['show_code_details']
                }
              },
              reports: {
                title: 'reports',
                generation: {
                  label: 'disable reports generation',
                  value: !sync_data['reports']['collect_data'],
                  checked: !sync_data['reports']['collect_data']
                }
              },
              auto_settings: {
                title: 'automatic settings',
                domains: {
                  title: 'new website is accessed',
                  code_injection: {
                    label: 'disable add to [code injection]',
                    value: 'code_injection',
                    checked: !sync_data['auto_settings']['domains']['code_injection']
                  },
                  website_rules: {
                    label: 'disable add to [website rules]',
                    value: 'website_rules',
                    checked: !sync_data['auto_settings']['domains']['website_rules']
                  }
                },
                events: {
                  title: 'when javascript detected',
                  website_rules: {
                    label: 'disable website_rules',
                    value: 'none',
                    checked: (sync_data['auto_settings']['website_events'] == 'none')
                  },
                  default_rules: {
                    label: 'disable default_rules',
                    value: 'none',
                    checked: (sync_data['auto_settings']['default_events'] == 'none')
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
