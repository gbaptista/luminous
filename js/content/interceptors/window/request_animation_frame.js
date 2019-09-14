var original_window_requestAnimationFrame = window.requestAnimationFrame;

window.requestAnimationFrame = function(callback) {
  var super_this = this;

  if(get_options()['injection_disabled']) {
    return original_window_requestAnimationFrame.call(super_this, callback);
  } else {
    if(!is_allowed('WebAPIs', 'requestAnimationFrame')) {
      increment_counter('WebAPIs', 'requestAnimationFrame', false, super_this, callback, 0);

      // A long integer value, the request id, that uniquely identifies the
      // entry in the callback list. This is a non-zero value, but you may
      // not make any other assumptions about its value. You can pass this
      // value to window.cancelAnimationFrame() to cancel the refresh
      // callback request.
      // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      return 1;
    } else {
      var timer = performance.now();

      var execution_return = original_window_requestAnimationFrame.call(super_this, callback);

      increment_counter(
        'WebAPIs', 'requestAnimationFrame', true, super_this, callback, 0,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
