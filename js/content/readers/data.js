injections_controller(function() {
  var tab_id = undefined;

  var dispatch_data = function(data) {
    setTimeout(function() {
      chrome.runtime.sendMessage({
        action: 'log_input',
        tab_id: tab_id,
        url: document.location.href,
        domain: document.location.host,
        data: data
      });
    }, 0);
  }

  var log_stack_fifo = [];

  var process_stack = function() {
    if(tab_id) {
      while(log_stack_fifo.length > 0) {
        var data = log_stack_fifo.shift();

        if(data) { dispatch_data(data); }
      }
    }
  };

  // Maybe just one event?
  var wait_for_tab_id = setInterval(function() {
    if(tab_id) {
      clearInterval(wait_for_tab_id);
      process_stack();
    }
  }, 1000);

  chrome.storage.sync.get(null, function(sync_options) {
    document.getElementById('luminous-data').addEventListener(
      'luminous-message',
      function(e) {
        e.stopPropagation();
        e.preventDefault();

        log_stack_fifo.push(e.data);
        process_stack();
      }
    );

    var get_tab_id = setInterval(function() {
      var data_element = document.getElementById('luminous-data');

      if(data_element) {
        tab_id = data_element.getAttribute('data-tab');
      }

      clearInterval(get_tab_id);
    }, 500);
  });
});
