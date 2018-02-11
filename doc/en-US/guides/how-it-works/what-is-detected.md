> *If you find some missing information or errors in any of the translations, help us by opening a [pull request](https://github.com/gbaptista/luminous/pulls) with the necessary modifications in the texts.*

# Guides
> [back to index](../)

## What is detected?
> en-US | [es](../../../es/guides/how-it-works/what-is-detected.md) | [pt-BR](../../../pt-BR/guides/how-it-works/what-is-detected.md)

- [How is it organized?](#how-is-it-organized)
- [Automatic settings](#automatic-settings)

| WebAPI         | method              | intercepted?       | reported?          | can be bocked?     |
| -------------- | ------------------- | ------------------ | ------------------ | ------------------ |
| EventTarget    | removeEventListener | :white_check_mark: | :x:                | :x:                |
| EventTarget    | addEventListener    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Window         | setTimeout          | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Window         | setInterval         | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| WebSocket      | send                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Fetch API      | fetch               | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| XMLHttpRequest | open                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| XMLHttpRequest | send                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Geolocation    | getCurrentPosition  | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Geolocation    | watchPosition       | :white_check_mark: | :white_check_mark: | :white_check_mark: |

`EventTarget.removeEventListener` is not reported because it is only an interception to not break websites because of `EventTarget.addEventListener` interception.

## How is it organized?

All codes intercepted are divided into 3 groups:
- [Web APIs](#web-apis)
- [EventTarget.addEventListener](#eventtarget.addeventlistener)
  - [handleEvent](#handleevent)
  - [addEventListener](#addeventlistener)

### Web APIs

Some JavaScript's are reported with a different nomenclature to get closer to the actual written code or to facilitate understanding:

| JavaScript                     | reported as            |
| -------------------------------| ---------------------- |
| Window.setTimeout              | setTimeout             |
| Window.setTimeout (execution)  | setTimeout.call        |
| Window.setInterval             | setInterval            |
| Window.setInterval (execution) | setInterval.call       |
| WebSocket.send                 | WebSocket.send         |
| (Fetch API).fetch              | fetch                  |
| XMLHttpRequest.open            | XMLHttpRequest.open    |
| XMLHttpRequest.send            | XMLHttpRequest.send    |
| Geolocation.getCurrentPosition | geo.getCurrentPosition |
| Geolocation.watchPosition      | geo.watchPosition      |

`EventTarget.addEventListener` is not reported in this group because we give a differentiated attention to this `EventTarget` method.

### EventTarget.addEventListener

`addEventListener` is used to report to the website when an event occurs. An event can be literally anything, so we've created a special session to look at the events that each site is trying to look at. Some common examples of events:

| event name   | fired when                        |
| ------------ | --------------------------------- |
| beforeunload | you close some tab of the browser |
| copy         | you copy some text with `ctrl+c`  |
| keypress     | you type some text                |
| mousemove    | you move your mouse pointer       |
| wheel        | you try to scroll the page        |

What about the `handleEvent` group? Consider this code:

```javascript
some_image.addEventListener('mousemove', function() {
  send_report('the user is moving the mouse over the image')
});
```

`addEventListener` will be reported once, but every time the mouse is moved over the image, `send_report` will be called, that's what we call `hanleEvent`.

If you block an event in `addEventListener`, you will never see it in `hanleEvent` because it will never be called, however, to unblock the event you will need to reload the page.

If the event is allowed in `addEventListener` you will see it every time it is triggered in `hanleEvent` and you can block/unblock it inside `hanleEvent` without needing to reload the page.

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
  // Uncategorized events
  'localized', 'message', 'open', 'show'
]
```

### almost all
Some event from the list of *common events* or that follows a rule of not having special characters, example:

- Valid *almost all* events: `someEvent` `anotherevent` `SomeEventB`
- Invalid *almost all* events: `yt-something` `image:uploaded` `my_event`

### all

Any event.
