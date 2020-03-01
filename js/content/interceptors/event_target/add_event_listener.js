var original_EventTarget_addEventListener = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function(type, listener, options) {
  var super_this = this;

  var reported_type = type;

  if(typeof(reported_type) != 'string') {
    reported_type = JSON.stringify(type);
  }

  if(get_options()['injection_disabled']) {
    return original_EventTarget_addEventListener.call(
      super_this, type, listener, options
    );
  } else {
    if(!is_allowed('addEventListener', reported_type)) {
      increment_counter(
        'addEventListener', reported_type, false, super_this, listener, 0
      );
    } else {
      var timer = performance.now();

      var wraped_listener = {
        handleEvent: function (event) {
          if(!is_allowed('handleEvent', reported_type)) {
            increment_counter('handleEvent', reported_type, false, super_this, listener, 0);
          } else {
            var timer = performance.now();

            if (typeof(listener) === 'function') {
              var execution_return = listener(event);
            } else if (listener && typeof(listener.handleEvent) === 'function') {
              var execution_return = listener.handleEvent(event);
            }

            increment_counter(
              'handleEvent', reported_type, true, super_this, listener,
              performance.now() - timer
            );

            return execution_return;
          }
        }
      };

      if(!removeEventListener_alias[type]) removeEventListener_alias[type] = {};

      removeEventListener_alias[type][listener] = wraped_listener;

      var execution_return = original_EventTarget_addEventListener.call(
        super_this, type, wraped_listener, options
      );

      increment_counter(
        'addEventListener', reported_type, true, super_this, listener,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
