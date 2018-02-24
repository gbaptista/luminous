var original_window_navigator_userAgent = window.navigator.userAgent;

if(original_window_navigator_userAgent && original_window_navigator_userAgent != '') {
  var details = { target: 'HTTP headers', code: {} };

  if(is_allowed('WebAPIs', 'headers.User-Agent')) {
    increment_counter('WebAPIs', 'headers.User-Agent', 'allowed', details);
  } else {
    increment_counter('WebAPIs', 'headers.User-Agent', 'blocked', details);
  }
}

Object.defineProperty(
  window.navigator, 'userAgent', {
    get: function() {
      var super_this = this;

      if(get_options()['injection_disabled']) {
        return original_window_navigator_userAgent;
      } else {
        var details = { target: super_this, code: {} };

        if(!is_allowed('WebAPIs', 'NavigatorID.userAgent')) {
          increment_counter('WebAPIs', 'NavigatorID.userAgent', 'blocked', details);

          return '';
        } else {
          var timer = performance.now();

          var execution_return = original_window_navigator_userAgent;

          increment_counter(
            'WebAPIs', 'NavigatorID.userAgent', 'allowed', details,
            performance.now() - timer
          );

          return execution_return;
        }
      }
    }
  }
);
