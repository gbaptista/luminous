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
});
