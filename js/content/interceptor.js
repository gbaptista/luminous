var should_luminous_run = (
  document.getElementsByClassName('luminous-interceptor').length == 1
);

// Only run on HTML and XHTML files.
if (document instanceof HTMLDocument === false && (
    document instanceof XMLDocument === false ||
    document.createElement('div') instanceof HTMLDivElement === false)) {
  
  should_luminous_run = false;
  
}


var remove_duplicated_luminous_elements = function(class_name) {
  var elements = document.getElementsByClassName(class_name);
  var i = elements.length;

  if(i > 1) {
    while(i--) { if(i > 0) { elements[i].remove(); } }
  }
}

remove_duplicated_luminous_elements('luminous-data');
remove_duplicated_luminous_elements('luminous-options');
remove_duplicated_luminous_elements('luminous-interceptor');

// --------------------------------
if(should_luminous_run) {
  var original_window_setTimeout = window.setTimeout;
  var original_window_setInterval = window.setInterval;

  var cached_options = { injection_disabled: false };
  var collect_details = false;

  var json_options_element = undefined;

  var get_options = function() {
    if(!json_options_element) {
      json_options_element = document.getElementById('luminous-options');
    }

    if(json_options_element && json_options_element.getAttribute('data-changed') == 'true') {
      cached_options = JSON.parse(json_options_element.innerHTML);

      collect_details = cached_options['collect_details'];

      json_options_element.setAttribute('data-changed', 'false');
    }

    return cached_options;
  }

  var luminous_data_element = document.getElementById('luminous-data');

  var is_allowed = function(kind, type) {
    var options = get_options();

    if(!options['disabled']) options['disabled'] = {};
    if(!options['disabled'][kind]) options['disabled'][kind] = {};

    return !options['disabled'][kind][type];
  }

  // -------------------------------------------------
  var dispatch_stack_fifo = [];

  var dispatch_stack_timer = undefined;

  var process_dispatch_stack = function() {
    clearTimeout(dispatch_stack_timer);
    dispatch_stack_timer = undefined;

    if(luminous_data_element.getAttribute('data-ready')) {
      luminous_data_element.dispatchEvent(
        new MessageEvent('luminous-message', { data: dispatch_stack_fifo })
      );
    } else {
      dispatch_stack_timer = original_window_setTimeout(function() {
        process_dispatch_stack()
      }, 100, '__INTERNAL_LUMINOUS_CODE__');
    }

    dispatch_stack_fifo = [];
  }

  // -------------------------------------------------
  var increment_counter = function(kind, type, allowed, target, code, time) {
    original_window_setTimeout(function(
      _, kind, type, allowed, target, code, time
    ) {
      if(collect_details && code) { var code = ('' + code).slice(0, 400); } else { var code = undefined; }

      dispatch_stack_fifo.push({
        kind: kind,
        type: type,
        time: time,
        target: target.toString(),
        code: code,
        allowed: allowed,
        domain: document.location.host,
        url: document.location.href
      });


      if(!dispatch_stack_timer) {
        dispatch_stack_timer = original_window_setTimeout(function() {
          process_dispatch_stack()
        }, 100, '__INTERNAL_LUMINOUS_CODE__'); // STACK_TIMER_01
      }
    }, 0, '__INTERNAL_LUMINOUS_CODE__', kind, type, allowed, target, code, time);
  }

  if(!get_options()['injection_disabled']) {
    // #load_injectors

      // interceptors/event_target/remove_event_listener.js
      // interceptors/event_target/add_event_listener.js

      // interceptors/battery_status/get_battery.js

      // interceptors/fetch/fetch.js

      // interceptors/gamepad/get_gamepads.js

      // interceptors/geolocation/get_current_position.js
      // interceptors/geolocation/watch_position.js

      // interceptors/navigator_id/user_agent.js

      // interceptors/schedulers/set_interval.js
      // interceptors/schedulers/set_timeout.js

      // interceptors/web_socket/send.js

      // interceptors/xml_http_request/open.js
      // interceptors/xml_http_request/send.js

    // /load_injectors
  }
}
