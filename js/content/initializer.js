var should_inject_this_document = function() {
  // thanks to: https://github.com/EFForg/privacybadger/pull/1954
  if (
    document instanceof HTMLDocument === false &&
    (
      document instanceof XMLDocument === false ||
      document.createElement('div') instanceof HTMLDivElement === false
    )
  ) {
    return false;
  }

  return true;
}

var intialize_luminous_injections = function(from) {
  if(from == 'cookie') {
    var injection_enabled = Cookies.get('le');
  }

  var stack_size = injections_controller_stack.length + 1;

  while(--stack_size) {
    var fn = injections_controller_stack.shift();

    if(from == 'cookie') {
      if(injection_enabled != 'f') {
        fn(should_inject_this_document());
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
  intialize_luminous_injections('filterResponseData');
}
