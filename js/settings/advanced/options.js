$(document).ready(function() {
  load_template('html/settings/templates/advanced/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            advanced_options: {
              injection: {
                title: chrome.i18n.getMessage('settingsInjectionTitle'),
                strategy: {
                  label: chrome.i18n.getMessage('settingsFilterResponseDataTitle'),
                  value: sync_data['advanced']['try_filter_response_data'],
                  checked: sync_data['advanced']['try_filter_response_data']
                }
              },
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
