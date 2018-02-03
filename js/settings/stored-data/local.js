$(document).ready(function() {
  var loaded = function() {
    $('#loading').fadeOut(200);
  };

  try {
    chrome.storage.local.getBytesInUse(null, function(bytesUsed) {
      $('#used').html((bytesUsed/1000000).toFixed(2) + ' MB | ');
    });
  } catch (_) {
    $('#used').remove();
  }

  $('#clear').click(function() {
    if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
      chrome.storage.local.clear(function() {
        location.reload();
      });
    }
  });

  chrome.storage.local.get(null, function(local_data) {
    load_template('html/settings/templates/stored-data/json.html', function(template) {
      $('.tabs').html('');

      for(tab_id in local_data) {
        $('.tabs').append(
          Mustache.render(template, {
            title: chrome.i18n.getMessage('settingsTabText') + ' ' + tab_id + ' (' + chrome.i18n.getMessage('settingsTabClosedText') + '):',
            id: 'tab-' + tab_id,
            json: JSON.stringify(local_data[tab_id], 1, ' ')
          })
        );

        chrome.tabs.get(parseInt(tab_id), function(tab) {
          if(tab) {
            $('#tab-' + tab.id).html(chrome.i18n.getMessage('settingsTabText') + ' ' + tab.id + ' (' + tab.url + '):');
          }
        });
      }

      if(Object.keys(local_data).length == 0) {
        load_template('html/settings/templates/stored-data/empty.html', function(template) {
          $('.tabs').html(
            Mustache.render(
              template, { text: chrome.i18n.getMessage('settingsStorageEmptyText') }
            )
          );
        });
      }

      loaded();
    });
  });
});
