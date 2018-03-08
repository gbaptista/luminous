// Depends on [counters] at js/background/counters.js
var badges = {};

var current_tab_id = undefined;

chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
  if(tabs[0]) { current_tab_id = tabs[0].id.toString(); }
});

var badge_counter = {
  sum_by: 'executions',
  executions: 'allowed',
  kinds: {
    WebAPIs: false,
    addEventListener: true,
    handleEvent: true
  }
}

chrome.storage.sync.get(null, function(sync_options) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(
      namespace == 'sync' && changes
      &&
      changes['badge_counter'] && changes['badge_counter'].newValue
    ) {
      badge_counter = changes['badge_counter'].newValue;
    }
  });

  badge_counter = sync_options['badge_counter'];
});

var calculate_badge_for_tab_id = function() {
  var tab_id = current_tab_id;

  var calls = 0;

  if(counters[tab_id] && counters[tab_id]['counters']) {
    for(key in counters[tab_id]['counters']) {
      for(sub_key in counters[tab_id]['counters'][key]) {
        var allowed = 0;
        var blocked = 0;

        if(badge_counter['sum_by'] == 'executions') {
          allowed = counters[tab_id]['counters'][key][sub_key]['allowed'];
          blocked = counters[tab_id]['counters'][key][sub_key]['blocked'];
        } else {
          if(counters[tab_id]['counters'][key][sub_key]['allowed'] > 0) {
            allowed = 1;
          }

          if(counters[tab_id]['counters'][key][sub_key]['blocked'] > 0) {
            blocked = 1;
          }
        }

        if(badge_counter['kinds'][key]) {
          if(
            badge_counter['executions'] == 'blocked'
            ||
            badge_counter['executions'] == 'allowed_blocked'
          ) {
            calls += blocked;
          }

          if(
            badge_counter['executions'] == 'allowed'
            ||
            badge_counter['executions'] == 'allowed_blocked'
          ) {
            calls += allowed;
          }
        }
      }
    }
  }

  badges[tab_id] = calls;
}

var update_badge_text_timer = undefined;

var last_number = undefined;
var last_color = undefined;
var last_text = undefined;

var update_badge_text = function(number) {
  clearTimeout(update_badge_text_timer);
  update_badge_text_timer = undefined;

  if(last_number != number) {

    last_number = number;

    var text = short_number_for_badge(number);
    var color = background_color_for_badge(number);

    if(last_text != text) {
      last_text = text;

      if(number > 0) {
        chrome.browserAction.setBadgeText(
          { text: text }
        );

        if(last_color != color) {
          last_color = color;
          chrome.browserAction.setBadgeBackgroundColor(
            { color: color }
          );
        }
      } else {
        chrome.browserAction.setBadgeText({ text: '' });
      }
    }
  }
}

var update_badge_for_tab_id = function(now) {
  if(now) {
    calculate_badge_for_tab_id();
    update_badge_text(badges[current_tab_id]);
  } else if (!update_badge_text_timer) {
    update_badge_text_timer = setTimeout(function() {
      calculate_badge_for_tab_id();
      update_badge_text(badges[current_tab_id])
    }, 500); // STACK_TIMER_X
  }
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  current_tab_id = activeInfo.tabId.toString();

  if(activeInfo.tabId) {
    setTimeout(function() { update_badge_for_tab_id(true); }, 0);
  }
});

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(
    message.action == 'log_input'
    &&
    message.tab_id == current_tab_id
    &&
    !update_badge_text_timer
  ) {
    update_badge_for_tab_id();
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    setTimeout(function() {
      var tab_id = details.tabId.toString();

      // main iframe?
      if(details.parentFrameId < 0) { delete badges[tab_id]; }

      update_badge_for_tab_id(true);
    }, 0);
  },
  { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] }
);
