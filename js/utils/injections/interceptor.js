var load_interceptor_element = function(callback_function) {

  var load_content = function(path, content_callback_function) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
        content_callback_function(request.responseText);
      }
    }
    request.open('GET', chrome.extension.getURL(path), true);
    request.send(null);
  }

  load_content('js/content/interceptor.js', function(full_content) {
    var files = full_content.split(
      /\/\/ [#|\/]load_injectors/g
    )[1].replace(/\s/g, '').split('//');

    var loaded_files = {};

    for(i in files) {
      if(files[i] != '') {
        loaded_files[files[i]] = undefined;
      }
    }

    var try_to_full_load = function() {
      var full_loaded = true;
      for(file in loaded_files) {
        if(loaded_files[file] == undefined) {
          full_loaded = false;
        }
      }

      if(full_loaded) {
        for(file in loaded_files) {
          full_content = full_content.replace('// ' + file, loaded_files[file]);
        }

        var javascript_injection = document.createElement('script');
        javascript_injection.id = 'luminous-interceptor';
        javascript_injection.setAttribute('class', 'luminous-interceptor');
        javascript_injection.type = 'text/javascript';
        javascript_injection.setAttribute('nonce', '3b34aae43a');
        javascript_injection.innerHTML = full_content;

        callback_function(javascript_injection);
      }
    }

    var load_interceptor = function(file) {
      load_content('js/content/' + file, function(content) {
        loaded_files[file] = content;

        try_to_full_load();
      });
    }

    for(file in loaded_files) {
      load_interceptor(file);
    }
  });
}
