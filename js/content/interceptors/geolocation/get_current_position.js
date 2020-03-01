if ('geolocation' in navigator) {
  var original_navigator_geolocation_getCurrentPosition = navigator.geolocation.getCurrentPosition;

  navigator.geolocation.getCurrentPosition = function(success, error, options) {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      original_navigator_geolocation_getCurrentPosition.call(
        super_this, success, error, options
      );
    } else {
      var wraped_success = function(pos) {
        if(!is_allowed('WebAPIs', 'geo.getCurrentPosition')) {
          increment_counter(
            'WebAPIs', 'geo.getCurrentPosition', false, super_this, success, 0
          );
        } else {
          var timer = performance.now();

          var execution_return = success(pos);

          increment_counter(
            'WebAPIs', 'geo.getCurrentPosition', true, super_this, success,
            performance.now() - timer
          );

          return execution_return;
        }
      }

      return original_navigator_geolocation_getCurrentPosition.call(
        super_this, wraped_success, error, options
      );
    }
  }
}
