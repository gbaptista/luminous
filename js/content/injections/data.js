injections_controller(function() {

  var json_data_injection = document.createElement('script');
  json_data_injection.type = 'application/json';
  json_data_injection.id = 'luminous-data';
  json_data_injection.setAttribute('data-changed', 'true');
  json_data_injection.innerHTML = 'null';
  document.documentElement.insertBefore(json_data_injection, document.documentElement.firstChild);

  var tab_definer = setInterval(function() {
    try {
      chrome.runtime.sendMessage({ action: 'current_tab_id' }, function(response) {
        var element = document.getElementById('luminous-data');

        if(element && response) {
          clearInterval(tab_definer);
          element.setAttribute('data-tab', response.current_tab_id);
        }
      });
    } catch(_) {
      clearInterval(tab_definer);
    }
  }, 300);
  
});
