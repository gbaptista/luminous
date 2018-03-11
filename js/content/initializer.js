var intialize_luminous_injections = function(from) {
  if(from == 'cookie') {
    var injection_enabled = Cookies.get('le');
  }

  var stack_size = injections_controller_stack.length + 1;

  while(--stack_size) {
    var fn = injections_controller_stack.shift();

    if(from == 'cookie') {
      if(injection_enabled != 'f') {
        fn(true);
      }
    } else {
      fn(false);
    }
  }

  if(from == 'cookie') {
    Cookies.remove('le', { path: '/' });
    Cookies.remove('ld', { path: '/' });
    Cookies.remove('ls', { path: '/' });
    setTimeout(function() {
      Cookies.remove('le', { path: '/' });
      Cookies.remove('ld', { path: '/' });
      Cookies.remove('ls', { path: '/' });
    }, 0);
  }
}

if(injection_strategy == 'cookie') {
  intialize_luminous_injections('cookie');
} else {
  // TODO Firefox 59+?
  intialize_luminous_injections('injection_strategy');
}
