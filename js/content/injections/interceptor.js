injections_controller(function(should_inject) {
  if(should_inject) {
    load_interceptor_element('contentScript', function(element) {
      document.documentElement.insertBefore(
        element, document.documentElement.firstChild
      );
    });
  }
});
