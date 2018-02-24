if (navigator.getGamepads) {
  var original_navigator_getGamepads = navigator.getGamepads;

  navigator.getGamepads = function() {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_navigator_getGamepads.call(super_this);
    } else {
      var details = { target: super_this, code: {} };

      if(!is_allowed('WebAPIs', 'getGamepads')) {
        increment_counter('WebAPIs', 'getGamepads', 'blocked', details);

        return [];
      } else {
        var timer = performance.now();

        var execution_return = original_navigator_getGamepads.call(super_this);

        increment_counter(
          'WebAPIs', 'getGamepads', 'allowed', details,
          performance.now() - timer
        );

        return execution_return;
      }
    }
  }
}
