var background_color = function(value, div=1) {
  if(value < (400/div)) {
    return '#8D8E87';
  } else if(value < (2500/div)) {
      return '#e6b800';
  } else if(value < (5000/div)) {
    return '#FD9868';
  } else {
    return '#CC3300';
  }
}

var background_color_for_counter = function(value) {
  return background_color(value, 4);
}

var background_color_for_badge = function(value) {
  return background_color(value);
}
