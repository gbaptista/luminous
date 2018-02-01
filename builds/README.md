# Luminous ![Icon](../images/icons/48.png)

## Build Instructions

Update the version on `manifest.json`:
```json
"version": "0.0.5"
```

Copy all folders and files to the `builds/current/` directory.

Remove those files and directories:
```
├ builds/current/
│ ├ builds/
│ ├ _config.yml
│ ├ .git/
│ ├ images/inkscape-files/
│ ├ images/krita-files/
│ └ images/stores/
```

Install [*UglifyJS*](https://github.com/mishoo/UglifyJS):
```shell
npm install uglify-js -g
```

Compress the `builds/current/js/content/interceptor.js` code:
```shell
uglifyjs -c -m -- builds/current/js/content/interceptor.js
```

Change the `builds/current/js/content/injections/interceptor.js` content from:

```javascript
injections_controller(function() {

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
    javascript_injection.setAttribute('nonce', '3b34aae43a');
    javascript_injection.innerHTML = content;
    document.documentElement.insertBefore(javascript_injection, document.documentElement.firstChild);
  });

});
```

To:
```javascript
injections_controller(function() {

  var content = 'UGLIFYJS_RESULT';

  var javascript_injection = document.createElement('script');
  javascript_injection.type = 'text/javascript';
  javascript_injection.setAttribute('nonce', '3b34aae43a');
  javascript_injection.innerHTML = content;
  document.documentElement.insertBefore(javascript_injection, document.documentElement.firstChild);

});
```

Test the current build at least in these 4 browsers:

- *Chromium*
- *Google Chrome*
- *Mozilla Firefox*
- *Opera*

Compress the `builds/current/` content to a *.zip* file with the version: `0-0-5.zip` and contact the repository owner to publish in all stores.
