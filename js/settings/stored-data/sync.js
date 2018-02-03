$(document).ready(function() {
  var loaded = function() {
    $('#loading').fadeOut(200);
  };

  var loading = function() {
    $('#loading').fadeIn(200);
  }

  chrome.storage.sync.getBytesInUse(null, function(bytesUsed) {
    $('#used').html((bytesUsed/1000000).toFixed(2) + ' MB');
  });

  $('#clear').click(function() {
    if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
      chrome.storage.sync.clear(function() {
        location.reload();
      });
    }
  });

  var load_json = function() {
    chrome.storage.sync.get(null, function(sync_data) {
      load_template('html/settings/templates/stored-data/json.html', function(template) {
        $('.options').html('');

        for(key in sync_data) {
          $('.options').append(
            Mustache.render(template, {
              title: key + ':',
              json: JSON.stringify(sync_data[key], 1, ' ')
            })
          );
        }

        if(Object.keys(sync_data).length == 0) {
          load_template('html/settings/templates/stored-data/empty.html', function(template) {
            $('.options').html(
              Mustache.render(
                template, { text: chrome.i18n.getMessage('settingsStorageEmptyText') }
              )
            );
          });
        }

        loaded();
      });
    });
  }

  load_json();

  chrome.storage.onChanged.addListener(function(_changes, namespace) {
    if(namespace == 'sync') {
      loading();
      load_json();
    }
  });

});
