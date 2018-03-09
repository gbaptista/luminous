var counters = {};

var update_local_storage_data_timer = {};

var update_local_storage_data = function(tab_id) {
  clearTimeout(update_local_storage_data_timer[tab_id]);
  update_local_storage_data_timer[tab_id] = undefined;

  var data = {};

  data[tab_id] = counters[tab_id];

  chrome.storage.local.set(data);
}

var last_url = {};

var process_message = function(message) {
  if(message.main_frame && last_url[message.tab_id] != message.url) {
    delete counters[message.tab_id];

    last_url[message.tab_id] = message.url;
  }

  var domain = message.domain;
  var tab_id = message.tab_id;

  var kind = message.kind;
  var type = message.type;
  var time = message.time;
  var allowed = message.allowed;
  if(message.target || message.code) {
    var details = {
      target: message.target,
      code: message.code
    };
  } else {
    var details = undefined;
  }

  if(!counters[tab_id]) {
    counters[tab_id] = {
      domain: domain,
      counters: {}
    };
  }

  if(!counters[tab_id]['counters'][kind]) {
    counters[tab_id]['counters'][kind] = {};
  }

  if(!counters[tab_id]['counters'][kind][type]) {
    counters[tab_id]['counters'][kind][type] = {
      allowed: 0,
      blocked: 0,
      execution_time: 0,
      samples: []
    };
  }

  if(allowed) {
    counters[tab_id]['counters'][kind][type]['allowed'] += 1;
  } else {
    counters[tab_id]['counters'][kind][type]['blocked'] += 1;
  }

  counters[tab_id]['counters'][kind][type]['execution_time'] += time;

  if(details) {
    counters[tab_id]['counters'][kind][type]['samples'].push(
      details
    );

    if(counters[tab_id]['counters'][kind][type]['samples'].length > 3) {
      counters[tab_id]['counters'][kind][type]['samples'] = counters[tab_id]['counters'][kind][type]['samples'].slice(
        -3
      );
    }
  }

  if(!update_local_storage_data_timer[tab_id]) {
    update_local_storage_data_timer[tab_id] = setTimeout(
      function() {
        update_local_storage_data(tab_id);
      }, 250 // STACK_TIMER_04
    );
  }
}

var counter_stack_fifo = [];

var process_counter_stack_timer = undefined;

var process_counter_stack = function() {
  clearTimeout(process_counter_stack_timer);
  process_counter_stack_timer = undefined;

  var stack_size = counter_stack_fifo.length + 1;

  while(--stack_size) {
    process_message(counter_stack_fifo.shift());
  }
}

chrome.runtime.onMessage.addListener(function(message, sender) {
  if(message.action == 'log_input') {
    // TODO duplicated code [main_frame]
    var main_frame = true;
    if(sender.frameId > 0) { main_frame = false };

    var stack_size = message.stack.length;

    for (i = 0; i < stack_size; i++) {
      message.stack[i]['main_frame'] = main_frame;
    }

    counter_stack_fifo = counter_stack_fifo.concat(message.stack);

    if(!process_counter_stack_timer) {
      process_counter_stack_timer = setTimeout(function() {
        process_counter_stack();
      }, 200); // STACK_TIMER_03
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    delete counters[details.tabId.toString()];
  },
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
