var cached_templates = {};

var load_template = function(path, callback_function) {
  if(cached_templates[path]) {
    callback_function(cached_templates[path]);
  } else {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
        cached_templates[path] = request.responseText;

        callback_function(cached_templates[path]);
      }
    }
    request.open('GET', chrome.extension.getURL(path), true);
    request.send(null);
  }
}
