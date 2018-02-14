var original_window_setInterval = window.setInterval;

var cached_options = { injection_disabled: false };
var collect_details = undefined;

var get_options = function() {
  var json_options_element = document.getElementById('luminous-options');

  if(json_options_element && json_options_element.getAttribute('data-changed') == 'true') {
    cached_options = JSON.parse(json_options_element.innerHTML);

    collect_details = cached_options['collect_details'];

    json_options_element.setAttribute('data-changed', 'false');
  }

  return cached_options;
}

var original_window_setTimeout = window.setTimeout;

var reload_requested = false;

var counters = { addEventListener: {}, handleEvent: {}, WebAPIs: {} };
var last_url = window.location.href.replace(/#.*/, '');
var counters_changed = false;

setInterval(function() {
  var current_url = window.location.href.replace(/#.*/, '');

  if(last_url != current_url) {
    last_url = current_url;
    counters = { addEventListener: {}, handleEvent: {}, WebAPIs: {} };
    counters_changed = true;
  }
}, 100);

var increment_counter = function(kind, type, result, details) {
  original_window_setTimeout(function() {
    details = {
      target: '' + details['target'],
      code: (collect_details ? ('' + details['code']).slice(0, 400) : undefined)
    };

    if(counters[kind][type] == undefined) {
      counters[kind][type] = { allowed: 0, blocked: 0 };
    }

    counters[kind][type][result] += 1;

    if(!collect_details) {
      counters[kind][type]['samples'] = [details];
    } else {
      if(!counters[kind][type]['samples']) {
        counters[kind][type]['samples'] = [];
      }

      counters[kind][type]['samples'].push(details);

      if(counters[kind][type]['samples'].length > 3) {
        counters[kind][type]['samples'] = counters[kind][type]['samples'].slice(-3);
      }
    }

    document.getElementById('luminous-data').dispatchEvent(
      new MessageEvent(
        'luminous-message',
        { data: JSON.stringify(
          {
            url: document.location.href,
            kind: kind, type: type, result: result, details: details
          }
        ) }
      )
    );

    counters_changed = true;
  }, 0);
}

var is_allowed = function(kind, type) {
  var options = get_options();

  if(!options['disabled']) options['disabled'] = {};
  if(!options['disabled'][kind]) options['disabled'][kind] = {};

  return !options['disabled'][kind][type];
}

if(!get_options()['injection_disabled']) {
  // EventTarget ---------------------------------------------
  var removeEventListener_alias = {};

  var original_EventTarget_removeEventListener = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    var super_this = this;

    var value_to_return_a = original_EventTarget_removeEventListener.call(
      super_this, type, listener, options
    );

    if(removeEventListener_alias[type] && removeEventListener_alias[type][listener]) {
      var value_to_return_b = original_EventTarget_removeEventListener.call(
        super_this, type, removeEventListener_alias[type][listener], options
      );

      return value_to_return_a || value_to_return_b;
    } else {
      return value_to_return_a;
    }
  };

  var original_EventTarget_addEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_EventTarget_addEventListener.call(
        super_this, type, listener, options
      );
    } else {
      var details = { target: super_this, code: listener };

      if(!is_allowed('addEventListener', type)) {
        increment_counter('addEventListener', type, 'blocked', details);
      } else {
        increment_counter('addEventListener', type, 'allowed', details);

        var wraped_listener = {
          handleEvent: function (event) {
            if(!is_allowed('handleEvent', type)) {
              increment_counter('handleEvent', type, 'blocked', details);
            } else {
              increment_counter('handleEvent', type, 'allowed', details);

              if (typeof(listener) === 'function') {
                return listener(event);
              } else {
                return listener.handleEvent(event);
              }
            }
          }
        };

        if(!removeEventListener_alias[type]) removeEventListener_alias[type] = {};

        removeEventListener_alias[type][listener] = wraped_listener;

        return original_EventTarget_addEventListener.call(
          super_this, type, wraped_listener, options
        );
      }
    }
  }

  // WebSocket ---------------------------------------------

  var original_WebSocket_send = WebSocket.prototype.send;

  WebSocket.prototype.send = function(data) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_WebSocket_send.call(super_this, data);
    } else {
      var details = { target: super_this, code: data };

      if(!is_allowed('WebAPIs', 'WebSocket.send')) {
        increment_counter('WebAPIs', 'WebSocket.send', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'WebSocket.send', 'allowed', details);

        return original_WebSocket_send.call(super_this, data);
      }
    }
  }

  // Geolocation ---------------------------------------------

  if(navigator.geolocation) {
    var original_navigator_geolocation_getCurrentPosition = navigator.geolocation.getCurrentPosition;

    navigator.geolocation.getCurrentPosition = function(success, error, options) {
      var super_this = this;

      if(get_options()['injection_disabled']) {
        original_navigator_geolocation_getCurrentPosition.call(
          super_this, success, error, options
        );
      } else {
        var details = { target: super_this, code: JSON.stringify(options) };

        var wraped_success = function(pos) {
          if(!is_allowed('WebAPIs', 'geo.getCurrentPosition')) {
            increment_counter('WebAPIs', 'geo.getCurrentPosition', 'blocked', details);
          } else {
            increment_counter('WebAPIs', 'geo.getCurrentPosition', 'allowed', details);

            success(pos);
          }
        }

        return original_navigator_geolocation_getCurrentPosition.call(
          super_this, wraped_success, error, options
        );
      }
    }

    var original_navigator_geolocation_watchPosition = navigator.geolocation.watchPosition;

    navigator.geolocation.watchPosition = function(success, error, options) {
      var super_this = this;

      if(get_options()['injection_disabled']) {
        return original_navigator_geolocation_watchPosition.call(
          super_this, success, error, options
        );
      } else {
        var details = { target: super_this, code: JSON.stringify(options) };

        var wraped_success = function(pos) {
          if(!is_allowed('WebAPIs', 'geo.watchPosition')) {
            increment_counter('WebAPIs', 'geo.watchPosition', 'blocked', details);
          } else {
            increment_counter('WebAPIs', 'geo.watchPosition', 'allowed', details);

            success(pos);
          }
        }

        return original_navigator_geolocation_watchPosition.call(
          super_this, wraped_success, error, options
        );
      }
    }
  }
  // XMLHttpRequest ---------------------------------------------

  var original_XMLHttpRequest_open = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function(method, url, is_async, user, password) {
    var super_this = this;

    if(is_async === undefined) is_async = true;

    if(get_options()['injection_disabled']) {
      return original_XMLHttpRequest_open.call(
        super_this, method, url, is_async, user, password
      );
    } else {
      var details = { target: method, code: url };

      if(!is_allowed('WebAPIs', 'XMLHttpRequest.open')) {
        increment_counter('WebAPIs', 'XMLHttpRequest.open', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'XMLHttpRequest.open', 'allowed', details);

        return original_XMLHttpRequest_open.call(
          super_this, method, url, is_async, user, password
        );
      }
    }
  }

  var original_XMLHttpRequest_send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function(body) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_XMLHttpRequest_send.call(super_this, body);
    } else {
      var details = { target: super_this, code: body };

      if(!is_allowed('WebAPIs', 'XMLHttpRequest.send')) {
        increment_counter('WebAPIs', 'XMLHttpRequest.send', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'XMLHttpRequest.send', 'allowed', details);

        return original_XMLHttpRequest_send.call(super_this, body);
      }
    }
  }

  // setInterval ---------------------------------------------

  window.setInterval = function(
    function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
  ) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_window_setInterval.call(
        super_this, function_or_code, delay,
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      );
    } else {
      var details = { target: super_this, code: function_or_code };

      if(!is_allowed('WebAPIs', 'setInterval')) {
        increment_counter('WebAPIs', 'setInterval', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'setInterval', 'allowed', details);

        wraped_function_or_code = function(
          p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
        ) {
          if(!is_allowed('WebAPIs', 'setInterval.call')) {
            increment_counter('WebAPIs', 'setInterval.call', 'blocked', details);

            return 0;
          } else {
            increment_counter('WebAPIs', 'setInterval.call', 'allowed', details);

            if(typeof function_or_code === 'string' || function_or_code instanceof String) {
              return eval(function_or_code);
            } else {
              return function_or_code(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
            }
          }
        }

        return original_window_setInterval.call(
          super_this, wraped_function_or_code, delay,
          p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
        );
      }
    }
  }

  // fetch ---------------------------------------------

  var original_window_fetch = window.fetch;

  window.fetch = function(input, init) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_window_fetch.call(super_this, input, init);
    } else {
      var details = { target: super_this, code: input };

      if(!is_allowed('WebAPIs', 'fetch')) {
        increment_counter('WebAPIs', 'fetch', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'fetch', 'allowed', details);

        return original_window_fetch.call(super_this, input, init);
      }
    }
  }

  // setTimeout ---------------------------------------------

  window.setTimeout = function(
    function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
  ) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_window_setTimeout.call(
        super_this, function_or_code, delay,
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      );
    } else {
      var details = { target: super_this, code: function_or_code };

      if(!is_allowed('WebAPIs', 'setTimeout')) {
        increment_counter('WebAPIs', 'setTimeout', 'blocked', details);
      } else {
        increment_counter('WebAPIs', 'setTimeout', 'allowed', details);

        wraped_function_or_code = function(
          p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
        ) {
          if(!is_allowed('WebAPIs', 'setTimeout.call')) {
            increment_counter('WebAPIs', 'setTimeout.call', 'blocked', details);

            return 0;
          } else {
            increment_counter('WebAPIs', 'setTimeout.call', 'allowed', details);

            if(typeof function_or_code === 'string' || function_or_code instanceof String) {
              return eval(function_or_code);
            } else {
              return function_or_code(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
            }
          }
        }

        return original_window_setTimeout.call(
          super_this, wraped_function_or_code, delay,
          p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
        );
      }
    }
  }

  // -----------------------------------------------------
}

original_window_setInterval(function() {
  if(counters_changed) {
    counters_changed = false;

    var element = document.getElementById('luminous-data');

    element.innerHTML = JSON.stringify({ counters: counters });

    element.setAttribute('data-changed', 'true');
  }
}, 300);
