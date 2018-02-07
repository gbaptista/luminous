$(document).ready(function() {
  load_template('html/settings/templates/background/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get('options', function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            domain_detected_title: chrome.i18n.getMessage('settingsDomainDetectedTitle'),
            add_domain_to_items: [
              {
                label: chrome.i18n.getMessage('settingsAddDomainToCodeInjectionLabel'),
                value: 'code_injection',
                checked: sync_data['options']['auto_settings']['domains']['code_injection']
              },
              {
                label: chrome.i18n.getMessage('settingsAddDomainToWebsiteRulesLabel'),
                value: 'website_rules',
                checked: sync_data['options']['auto_settings']['domains']['website_rules']
              }
            ],
            event_detected_title: chrome.i18n.getMessage('settingsEventDetectedTitle'),
            add_event_to_default_rules_title: chrome.i18n.getMessage('settingsAddEventToDefaultTitle'),
            add_event_to_default_rules_items: [
              {
                label: chrome.i18n.getMessage('settingsAddEventNothingLabel'),
                value: 'nothing',
                checked: 'nothing' == sync_data['options']['auto_settings']['default_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventCommonLabel'),
                value: 'common',
                checked: 'common' == sync_data['options']['auto_settings']['default_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAllLabel'),
                value: 'all',
                checked: 'all' == sync_data['options']['auto_settings']['default_events']
              }
            ],
            add_event_to_website_rules_title: chrome.i18n.getMessage('settingsAddEventToWebsiteTitle'),
            add_event_to_website_rules_items: [
              {
                label: chrome.i18n.getMessage('settingsAddEventNothingLabel'),
                value: 'nothing',
                checked: 'nothing' == sync_data['options']['auto_settings']['website_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventCommonLabel'),
                value: 'common',
                checked: 'common' == sync_data['options']['auto_settings']['website_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAllLabel'),
                value: 'all',
                checked: 'all' == sync_data['options']['auto_settings']['website_events']
              }
            ]
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
