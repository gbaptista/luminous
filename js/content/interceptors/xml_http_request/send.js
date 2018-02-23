var original_XMLHttpRequest_send = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function(body) {
  var super_this = this;

  if(get_options()['injection_disabled']) {
    return original_XMLHttpRequest_send.call(super_this, body);
  } else {
    var details = { target: super_this, code: body };

    if(!is_allowed('WebAPIs', 'XMLHttpRequest.send')) {
      increment_counter('WebAPIs', 'XMLHttpRequest.send', 'blocked', details);
    } else {
      var timer = performance.now();

      var execution_return = original_XMLHttpRequest_send.call(
        super_this, body
      );

      increment_counter(
        'WebAPIs', 'XMLHttpRequest.send', 'allowed', details,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
