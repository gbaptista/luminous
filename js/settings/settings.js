$(document).ready(function() {
  $('#loading').html(chrome.i18n.getMessage('messageLoading'));
  $('title').html(chrome.i18n.getMessage('manifestName'));

  $('.locale').each(function() {
    $(this).html(chrome.i18n.getMessage($(this).data('locale')));
  });

  $('.locale-url').each(function() {
    $(this).attr('href', chrome.i18n.getMessage($(this).data('locale-url')));
  });

  load_template('html/settings/templates/nav.html', function(template) {
    $('nav').html(
      Mustache.render(template, {
        links: [
          {
            title: chrome.i18n.getMessage('settingsAdvancedTitle'),
            url: chrome.extension.getURL('html/settings/advanced.html')
          },
          {
            title: chrome.i18n.getMessage('settingsStoredDataSyncTitle'),
            url: chrome.extension.getURL('html/settings/stored-data/sync.html')
          },
          {
            title: chrome.i18n.getMessage('settingsStoredDataLocalTitle'),
            url: chrome.extension.getURL('html/settings/stored-data/local.html')
          },
        ]
      })
    );
  });

  load_template('html/settings/templates/header.html', function(template) {
    $('header').html(Mustache.render(
      template,
      {
        title: chrome.i18n.getMessage('settingsTitle'),
        icon_path: chrome.extension.getURL('images/icons/32.png')
      },
    ));
  });

});
