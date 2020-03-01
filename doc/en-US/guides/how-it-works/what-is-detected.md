> *If you find some missing information or errors in any of the translations, help us by opening a [pull request](https://github.com/gbaptista/luminous/pulls) with the necessary modifications in the texts.*

# Guides
> [back to index](../)

## What is detected?
> en-US | [es](../../../es/guides/how-it-works/what-is-detected.md) | [pt-BR](../../../pt-BR/guides/how-it-works/what-is-detected.md)

- [How is it organized?](#how-is-it-organized)
- [Automatic settings](#automatic-settings)

| WebAPI         | method                | intercepted?                                                                   | reported?                                                                      | can be blocked?                                                                 |
| -------------- | --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| EventTarget    | removeEventListener   | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![x](../../../../images/doc/global/guides/x.png)                               | ![x](../../../../images/doc/global/guides/x.png)                               |
| EventTarget    | addEventListener      | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Battery Status | getBattery            | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Fetch API      | fetch                 | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Gamepad API    | getGamepads           | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Geolocation    | getCurrentPosition    | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Geolocation    | watchPosition         | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| HTTP headers   | User-Agent            | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| NavigatorID    | userAgent             | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Window         | setInterval           | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Window         | setTimeout            | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| Window         | requestAnimationFrame | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| WebSocket      | send                  | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| XMLHttpRequest | open                  | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |
| XMLHttpRequest | send                  | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) | ![white_check_mark](../../../../images/doc/global/guides/white_check_mark.png) |

`EventTarget.removeEventListener` is not reported because it is only an interception to not break websites because of `EventTarget.addEventListener` interception.

## How is it organized?

All codes intercepted are divided into 3 groups:
- [Web APIs](#web-apis)
- [*EventTarget.addEventListener*](#eventtargetaddeventlistener)
  - [handleEvent](#handleevent)
  - [addEventListener](#addeventlistener)

### Web APIs

Some JavaScripts are reported with a different nomenclature to get closer to the actual written code or to facilitate understanding:

| JavaScript                     | reported as            | example code                                         |
| ------------------------------ | ---------------------- | ---------------------------------------------------- |
| (Battery Status).getBattery    | getBattery             | `navigator.getBattery().then(fn)`                    |
| (Fetch API).fetch              | fetch                  | `fetch('f.txt').then(fn)`                            |
| (Gamepad API).getGamepads      | getGamepads            | `navigator.getGamepads()`                            |
| Geolocation.getCurrentPosition | geo.getCurrentPosition | `navigator.geolocation.getCurrentPosition(fn)`       |
| Geolocation.watchPosition      | geo.watchPosition      | `navigator.geolocation.watchPosition(fn)`            |
| (HTTP headers).User-Agent      | headers.User-Agent     | *`accessed by code on server side`*                  |
| NavigatorID.userAgent          | NavigatorID.userAgent  | `window.navigator.userAgent`                         |
| Window.setInterval             | setInterval            | `setInterval(function() { }, 1000)`                  |
| Window.setInterval (execution) | setInterval.call       | `setInterval(function() { /*call*/ }, 1000)`         |
| Window.setTimeout              | setTimeout             | `setTimeout(function() { }, 1000)`                   |
| Window.setTimeout (execution)  | setTimeout.call        | `setTimeout(function() { /*call*/ }, 1000)`          |
| Window.requestAnimationFrame   | requestAnimationFrame  | `requestAnimationFrame(function() { /*call*/ })`     |
| WebSocket.send                 | WebSocket.send         | `(new WebSocket('ws://host:80')).send('hello')`      |
| XMLHttpRequest.open            | XMLHttpRequest.open    | `(new XMLHttpRequest()).open('GET', 'f.txt')`        |
| XMLHttpRequest.send            | XMLHttpRequest.send    | `(new XMLHttpRequest()).open('GET', 'f.txt').send()` |

> *`fn` = some callback function, example: `var fn = function(response) { console.log(response); }`*

`EventTarget.addEventListener` is not reported in this group because we give a different attention to this `EventTarget` method.

### EventTarget.addEventListener

`addEventListener` is used to report to the website when an event occurs. An event can be literally anything, so we've created a special session to look at the events that each site is trying to look at. Example:
```javascript
document.getElementById('some-form-textarea-element').addEventListener(
  'keypress', function(event) { console.log('key pressed: ' + event.key); }
);
```

Some common examples of events:

| event name   | fired when                        |
| ------------ | --------------------------------- |
| beforeunload | you close some tab of the browser |
| copy         | you copy some text with `ctrl+c`  |
| keypress     | you type some text                |
| mousemove    | you move your mouse pointer       |
| wheel        | you try to scroll the page        |

What about the `handleEvent` group? Consider this code:

```javascript
some_image.addEventListener('mousemove', function(_event) {
  send_report('the user is moving the mouse over the image');
});
```

`addEventListener` will be reported once, but every time the mouse is moved over the image, `send_report` will be called, that's what we call `handleEvent`.

If you block an event in `addEventListener`, you will never see it in `handleEvent` because it will never be called, however, to unblock the event you will need to reload the page.

If the event is allowed in `addEventListener` you will see it every time it is triggered in `handleEvent` and you can block/unblock it inside `handleEvent` without needing to reload the page.

#### handleEvent

All triggered events that have been added with the `EventTarget.addEventListener` method.

#### addEventListener

All events that have been added to be reported with `handleEvent`.

### Automatic settings

Luminous has some categories at *automatic settings* about the `EventTarget.addEventListener` events names:

- [none](#none)
- [common](#common)
- [almost all](#almost-all)
- [all](#all)

### none

No events.

### common

A predefined list of common events:
```javascript
[
  // Resource Events
  'abort', 'beforeunload', 'unload',
  // Focus Events
  'focus', 'blur',
  // Websocket Events
  'open', 'message', 'close',
  // Session History Events
  'pagehide', 'pageshow', 'popstate',
  // Form Events
  'reset', 'submit',
  // Text Composition Events
  'compositionstart', 'compositionupdate', 'compositionend',
  // View Events
  'fullscreenchange', 'fullscreenerror', 'resize', 'scroll',
  // Clipboard Events
  'cut', 'copy', 'paste',
  // Keyboard Events
  'keydown', 'keypress', 'keyup',
  // Mouse Events
  'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup', 'auxclick',
  'click', 'dblclick', 'contextmenu', 'wheel', 'mouseleave', 'mouseout',
  'select', 'pointerlockchange', 'pointerlockerror',
  // Drag & Drop Events
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
  // Media Events
  'canplay', 'canplaythrough', 'ended', 'play', 'playing', 'pause', 'volumechange',
  // Storage events
  'storage', 'change',
  // Value change events
  'broadcast', 'CheckboxStateChange', 'hashchange', 'input',
  'RadioStateChange', 'readystatechange', 'ValueChange',
  // Gamepad API events
  'gamepadconnected', 'gamepaddisconnected',
  // Uncategorized events
  'localized', 'message', 'open', 'show'
]
```

### almost all
Some events from the list of *common events* or an event that follows a rule of not having special characters, example:

- Valid *almost all* events: `someEvent` `anotherevent` `SomeEventB`
- Invalid *almost all* events: `yt-something` `image:uploaded` `my_event`

### all

Any event.
