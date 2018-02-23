var short_time = function(number, separator) {
  if(separator == undefined) separator = ' ';

  if(number == undefined) number = 0.0;

  var text = number.toString();

  if(text.split('.')[1] == undefined) {
    text += '.0';
  }

  var seconds = number / 1000;

  if(number < 1.0) {
    text = text.split('.')[0] + '.' + text.split('.')[1].slice(0, 1) + separator + 'ms';
  } else if(seconds < 1.0) {
    text = text.split('.')[0] + separator + 'ms';
  } else if(seconds >= 86400.0) {
    days = parseInt(parseInt(text.split('.')[0]) / 1000 / 60 / 60 / 24);
    text = days + separator + 'd';
  } else if(seconds >= 3600.0) {
    hours = parseInt(parseInt(text.split('.')[0]) / 1000 / 60 / 60);
    text = hours + separator + 'h';
  } else if(seconds >= 60.0) {
    minutes = parseInt(parseInt(text.split('.')[0]) / 1000 / 60);
    text = minutes + separator + 'min';
  } else if(seconds >= 10.0) {
    text = seconds.toString();
    text = text.split('.')[0] + ',' + text.split('.')[1].slice(0, 1) + separator + 's';
  } else if(seconds >= 1.0) {
    text = seconds.toString();
    text = text.split('.')[0] + ',' + text.split('.')[1].slice(0, 2) + separator + 's';
  }

  return text;
}

var short_number = function(number, zero_text, separator) {
  if(zero_text == undefined) zero_text = '0';
  if(separator == undefined) separator = '';

  var text = number.toString();

  if(number == 0) {
    text = zero_text;
  } else if(number > 99999) {
    text = '0,' + text.slice(0, -5) + separator + 'M';
  } else if(number > 9999) {
    text = text.slice(0, -3) + separator + 'k';
  } else if(number > 1099) {
    text = text.slice(0, -2);
    text = text.slice(0, -1) + ',' + text.slice(-1) + separator + 'k';
  } else if(number > 999) {
    text = text.slice(0, -3) + separator + 'k';
  }

  return text;
}

var short_number_for_badge = function(number) {
  return short_number(number, '');
}

var short_number_for_counter = function(number) {
  return short_number(number);
}
