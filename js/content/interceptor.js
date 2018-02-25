var original_window_setTimeout = window.setTimeout;
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

var reload_requested = false;

var counters = { addEventListener: {}, handleEvent: {}, WebAPIs: {} };

var last_url = window.location.href.replace(/#.*/, '');
var counters_changed = false;

original_window_setInterval(function() {
  var current_url = window.location.href.replace(/#.*/, '');

  if(last_url != current_url) {
    last_url = current_url;
    counters = { addEventListener: {}, handleEvent: {}, WebAPIs: {} };
    counters_changed = true;
  }
}, 100);

var increment_counter = function(kind, type, result, details, execution_time) {
  original_window_setTimeout(function() {
    details = {
      target: '' + details['target'],
      code: (collect_details ? ('' + details['code']).slice(0, 400) : undefined)
    };

    if(counters[kind][type] == undefined) {
      counters[kind][type] = { allowed: 0, blocked: 0 };
    }

    counters[kind][type][result] += 1;

    if(execution_time != undefined) {
      if(!counters[kind][type]['execution_time']) {
        counters[kind][type]['execution_time'] = 0;
      }

      counters[kind][type]['execution_time'] += execution_time;
    }

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

    // interceptors/fetch/fetch.js

    // interceptors/gamepad/get_gamepads.js

    // interceptors/geolocation/get_current_position.js
    // interceptors/geolocation/watch_position.js

    // interceptors/battery_status/get_battery.js

    // interceptors/navigator_id/user_agent.js

    // interceptors/schedulers/set_interval.js
    // interceptors/schedulers/set_timeout.js

    // interceptors/web_socket/send.js

    // interceptors/xml_http_request/open.js
    // interceptors/xml_http_request/send.js

  // /load_injectors
}

original_window_setInterval(function() {
  if(counters_changed) {
    counters_changed = false;

    var element = document.getElementById('luminous-data');

    element.innerHTML = JSON.stringify({ counters: counters });

    element.setAttribute('data-changed', 'true');
  }
}, 300, '__INTERNAL_LUMINOUS_CODE__');
