$(document).ready(function() {
  load_template('html/settings/templates/background/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            domain_detected_title: chrome.i18n.getMessage('settingsDomainDetectedTitle'),
            add_domain_to_items: [
              {
                label: chrome.i18n.getMessage('settingsAddDomainToCodeInjectionLabel'),
                value: 'code_injection',
                checked: sync_data['auto_settings']['domains']['code_injection']
              },
              {
                label: chrome.i18n.getMessage('settingsAddDomainToWebsiteRulesLabel'),
                value: 'website_rules',
                checked: sync_data['auto_settings']['domains']['website_rules']
              }
            ],
            event_detected_title: chrome.i18n.getMessage('settingsEventDetectedTitle'),
            add_event_to_default_rules_title: chrome.i18n.getMessage('settingsAddEventToDefaultTitle') + ':',
            add_event_to_default_rules_items: [
              {
                label: chrome.i18n.getMessage('settingsAddEventNoneLabel'),
                value: 'none',
                checked: 'none' == sync_data['auto_settings']['default_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventCommonLabel'),
                value: 'common',
                checked: 'common' == sync_data['auto_settings']['default_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAlmostAllLabel') + ' (' + chrome.i18n.getMessage('settingsNotRecommendedText') + ')',
                value: 'almost_all',
                checked: 'almost_all' == sync_data['auto_settings']['default_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAllLabel') + ' (' + chrome.i18n.getMessage('settingsDefinitelyNotRecommendedText') + ')',
                value: 'all',
                checked: 'all' == sync_data['auto_settings']['default_events']
              }
            ],
            add_event_to_website_rules_title: chrome.i18n.getMessage('settingsAddEventToWebsiteTitle') + ':',
            add_event_to_website_rules_items: [
              {
                label: chrome.i18n.getMessage('settingsAddEventNoneLabel'),
                value: 'none',
                checked: 'none' == sync_data['auto_settings']['website_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventCommonLabel'),
                value: 'common',
                checked: 'common' == sync_data['auto_settings']['website_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAlmostAllLabel'),
                value: 'almost_all',
                checked: 'almost_all' == sync_data['auto_settings']['website_events']
              },
              {
                label: chrome.i18n.getMessage('settingsAddEventAllLabel') + ' (' + chrome.i18n.getMessage('settingsNotRecommendedText') + ')',
                value: 'all',
                checked: 'all' == sync_data['auto_settings']['website_events']
              }
            ]
          })
        );

        apply_locales();

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
