if ('geolocation' in navigator) {
  var original_navigator_geolocation_watchPosition = navigator.geolocation.watchPosition;

  navigator.geolocation.watchPosition = function(success, error, options) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      return original_navigator_geolocation_watchPosition.call(
        super_this, success, error, options
      );
    } else {
      var wraped_success = function(pos) {
        if(!is_allowed('WebAPIs', 'geo.watchPosition')) {
          increment_counter(
            'WebAPIs', 'geo.watchPosition', false, super_this, success, 0
          );
        } else {
          var timer = performance.now();

          var execution_return = success(pos);

          increment_counter(
            'WebAPIs', 'geo.watchPosition', true, super_this, success,
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
