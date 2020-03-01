var load_options_element = function(options, from, callback_function) {

  var json_options_injection = document.createElement('script');
  json_options_injection.type = 'application/json';
  json_options_injection.id = 'luminous-options';
  json_options_injection.setAttribute('class', 'luminous-options');
  json_options_injection.innerHTML = JSON.stringify(options);
  json_options_injection.setAttribute('data-changed', 'true');
  json_options_injection.setAttribute('data-from', from);

  callback_function(json_options_injection);

};
