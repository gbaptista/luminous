var counters = {};

chrome.runtime.onMessage.addListener(function(message, _sender, sendResponse) {
  if(message.action == 'counters_for_tab_id') {
    var response = {};

    response[message.tab_id] = counters[message.tab_id];

    sendResponse({data: response});
  }
});

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(message.action == 'log_input') {
    var data = message.data;

    if(!counters[message.tab_id]) {
      counters[message.tab_id] = {};
    }

    counters[message.tab_id]['domain'] = message.domain;

    if(!counters[message.tab_id]['counters']) {
      counters[message.tab_id]['counters'] = {};
    }

    if(!counters[message.tab_id]['counters'][data.kind]) {
      counters[message.tab_id]['counters'][data.kind] = {};
    }

    if(!counters[message.tab_id]['counters'][data.kind][data.type]) {
      counters[message.tab_id]['counters'][data.kind][data.type] = {
        allowed: 0,
        blocked: 0,
        execution_time: 0.0,
        samples: []
      };
    }

    if(data.result == 'allowed') {
      counters[message.tab_id]['counters'][data.kind][data.type]['allowed'] += 1;
    } else {
      counters[message.tab_id]['counters'][data.kind][data.type]['blocked'] += 1;
    }

    counters[message.tab_id]['counters'][data.kind][data.type]['execution_time'] += data.time;

    counters[message.tab_id]['counters'][data.kind][data.type]['samples'].push(
      data.details
    )

    if(counters[message.tab_id]['counters'][data.kind][data.type]['samples'].length > 3) {
      counters[message.tab_id]['counters'][data.kind][data.type]['samples'] = counters[message.tab_id]['counters'][data.kind][data.type]['samples'].slice(
        -3
      );
    }

    chrome.runtime.sendMessage(
      { action: 'reload_popup', tab_id: message.tab_id }
    );
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    delete counters[details.tabId.toString()];
  },
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] }
);
