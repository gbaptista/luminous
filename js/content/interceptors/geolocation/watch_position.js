if ('geolocation' in navigator) {
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
          var timer = performance.now();

          var execution_return = success(pos);

          increment_counter(
            'WebAPIs', 'geo.watchPosition', 'allowed', details,
            performance.now() - timer
          );

          return execution_return;
        }
      }

      return original_navigator_geolocation_watchPosition.call(
        super_this, wraped_success, error, options
      );
    }
  }
}
