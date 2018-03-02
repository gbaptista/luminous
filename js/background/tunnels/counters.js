var counters = {};

chrome.runtime.onMessage.addListener(function(message, _sender, sendResponse) {
  if(message.action == 'counters_for_tab_id') {
    var response = {};

    var tab_id = message.tab_id;

    response[tab_id] = counters[tab_id];

    sendResponse({data: response});
  }
});

var update_local_storage_data_timer = {};

var update_local_storage_data = function(tab_id) {
  clearTimeout(update_local_storage_data_timer[tab_id]);
  update_local_storage_data_timer[tab_id] = undefined;

  var data = {};

  data[tab_id] = counters[tab_id];

  chrome.storage.local.set(data);
}

var process_message = function(message) {
  var domain = message.domain;
  var tab_id = message.tab_id;

  var data = message.data;

  var kind = data.kind;
  var type = data.type;
  var time = data.time;
  var result = data.result;
  var details = data.details;

  if(!counters[tab_id]) {
    counters[tab_id] = {};
  }

  counters[tab_id]['domain'] = domain;

  if(!counters[tab_id]['counters']) {
    counters[tab_id]['counters'] = {};
  }

  if(!counters[tab_id]['counters'][kind]) {
    counters[tab_id]['counters'][kind] = {};
  }

  if(!counters[tab_id]['counters'][kind][type]) {
    counters[tab_id]['counters'][kind][type] = {};
  }

  if(result == 'allowed') {
    if(counters[tab_id]['counters'][kind][type]['allowed']) {
      counters[tab_id]['counters'][kind][type]['allowed'] += 1;
    } else {
      counters[tab_id]['counters'][kind][type]['allowed'] = 1;
    }
  } else {
    if(counters[tab_id]['counters'][kind][type]['blocked']) {
      counters[tab_id]['counters'][kind][type]['blocked'] += 1;
    } else {
      counters[tab_id]['counters'][kind][type]['blocked'] = 1;
    }
  }

  if(counters[tab_id]['counters'][kind][type]['execution_time']) {
    counters[tab_id]['counters'][kind][type]['execution_time'] += time;
  } else {
    counters[tab_id]['counters'][kind][type]['execution_time'] = time;
  }

  if(details) {
    if(!counters[tab_id]['counters'][kind][type]['samples']) {
      counters[tab_id]['counters'][kind][type]['samples'] = [];
    }

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
      }, 500
    );
  }
}

var counter_stack_fifo = [];

var process_counter_stack_timer = undefined;

var process_counter_stack = function() {
  clearTimeout(process_counter_stack_timer);
  process_counter_stack_timer = undefined;

  while(counter_stack_fifo.length > 0) {
    process_message(counter_stack_fifo.shift());
  }
}

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(message.action == 'log_input') {
    counter_stack_fifo.push(message);

    if(!process_counter_stack_timer) {
      process_counter_stack_timer = setTimeout(function() {
        process_counter_stack();
      }, 400);
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    delete counters[details.tabId.toString()];
  },
  { urls: ['<all_urls>'], types: ['main_frame'] }
);
