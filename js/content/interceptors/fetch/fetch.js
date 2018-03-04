var original_window_fetch = window.fetch;

window.fetch = function(input, init) {
  var super_this = this;

  if(get_options()['injection_disabled']) {
    return original_window_fetch.call(super_this, input, init);
  } else {
    if(!is_allowed('WebAPIs', 'fetch')) {
      increment_counter('WebAPIs', 'fetch', false, super_this, input, 0);

      return new Promise(function(_resolve, _reject) {});
    } else {
      var timer = performance.now();

      var execution_return = original_window_fetch.call(super_this, input, init);

      increment_counter(
        'WebAPIs', 'fetch', true, super_this, input, 0,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
