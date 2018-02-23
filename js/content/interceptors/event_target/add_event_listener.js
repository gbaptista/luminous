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
      var timer = performance.now();

      var wraped_listener = {
        handleEvent: function (event) {
          if(!is_allowed('handleEvent', type)) {
            increment_counter('handleEvent', type, 'blocked', details);
          } else {
            var timer = performance.now();

            if (typeof(listener) === 'function') {
              var execution_return = listener(event);
            } else if (listener && typeof(listener.handleEvent) === 'function') {
              var execution_return = listener.handleEvent(event);
            }

            increment_counter(
              'handleEvent', type, 'allowed', details,
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
        'addEventListener', type, 'allowed', details,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
