var current_port = undefined;

chrome.runtime.onMessage.addListener(function (message, sender) {
  if(current_port) { current_port.postMessage(message); }
});

chrome.runtime.onConnect.addListener(function (port) {
  current_port = port;
});

chrome.runtime.onDisconnect.addListener(function (port) {
  current_port = undefined;
});
