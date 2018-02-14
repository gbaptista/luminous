> *If you find some missing information or errors in any of the translations, help us by opening a [pull request](https://github.com/gbaptista/luminous/pulls) with the necessary modifications in the texts.*

# Guides
> [back to index](../)

## Interception
> en-US | [es](../../../es/guides/how-it-works/interception.md) | [pt-BR](../../../pt-BR/guides/how-it-works/interception.md)

- [The problem](#the-problem)
- [Solution](#solution)
- [Results](#results)

### The problem
We were able to ensure that a script was loaded before anything else on the page:

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["interceptor.js"],
      "run_at" : "document_start"
    }
  ]
}
```

With that we can prevent something from happening:
```javascript
// interceptor.js
EventTarget.prototype.addEventListener = function(_type, _listener, _options) {
  // do nothing
};

// document page
document.getElementById('some-button').addEventListener('click', function(_e) {
  // will never be fired
  alert('clicked');
});
```

However, if the interception code needs to perform some asynchronous operation, such as verifying if the user has disabled or not the interception, our code will no longer work:

```javascript
// interceptor.js
browser.storage.sync.get('options', function(options) {
  if(options.enabled) {
    EventTarget.prototype.addEventListener = function(_type, _listener, _options) {
      // do nothing
    };
  }
});

// document page
document.getElementById('some-button').addEventListener('click', function(_e) {
  // will be fired
  alert('clicked');
});
```

This has nothing to do with how long the operation takes, it's just how JavaScript works. This code for example will present the same problem, it will not be able to make the interception:

```javascript
// interceptor.js
setTimeout(function() {
  EventTarget.prototype.addEventListener = function(_type, _listener, _options) {
    // do nothing
  };
}, 0);

// document page
document.getElementById('some-button').addEventListener('click', function(_e) {
  // will be fired
  alert('clicked');
});
```

To better understand how all this works, I strongly recommend this talk by *Philip Roberts*: [*What the heck is the event loop anyway?*](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

### Solution

I believe that there is no definitive solution at the moment. At Luminous we use 4 strategies to try to inject the options as fast as we can. These strategies were built thanks to several people from other projects who worked on the issue and shared their knowledge (see *"Not being able to guarantee interception [#55](https://github.com/gbaptista/luminous/issues/55)"*).

> *Discalimer: This is not the actual Luminous code, it's just a simplified version to demonstrate how it works.*

The `manifest.js`:
```json
{
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
    {
      "run_at": "document_start",
      "js": ["content.js"]
    }
  ]
}
```

The [test page](https://gbaptista.github.io/luminous/html/demo-page-interceptor.html):
```html

<script>
  var a = document.createElement('a');
  a.addEventListener('click', function(_) { return 'first script'; });
  var c = document.createEvent('MouseEvents');
  c.initMouseEvent('click');
  a.dispatchEvent(c);

  setInterval(function() { return 'first script'; } , 1000);

  setTimeout(function() {
    var a = document.createElement('a');
    a.addEventListener('click', function(_) { return 'second script'; });
    var c = document.createEvent('MouseEvents');
    c.initMouseEvent('click');
    a.dispatchEvent(c);
  }, 15);
</script>

demo page
```

The strategies:

- [Cookies](#cookies)
- [onCommitted](#oncommitted)
- [sendMessage](#sendMessage)
- [storage.get](#storageget)

#### Cookies

Using [*js-cookie*](https://github.com/js-cookie/js-cookie):

```javascript
// background.js
var options = undefined;

browser.storage.sync.get('options', function(stored_options) {
  options = stored_options;
}

var set_cookies = function(request_details) {
  request_details.responseHeaders.push({
    name: 'Set-Cookie',
    value: 'enabled=' + options.enabled + '; Path=/; Max-Age=1'
  });

  return { responseHeaders: request_details.responseHeaders };
}

browser.webRequest.onHeadersReceived.addListener(
  set_cookies, { 'urls': ['<all_urls>'] }, ['responseHeaders', 'blocking']
);

// content.js
if(Cookies.get('enabled')) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = 'EventTarget.prototype.addEventListener = function(_, _, _) { // do nothing };';
  document.documentElement.insertBefore(script, document.documentElement.firstChild);
}

Cookies.remove('enabled', { path: '/' });
```

**Warning 1:**

From [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived):

> *Note that it is possible for extensions to conflict here. If two extensions listen to `onHeadersReceived` for the same request, then the second listener will see modifications made by the first listener, and will be able to undo any changes made by the first listener. For example, if the first listener adds a `Set-Cookie` header, and the second listener strips all `Set-Cookie` headers, then the first listener's modifications will be lost.*

**Warning 2:**

Make sure you do not let the cookies leak. We use `Max-Age=1` (1 second) and `Cookies.remove` immediately after reading it.

**Warning 3:**

Cookies have [limits](http://browsercookielimits.squawky.net/).

At Luminous we use the strategy of compressing the settings and then decompressing them. Example:

Original settings:
```json
{
  "WebAPIs": {
    "XMLHttpRequest.open": true,
    "XMLHttpRequest.send": true,
    "geo.getCurrentPosition": true,
    "geo.watchPosition": true,
    "setInterval": true,
    "setInterval.call": true,
    "setTimeout": true,
    "setTimeout.call": true
  },
  "addEventListener": {
    "blur": true,
    "click": true,
    "focus": true,
    "focusout": true,
    "input": true,
    "keydown": true,
    "keypress": true,
    "keyup": true,
    "mousemove": true,
    "mouseout": true,
    "mouseover": true,
    "scroll": true
  },
  "handleEvent": {
    "mousemove": true,
    "mouseout": true,
    "mouseover": true
  }
}
```

Compressed settings (cookie value):
```
6:7:8:9:2:3:4:5:18:74:16:a-focusout:130:56:58:60:66:84:64:48:67:85:65
```

**Warning 4:**

Maybe the visited site uses a cookie with the same name as yours, this can cause problems, check if there are no cookies with the name you want in the headers before defining them.

#### onCommitted
```javascript
// background.js
var options = undefined;

browser.storage.sync.get('options', function(stored_options) {
  options = stored_options;
}

browser.webNavigation.onCommitted.addListener(function(details) {
  browser.tabs.sendMessage(
    details.tabId, {
      action: 'options_from_on_committed',
      enabled: options.enabled
    }
  );
});

// content.js
browser.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if(message.action == 'options_from_on_committed') {
    if(message.enabled) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = 'EventTarget.prototype.addEventListener = function(_, _, _) { // do nothing };';
      document.documentElement.insertBefore(script, document.documentElement.firstChild);
    }
  }
});
```

**Warning:**
Async solution, it is necessary to wait for the empty stack to inject the code.

#### sendMessage
```javascript
// background.js
var options = undefined;

browser.storage.sync.get('options', function(stored_options) {
  options = stored_options;
}

browser.runtime.onMessage.addListener(function(message, _sender, sendResponse) {
  if(message.action == 'request_enabled_option') {
    sendResponse({ enabled: options.enabled });
  }
});

// content.js
browser.runtime.sendMessage({ action: 'request_enabled_option' }, function(response) {
  if(response.enabled) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = 'EventTarget.prototype.addEventListener = function(_, _, _) { // do nothing };';
    document.documentElement.insertBefore(script, document.documentElement.firstChild);
  }
});
```

**Warning:**
Async solution, it is necessary to wait for the empty stack to inject the code.

#### storage.get
```javascript
// background.js
// > empty file

// content.js
browser.storage.sync.get('options', function(stored_options) {
  if(stored_options.enabled) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = 'EventTarget.prototype.addEventListener = function(_, _, _) { // do nothing };';
    document.documentElement.insertBefore(script, document.documentElement.firstChild);
  }
});
```

**Warning:**
Async solution, it is necessary to wait for the empty stack to inject the code.

### Results

Using a cookie is the only synchronous solution with guarantees that no code execution will be lost. That said, let's see which of the other solutions can be faster:

#### Chromium-based browsers
```
         cookies:  5 milliseconds
     onCommitted: 37 milliseconds
storage.sync.get: 49 milliseconds
     sendMessage: 84 milliseconds
```

#### Gecko-based browsers:
```
         cookies:   3 milliseconds
     onCommitted: 169 milliseconds
storage.sync.get: 177 milliseconds
     sendMessage: 210 milliseconds
```

#### Opera:
```
         cookies:  7 milliseconds
     onCommitted: 31 milliseconds
storage.sync.get: 41 milliseconds
     sendMessage: 59 milliseconds
```

Do you know another solution? Have you tried any of these? Join the discussion! > [https://github.com/gbaptista/luminous/issues/55](https://github.com/gbaptista/luminous/issues/55)
