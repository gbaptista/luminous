$(document).ready(function() {
  $('#loading').html(chrome.i18n.getMessage('messageLoading'));
  $('title').html(chrome.i18n.getMessage('manifestName'));

  load_template('html/settings/templates/nav.html', function(template) {
    $('nav').html(
      Mustache.render(template, {
        links: [
          { title: 'Advanced', url: chrome.extension.getURL('html/settings/advanced.html') },
          { title: 'Stored Data: Sync', url: chrome.extension.getURL('html/settings/stored-data/sync.html') },
          { title: 'Stored Data: Local', url: chrome.extension.getURL('html/settings/stored-data/local.html') },
        ]
      })
    );
  });

  load_template('html/settings/templates/header.html', function(template) {
    $('header').html(Mustache.render(
      template,
      {
        title: 'Settings',
        icon_path: chrome.extension.getURL('images/icons/32.png')
      },
    ));
  });

});
