var load_interceptor = function(callback_function) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
      callback_function(request.responseText);
    }
  }
  request.open('GET', chrome.extension.getURL('js/content/interceptor.js'), true);
  request.send(null);
}

load_interceptor(function(content) {
  var javascript_injection = document.createElement('script');
  javascript_injection.type = 'text/javascript';
  javascript_injection.innerHTML = content;
  document.documentElement.insertBefore(javascript_injection, document.documentElement.firstChild);
});
