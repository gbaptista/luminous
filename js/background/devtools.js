chrome.runtime.onConnect.addListener(function (port) {
  if(port.name == 'devtools_tunnel') {
    var post_message = function (message, _sender) {
      if(message.action == 'log_input') { port.postMessage(message); }
    };

    port.onDisconnect.addListener(function (port) {
      chrome.runtime.onMessage.removeListener(post_message);
    });

    chrome.runtime.onMessage.addListener(post_message);
  }

  if(port.name == 'devtools_tab_id') {
    chrome.tabs.query(
      { currentWindow:true, active: true, lastFocusedWindow: true },
      function(tabs) {
        if(tabs[0]) {
          var a_element = document.createElement('a');
          a_element.href = tabs[0].url;
          var domain = a_element.hostname;

          port.postMessage( { id: tabs[0].id, domain: domain });
        }
      }
    );
  }
});
