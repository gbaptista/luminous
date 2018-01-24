var set_candy = function(value) {
  if(typeof(Storage) !== 'undefined') {
    localStorage.setItem('luminous_injection_disabled', value.toString());
  }
}

var get_candy = function() {
  if(typeof(Storage) !== 'undefined') {
    return localStorage.getItem('luminous_injection_disabled');
  } else {
    return 'false';
  }
}

var cached_options = undefined;

var get_options = function() {
  var json_options_element = document.getElementById('luminous-options');

  if(json_options_element) {
    if(json_options_element.getAttribute('data-changed') == 'true') {
      cached_options = JSON.parse(
        json_options_element.innerHTML
      );

      json_options_element.setAttribute('data-changed', 'false');

      if(cached_options['injection_disabled']) {
        cached_options['injection_disabled'] = true;
      } else {
        cached_options['injection_disabled'] = false;
      }

      if(cached_options['injection_disabled'].toString() != get_candy()) {
        set_candy(cached_options['injection_disabled'].toString());

        if(typeof(Storage) !== 'undefined' && !reload_requested) {
          window.location.reload(false);
          reload_requested = true;
        }
      }
    }

    return cached_options;
  } else {
    if(cached_options) {
      return cached_options;
    } else {
      if(get_candy() === 'true') {
        cached_options = { injection_disabled: true };
      } else {
        cached_options = { injection_disabled: false };
      }

      return cached_options;
    }
  }
}

if(get_options()['injection_disabled'] !== true) {
  var reload_requested = false;

  var counters = { addEventListener: {}, handleEvent: {}, timer: {} };
  var counters_changed = false;

  var increment_counter = function(kind, type, result, details) {
    if(counters[kind][type] == undefined) {
      counters[kind][type] = { allowed: 0, blocked: 0 };
    }

    counters[kind][type][result] += 1;

    if(!counters[kind][type]['samples']) {
      counters[kind][type]['samples'] = [];
    }

    counters[kind][type]['samples'].push(details);

    if(counters[kind][type]['samples'].length > 3) {
      counters[kind][type]['samples'] = counters[kind][type]['samples'].slice(-3);
    }

    counters_changed = true;
  }

  var is_allowed = function(kind, type) {
    var options = get_options();

    if(!options['disabled']) options['disabled'] = {};
    if(!options['disabled'][kind]) options['disabled'][kind] = {};

    return !options['disabled'][kind][type];
  }

  var original_addEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    var super_this = this;

    var details = {
      target: '' + super_this,
      code: ('' + listener).slice(0, 400)
    }

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
              listener(event);
            } else {
              listener.handleEvent(event);
            }
          }
        }
      };

      original_addEventListener.call(super_this, type, wraped_listener, options);
    }
  }

  original_setInterval = window.setInterval;

  window.setInterval = function(
    function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
  ) {
    var super_this = this;

    var details = {
      target: '' + super_this,
      code: ('' + function_or_code).slice(0, 400)
    }

    if(!is_allowed('timer', 'setInterval')) {
      increment_counter('timer', 'setInterval', 'blocked', details);
    } else {
      increment_counter('timer', 'setInterval', 'allowed', details);

      wraped_function_or_code = function(
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      ) {
        if(!is_allowed('timer', 'setInterval.call')) {
          increment_counter('timer', 'setInterval.call', 'blocked', details);

          return 0;
        } else {
          increment_counter('timer', 'setInterval.call', 'allowed', details);

          return function_or_code(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
        }
      }

      return original_setInterval.call(
        super_this,
        wraped_function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      )
    }
  }

  original_setTimeout = window.setTimeout;

  window.setTimeout = function(
    function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
  ) {
    var super_this = this;

    var params = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12];

    var details_params = [];

    for(i in params) {
      if(params[i] !== undefined) details_params.push(params[i]);
    }

    var details = {
      target: '' + super_this,
      code: ('' + function_or_code).slice(0, 400),
      delay: delay,
      params: '' + details_params
    }

    if(!is_allowed('timer', 'setTimeout')) {
      increment_counter('timer', 'setTimeout', 'blocked', details);
    } else {
      increment_counter('timer', 'setTimeout', 'allowed', details);

      wraped_function_or_code = function(
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      ) {
        if(!is_allowed('timer', 'setTimeout.call')) {
          increment_counter('timer', 'setTimeout.call', 'blocked', details);

          return 0;
        } else {
          increment_counter('timer', 'setTimeout.call', 'allowed', details);

          return function_or_code(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
        }
      }

      return original_setTimeout.call(
        super_this,
        wraped_function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      )
    }
  }

  original_setInterval(function() {
    if(counters_changed) {
      counters_changed = false;

      var element = document.getElementById('luminous-data');

      element.innerHTML = JSON.stringify({ counters: counters });

      element.setAttribute('data-changed', 'true');
    }
  }, 300);
}

original_setInterval(function() { get_options(); }, 500);
