injections_controller(function(should_inject) {
  if(should_inject) {
    load_interceptor_element(function(element) {
      document.documentElement.insertBefore(
        element, document.documentElement.firstChild
      );
    });
  }
});
