var short_number = function(number, zero_text = '0') {
  var text = number.toString();

  if(number == 0) {
    text = zero_text;
  } else if(number > 99999) {
    text = '0,' + text.slice(0, -5) + 'M';
  } else if(number > 9999) {
    text = text.slice(0, -3) + 'k';
  } else if(number > 1099) {
    text = text.slice(0, -2);
    text = text.slice(0, -1) + ',' + text.slice(-1) + 'k';
  } else if(number > 999) {
    text = text.slice(0, -3) + 'k';
  }

  return text;
}

var short_number_for_badge = function(number) {
  return short_number(number, '');
}

var short_number_for_counter = function(number) {
  return short_number(number);
}
