var original_window_navigator_userAgent = window.navigator.userAgent;

if(is_allowed('WebAPIs', 'headers.User-Agent')) {
  increment_counter(
    'WebAPIs', 'headers.User-Agent', true, 'HTTP headers', undefined, 0
  );
} else {
  increment_counter(
    'WebAPIs', 'headers.User-Agent', false, 'HTTP headers', undefined, 0
  );
}

Object.defineProperty(
  window.navigator, 'userAgent', {
    get: function() {
      var super_this = this;

      if(get_options()['injection_disabled']) {
        return original_window_navigator_userAgent;
      } else {
        if(!is_allowed('WebAPIs', 'NavigatorID.userAgent')) {
          increment_counter(
            'WebAPIs', 'NavigatorID.userAgent', false, super_this, undefined, 0
          );

          return 'Mozilla/5.0';
        } else {
          var timer = performance.now();

          var execution_return = original_window_navigator_userAgent;

          increment_counter(
            'WebAPIs', 'NavigatorID.userAgent', true, super_this, undefined,
            performance.now() - timer
          );

          return execution_return;
        }
      }
    }
  }
);
