chrome.runtime.onConnect.addListener(function (port) {
  chrome.runtime.onMessage.addListener(function (message, sender) {
    port.postMessage(message);
  });
});
