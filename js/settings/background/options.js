$(document).ready(function() {
  load_template('html/settings/templates/background/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get('options', function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            domain_detected_title: 'when a new website is accessed:',
            add_domain_to_items: [
              {
                label: 'add to code injection',
                value: 'code_injection',
                checked: sync_data['options']['auto_settings']['domains']['code_injection']
              },
              {
                label: 'add to website rules',
                value: 'website_rules',
                checked: sync_data['options']['auto_settings']['domains']['website_rules']
              }
            ],
            event_detected_title: 'when a new JavaScript event is detected:',
            add_event_to_default_rules_title: 'add to default rules:',
            add_event_to_default_rules_items: [
              {
                label: 'nothing',
                value: 'nothing',
                checked: 'nothing' == sync_data['options']['auto_settings']['default_events']
              },
              {
                label: 'common events',
                value: 'common',
                checked: 'common' == sync_data['options']['auto_settings']['default_events']
              },
              {
                label: 'all events',
                value: 'all',
                checked: 'all' == sync_data['options']['auto_settings']['default_events']
              }
            ],
            add_event_to_website_rules_title: 'add to website rules:',
            add_event_to_website_rules_items: [
              {
                label: 'nothing',
                value: 'nothing',
                checked: 'nothing' == sync_data['options']['auto_settings']['website_events']
              },
              {
                label: 'common events',
                value: 'common',
                checked: 'common' == sync_data['options']['auto_settings']['website_events']
              },
              {
                label: 'all events',
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
