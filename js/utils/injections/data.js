var load_data_element = function(from, callback_function) {

  var data_input_injection = document.createElement('input');
  data_input_injection.type = 'hidden';
  data_input_injection.id = 'luminous-data';
  data_input_injection.setAttribute('data-from', from);
  data_input_injection.setAttribute('class', 'luminous-data');

  callback_function(data_input_injection);

};
