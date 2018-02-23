var original_WebSocket_send = WebSocket.prototype.send;

WebSocket.prototype.send = function(data) {
  var super_this = this;

  if(get_options()['injection_disabled']) {
    return original_WebSocket_send.call(super_this, data);
  } else {
    var details = { target: super_this, code: data };

    if(!is_allowed('WebAPIs', 'WebSocket.send')) {
      increment_counter('WebAPIs', 'WebSocket.send', 'blocked', details);
    } else {
      var timer = performance.now();

      var execution_return = original_WebSocket_send.call(super_this, data);

      increment_counter(
        'WebAPIs', 'WebSocket.send', 'allowed', details,
        performance.now() - timer
      );

      return execution_return;
    }
  }
}
