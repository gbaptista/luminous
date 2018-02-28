var original_window_setTimeout = window.setTimeout;
var original_window_setInterval = window.setInterval;

var cached_options = { injection_disabled: false };
var collect_details = false;

var get_options = function() {
  var json_options_element = document.getElementById('luminous-options');

  if(json_options_element && json_options_element.getAttribute('data-changed') == 'true') {
    cached_options = JSON.parse(json_options_element.innerHTML);

    collect_details = cached_options['collect_details'];

    json_options_element.setAttribute('data-changed', 'false');
  }

  return cached_options;
}

var luminous_data_element = document.getElementById('luminous-data');

var increment_counter = function(kind, type, result, details, execution_time) {
  original_window_setTimeout(function() {
    details = {
      target: '' + details['target'],
      code: (collect_details ? ('' + details['code']).slice(0, 400) : undefined)
    };

    luminous_data_element.dispatchEvent(
      new MessageEvent(
        'luminous-message',
        {
          data: {
            kind: kind,
            type: type,
            time: execution_time,
            details: details,
            result: result
          }
        }
      )
    );
  }, 0, '__INTERNAL_LUMINOUS_CODE__');
}

var is_allowed = function(kind, type) {
  var options = get_options();

  if(!options['disabled']) options['disabled'] = {};
  if(!options['disabled'][kind]) options['disabled'][kind] = {};

  return !options['disabled'][kind][type];
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
