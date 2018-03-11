var loaded = function() {
  $('#loading').fadeOut(200);
}

var loading = function(callback) {
  $('#loading').fadeIn(200, function() {
    if(callback) callback();
  });
}

var remove_sync_option = function(namespace, key) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      if(key) {
        delete sync_data[namespace][key];

        chrome.storage.sync.set(sync_data, function() { loaded(); });
      } else {
        chrome.storage.sync.remove(namespace, function() { loaded(); });
      }
    });
  }, 0);
};

var set_sync_option = function(name, value, namespace, value_as_namespace) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      if (namespace == 'disabled') {
        if(sync_data['disabled_' + name] == undefined) {
          sync_data['disabled_' + name] = value;
        }
      } else {
        if(namespace == 'injection_disabled') {
          value = !value;
        }

        if(value_as_namespace) {
          if(!sync_data[namespace][name]) sync_data[namespace][name] = {};

          sync_data[namespace][name][value_as_namespace] = value;
        } else {
          sync_data[namespace][name] = value;
        }
      }

      chrome.storage.sync.set(sync_data, function() {
        loaded();
      });
    });
  }, 0);
};

var observe_form = function() {
  apply_locales();

  $('#form form').submit(function(event) {
    event.preventDefault();
  });

  $('#form input').change(function() {
    if($(this).attr('type') == 'checkbox' || $(this).attr('type') == 'radio') {
      loading();

      var name = $(this).attr('name');
      var value = $(this).val();
      var value_as_namespace = false;

      if($(this).data('value-as-namespace')) {
        value_as_namespace = value;
      }

      if($(this).attr('type') == 'checkbox') {
        value = $(this).is(':checked');

        if($(this).data('reverse')) {
          value = !value;
        }
      }

      namespace = $(this).data('namespace');

      if(value && $(this).data('true-value')) {
        value = $(this).data('true-value');
      }

      if(!value && $(this).data('false-value')) {
        value = $(this).data('false-value');
      }

      set_sync_option(name, value, namespace, value_as_namespace);
    }
  });
}

var apply_locales = function() {
  $('.locale').each(function() {
    $(this).html(chrome.i18n.getMessage($(this).data('locale')));
  });

  $('.locale-url').each(function() {
    $(this).attr('href', chrome.i18n.getMessage($(this).data('locale-url')));
  });
}

$(document).ready(function() {
  $('#loading').html(chrome.i18n.getMessage('messageLoading'));
  $('title').html(chrome.i18n.getMessage('manifestName'));

  apply_locales();

  load_template('html/settings/templates/nav.html', function(template) {
    $('.navbar').html(
      Mustache.render(template, {
        links: [
          {
            title: chrome.i18n.getMessage('settingsCodeInjectionTitle'),
            url: chrome.extension.getURL('html/settings/injection/enabled.html'),
            active: (document.location.pathname == '/html/settings/injection/enabled.html')
          },
          {
            title: chrome.i18n.getMessage('settingsBlockDefaultTitle'),
            url: chrome.extension.getURL('html/settings/rules/default.html'),
            active: (document.location.pathname == '/html/settings/rules/default.html')
          },
          {
            title: chrome.i18n.getMessage('settingsBlockPerDomainTitle'),
            url: chrome.extension.getURL('html/settings/rules/per-domain.html'),
            active: (document.location.pathname == '/html/settings/rules/per-domain.html')
          },
          {
            title: chrome.i18n.getMessage('settingsReportsTitle'),
            url: chrome.extension.getURL('html/settings/reports/charts.html'),
            active: (document.location.pathname == '/html/settings/reports/charts.html')
          },
          {
            title: chrome.i18n.getMessage('settingsPopupTitle'),
            url: chrome.extension.getURL('html/settings/popup/options.html'),
            active: (document.location.pathname == '/html/settings/popup/options.html')
          },
          {
            title: chrome.i18n.getMessage('settingsBadgeCounterTitle'),
            url: chrome.extension.getURL('html/settings/badge/counter.html'),
            active: (document.location.pathname == '/html/settings/badge/counter.html')
          },
          {
            title: chrome.i18n.getMessage('settingsAutomaticSettingsOptionsTitle'),
            url: chrome.extension.getURL('html/settings/background/options.html'),
            active: (document.location.pathname == '/html/settings/background/options.html')
          },
          {
            title: chrome.i18n.getMessage('settingsBackgroundPerformanceTitle'),
            url: chrome.extension.getURL('html/settings/performance/options.html'),
            active: (document.location.pathname == '/html/settings/performance/options.html')
          },
          {
            title: chrome.i18n.getMessage('settingsStoredDataSyncTitle'),
            url: chrome.extension.getURL('html/settings/stored-data/sync.html'),
            active: (document.location.pathname == '/html/settings/stored-data/sync.html')
          },
          {
            title: chrome.i18n.getMessage('settingsStoredDataLocalTitle'),
            url: chrome.extension.getURL('html/settings/stored-data/local.html'),
            active: (document.location.pathname == '/html/settings/stored-data/local.html')
          },
        ]
      })
    );
  });
});
