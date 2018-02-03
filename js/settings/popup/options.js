$(document).ready(function() {
  load_template('html/settings/templates/popup/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        $('#form').html(
          Mustache.render(template, {
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),
            show_code_details: sync_data['options']['popup']['show_code_details']
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
