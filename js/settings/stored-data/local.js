$(document).ready(function() {
  var loaded = function() {
    $('html, body').css('overflow', 'auto');
    $('#loading').fadeOut(200);
  };

  chrome.storage.local.getBytesInUse(null, function(bytesUsed) {
    $('#used').html((bytesUsed/1000000).toFixed(2) + ' MB');
  });

  $('#clear').click(function() {
    if(confirm('are you sure?')) {
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
            title: 'Tab ' + tab_id + ' (closed):',
            id: 'tab-' + tab_id,
            json: JSON.stringify(local_data[tab_id], 1, ' ')
          })
        );

        chrome.tabs.get(parseInt(tab_id), function(tab) {
          if(tab) {
            $('#tab-' + tab.id).html('Tab ' + tab.id + ' (' + tab.url + '):');
          }
        });
      }

      if(Object.keys(local_data).length == 0) {
        load_template('html/settings/templates/stored-data/empty.html', function(template) {
          $('.tabs').html(
            Mustache.render(template, { text: 'empty' } )
          );
        });
      }

      loaded();
    });
  });
});
