window.setInterval = function(
  function_or_code, delay, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
) {
  var super_this = this;

  if(get_options()['injection_disabled'] || p1 == '__INTERNAL_LUMINOUS_CODE__') {
    return original_window_setInterval.call(
      super_this, function_or_code, delay,
      p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
    );
  } else {
    if(!is_allowed('WebAPIs', 'setInterval')) {
      increment_counter(
        'WebAPIs', 'setInterval', false, super_this, function_or_code, 0
      );
    } else {
      var timer = performance.now();

      wraped_function_or_code = function(
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      ) {
        if(!is_allowed('WebAPIs', 'setInterval.call')) {
          increment_counter(
            'WebAPIs', 'setInterval.call', false, super_this, function_or_code, 0
          );

          return 0;
        } else {
          var timer = performance.now();

          if(typeof function_or_code === 'string' || function_or_code instanceof String) {
            var execution_return = eval(function_or_code);
          } else {
            var execution_return = function_or_code(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
          }

          increment_counter(
            'WebAPIs', 'setInterval.call', true, super_this, function_or_code,
            performance.now() - timer
          );

          return execution_return;
        }
      }

      var execution_return = original_window_setInterval.call(
        super_this, wraped_function_or_code, delay,
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12
      );

      increment_counter(
        'WebAPIs', 'setInterval', true, super_this, function_or_code,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
