injections_controller(function(should_inject) {
  var tab_id = undefined;

  var dispatch_stack = function(stack_fifo) {
    var stack_size = stack_fifo.length;

    for (i = 0; i < stack_size; i++) {
      stack_fifo[i]['tab_id'] = tab_id;
    }

    chrome.runtime.sendMessage({
      action: 'log_input', tab_id: tab_id, stack: stack_fifo
    });
  }

  var log_stack_fifo = [];

  var process_stack_timer = undefined;

  var process_stack = function() {
    setTimeout(function() { process_stack(); }, 100);
  }

  var add_listener_not_found_count = 0;

  var add_listener_to_data_element = setInterval(function() {
    var data_element = document.getElementById('luminous-data');

    if(data_element) {
      clearInterval(add_listener_to_data_element);

      data_element.addEventListener(
        'luminous-message',
        function(e) {
          e.preventDefault(); e.stopPropagation();

          log_stack_fifo = log_stack_fifo.concat(e.data);

          if(!process_stack_timer) {
            process_stack_timer = setTimeout(function() {
              process_stack();
            }, 150); // STACK_TIMER_02
          }
        }
      );

      data_element.setAttribute('data-ready', 'true');
    } else {
      add_listener_not_found_count += 1;

      if(add_listener_not_found_count > 10) {
        clearInterval(add_listener_to_data_element);
      }

      console.log(
        'add_listener_to_data_element: ' + add_listener_not_found_count
      );
    }
  }, 50);

  var get_tab_id_not_found_count = 0;

  var get_tab_id = setInterval(function() {
    var data_element = document.getElementById('luminous-data');

    if(data_element && data_element.getAttribute('data-tab')) {
      clearInterval(get_tab_id);
      process_stack = function() {
        clearTimeout(process_stack_timer);
        process_stack_timer = undefined;

        dispatch_stack(log_stack_fifo);

        log_stack_fifo = [];
      };
      tab_id = data_element.getAttribute('data-tab');
    } else if(!data_element) {
      get_tab_id_not_found_count += 1;

      if(get_tab_id_not_found_count > 10) {
        clearInterval(get_tab_id);
      }

      console.log('get_tab_id: ' + get_tab_id_not_found_count);
    }
  }, 50);
});
