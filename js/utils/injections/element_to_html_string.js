var element_to_html_string = function(element) {
  var element_container = document.createElement('div');
  element_container.appendChild(element);

  return element_container.innerHTML;
}
