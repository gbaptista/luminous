var injections_controller_stack = [];

var injections_controller = function(injection_function) {
  injections_controller_stack.push(injection_function);
}
