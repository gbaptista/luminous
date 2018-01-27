var render_data = function(document_data, tab_id) {
  chrome.storage.local.get(tab_id, function(current_storage_data) {
    var calls = 0;

    if(document_data && document_data['counters']) {
      for(key in document_data['counters']) {
        for(sub_key in document_data['counters'][key]) {
          var allowed = document_data['counters'][key][sub_key]['allowed'];
          var blocked = document_data['counters'][key][sub_key]['blocked'];

          // calls += allowed + blocked;
          if(key != 'WebAPIs') calls += allowed;
        }
      }
    } else {
      if(!document_data) document_data = {};
      document_data['counters'] = {};
    }

    tab_id = tab_id.toString();

    var data_to_write = current_storage_data;

    if(!data_to_write) { data_to_write = {}; }
    if(!data_to_write[tab_id]) { data_to_write[tab_id] = {}; }

    data_to_write[tab_id]['badge'] = {
      'text': short_number_for_badge(calls), 'calls': calls
    };

    data_to_write[tab_id]['counters'] = document_data['counters'];

    chrome.storage.local.set(data_to_write);
  });
}

setInterval(function() {
  var data_element = document.getElementById('luminous-data');

  if(data_element && data_element.getAttribute('data-changed') == 'true') {
    var tab_id = data_element.getAttribute('data-tab');

    if(tab_id) {
      data_element.setAttribute('data-changed', 'false');

      render_data(JSON.parse(data_element.innerHTML), tab_id);
    }
  }
}, 200);
