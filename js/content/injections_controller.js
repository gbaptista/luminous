var injections_controller = function(injection_function) {
  var injection_enabled = Cookies.get('le');

  if(injection_enabled != 'f') {
    injection_function();
  }
}
