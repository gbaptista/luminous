injections_controller(function(should_inject) {
  if(should_inject) {
    load_data_element('contentScript', function(element) {
      document.documentElement.insertBefore(
        element, document.documentElement.firstChild
      );
    });
  }

  var tab_definer = setInterval(function() {
    try {
      chrome.runtime.sendMessage({ action: 'current_tab_id' }, function(response) {
        var element = document.getElementById('luminous-data');

        if(element && response) {
          clearInterval(tab_definer);
          element.setAttribute('data-tab', response.current_tab_id);
        } else if(!element) {
          // Not inejected!
          clearInterval(tab_definer);
        }
      });
    } catch(_) {
      clearInterval(tab_definer);
    }
  }, 300);

});
