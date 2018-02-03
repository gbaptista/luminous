$(document).ready(function() {
  var loaded = function() {
    $('#loading').fadeOut(200);
  }

  var loading = function() {
    $('#loading').fadeIn(200);
  }

  var set_sync_option = function(name, value) {
    setTimeout(function() {
      chrome.storage.sync.get(null, function(sync_data) {
        if(!sync_data['options']) sync_data['options'] = {}
        if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};

        if(name == 'show_listener_functions') {
          sync_data['options'][name] = value;
        } else {
          sync_data['options']['injection_disabled'][name] = !value;
        }

        chrome.storage.sync.set(sync_data);
      });
    }, 0);
  };

  load_template('html/settings/templates/advanced/form.html', function(template) {
    var load_sync_data = function() {
      chrome.storage.sync.get(null, function(sync_data) {
        if(!sync_data) sync_data = {};
        if(!sync_data['options']) sync_data['options'] = {};
        if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};

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
            show_listener_functions_title: chrome.i18n.getMessage('checkboxShowListenerFunctions'),
            popup_options: 'Popup options:',
            injection_title: 'Injection enabled for:',
            general_injection_enabled: !sync_data['options']['injection_disabled']['general'],
            show_listener_functions: sync_data['options']['show_listener_functions'],
            domains: domains
          })
        );

        $('#form input').change(function() {
          loading();

          var value = $(this).is(':checked');
          var name = $(this).attr('name');

          set_sync_option(name, value);
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
