$(document).ready(function() {
  load_template('html/settings/templates/injection/form.html', function(template) {
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
            general_injection_enabled: !sync_data['options']['injection_disabled']['general'],
            placeholder: chrome.i18n.getMessage('settingsNewDomainPlaceHolderText'),
            domains: domains
          })
        );

        observe_form();

        $('.remove-domain').click(function() {
          event.preventDefault();

          if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
            remove_sync_option('injection_disabled', $(this).data('domain'));
          }
        });

        $('#form form').submit(function(event) {
          loading(function() {
            var new_domain = 'https://' + $('#new-domain').val().toLowerCase().replace(
              /.*:\/\//, ''
            ).replace(/\s/g, '');

            var a_element = document.createElement('a');
            a_element.href = new_domain;

            if(a_element.hostname && a_element.hostname != window.location.hostname) {
              set_sync_option(a_element.hostname, true, 'injection_disabled');
              $('#new-domain').val('');
            } else {
              alert(chrome.i18n.getMessage('settingsInvalidDomainMessage'));
              loaded();
            }
          });
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
