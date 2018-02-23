# Luminous ![Icon](../images/icons/48.png)

## Build Instructions

Update the version on `manifest.json`:
```json
"version": "0.0.18"
```

Copy all folders and files to the `builds/current/` directory.

Install [*npm*](https://www.npmjs.com/):
```
sudo apt-get install npm
```

Install [*UglifyJS*](https://github.com/mishoo/UglifyJS):
```shell
sudo npm install uglify-js -g
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

 /*
  * Disclaimer for reviewers:
  *
  * The non-minified version for the code below is available at:
  * https://github.com/gbaptista/luminous/blob/0.0.18/js/content/interceptor.js
  *
  * This version was generated with the uglifyjs project
  * from the following command:
  * > uglifyjs -c -m -- js/content/interceptor.js
  *
  * This was done for performance reasons.
  */
  var content = 'UGLIFYJS_RESULT';

  var javascript_injection = document.createElement('script');
  javascript_injection.type = 'text/javascript';
  javascript_injection.setAttribute('nonce', '3b34aae43a');
  javascript_injection.innerHTML = content;
  document.documentElement.insertBefore(javascript_injection, document.documentElement.firstChild);

});
```

Remove those files and directories:
```
├ builds/current/
│ ├ .git/
│ ├ builds/
│ ├ doc/
│ ├ html/demo-page.html
│ ├ html/external-content.txt
│ ├ html/interface-sample.html
│ ├ images/doc/
│ ├ images/inkscape-files/
│ ├ images/krita-files/
│ ├ images/stores/
│ ├ js/content/interceptor.js
│ ├ _config.yml
│ └ README.md
```

Test the current build at least in these 4 browsers:

- *Chromium*
- *Google Chrome*
- *Mozilla Firefox*
- *Opera*

Compress the `builds/current/` content to a *.zip* file with the version: `0.0.18.zip` and contact the repository owner to publish in all stores.

Include this note for reviewers:
```
The non-minified version for the code in "js/content/injections/interceptor.js" is available at: https://github.com/gbaptista/luminous/blob/0.0.18/js/content/interceptor.js

This version was generated with the uglifyjs project from the following command:
> uglifyjs -c -m -- js/content/interceptor.js

This was done for performance reasons.
```
