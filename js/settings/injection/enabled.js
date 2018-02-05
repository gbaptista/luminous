$(document).ready(function() {
  var filter_domain = function() {
    setTimeout(function() {
      $('.nothing-found').hide();

      var search = $('#filter-domains').val();
      var regex = new RegExp(search, 'i');
      var some_checkbox = false;

      $('.domain-check').each(function(_i, checkbox) {
        if(regex.test($(checkbox).data('domain'))) {
          some_checkbox = true;
          $(checkbox).show();
        } else {
          $(checkbox).hide();
        }
      });

      if(some_checkbox) {
        $('.nothing-found').hide();
      } else {
        $('.nothing-found').show();
      }
    }, 0);
  };

  load_template('html/settings/templates/rules/search.html', function(template) {
    $('.search').html(
      Mustache.render(template, {
        title: chrome.i18n.getMessage('settingsFilterWebsitesText'),
        placeholder_filter: chrome.i18n.getMessage('settingsSearchByDomainPlaceHolderText')
      })
    );

    $('#filter-domains').keydown(function() {
      filter_domain();
    });
  });

  load_template('html/settings/templates/injection/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get('options', function(sync_data) {
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

        $('.remove-domain').click(function(event) {
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
              $('#filter-domains').val('');
              set_sync_option(a_element.hostname, true, 'injection_disabled');
              $('#new-domain').val('');
            } else {
              alert(chrome.i18n.getMessage('settingsInvalidDomainMessage'));
              loaded();
            }
          });
        });

        filter_domain();

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
