var original_XMLHttpRequest_open = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function(method, url, is_async, user, password) {
  var super_this = this;

  if(is_async === undefined) is_async = true;

  if(get_options()['injection_disabled']) {
    return original_XMLHttpRequest_open.call(
      super_this, method, url, is_async, user, password
    );
  } else {
    var details = { target: method, code: url };

    if(!is_allowed('WebAPIs', 'XMLHttpRequest.open')) {
      increment_counter('WebAPIs', 'XMLHttpRequest.open', 'blocked', details);
    } else {
      var timer = performance.now();

      var execution_return = original_XMLHttpRequest_open.call(
        super_this, method, url, is_async, user, password
      );

      increment_counter(
        'WebAPIs', 'XMLHttpRequest.open', 'allowed', details,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
