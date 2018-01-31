injections_controller(function() {

  var json_data_injection = document.createElement('script');
  json_data_injection.type = 'application/json';
  json_data_injection.id = 'luminous-data';
  json_data_injection.setAttribute('data-changed', 'true');
  json_data_injection.innerHTML = 'null';
  document.documentElement.insertBefore(json_data_injection, document.documentElement.firstChild);

});

var current_tab_id_injected = false;

chrome.runtime.onMessage.addListener(function(message, sender, _sendResponse) {
  if(!current_tab_id_injected && message.action == 'set_current_tab_id') {
    var element = document.getElementById('luminous-data');

    if(element) {
      current_tab_id_injected = true;
      element.setAttribute('data-tab', message.current_tab.id);
    }
  }
});
