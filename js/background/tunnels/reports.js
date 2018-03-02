var db = create_luminous_db();

var update_report = function() {
  console.error('Luminous db not opened.');
};

var collect_data = true;

chrome.storage.sync.get(null, function(sync_options) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(
      namespace == 'sync' && changes
      &&
      changes['reports'] && changes['reports'].newValue
    ) {
      collect_data = changes['reports'].newValue['collect_data'];
    }
  });
  collect_data = sync_options['reports']['collect_data'];
});

var reports_stack_fifo = {};

var process_reports_stack_timer = undefined;

var on_db_open = function() {
  update_report = function(data) {
    db.reports.where({id: data.id }).first(function(report) {
      var put = false;

      if(report) {
        if(
          data.allowed > report.allowed || data.blocked > report.blocked || data.calls > report.calls
          || data.execution_time > report.execution_time
        ) {
          if(data.allowed < report.allowed) data['allowed'] = report.allowed;
          if(data.blocked < report.blocked) data['blocked'] = report.blocked;
          if(data.calls < report.calls) data['calls'] = report.calls;
          if(data.execution_time < report.execution_time) data['execution_time'] = report.execution_time;

          put = true;
        }
      } else {
        put = true;
      }

      if(put) {
        db.reports.put(data);
      }
    });
  }
}

var process_reports_stack = function() {
  if(process_reports_stack_timer) {
    clearTimeout(process_reports_stack_timer);

    process_reports_stack_timer = undefined;
  }

  for(key in reports_stack_fifo) {
    var data = reports_stack_fifo[key];

    delete reports_stack_fifo[key];

    if(
      collect_data
      &&
      counters[data['tab_id']]
      &&
      counters[data['tab_id']]['domain'] == data['domain']
    ) {
      if(
        counters[data['tab_id']]['counters'][data['kind']]
        &&
        counters[data['tab_id']]['counters'][data['kind']][data['code']]
      ) {
        var key = data['domain'] + '^' + data['kind'] + '^' + data['code'];

        var current_data = counters[data['tab_id']]['counters'][data['kind']][data['code']];

        var execution_time = current_data['execution_time'];
        if(!execution_time) execution_time = 0;

        var report_params = {
          id: key, domain: data['domain'], kind: data['kind'], code: data['code'],
          allowed: current_data['allowed'], blocked: current_data['blocked'],
          calls: current_data['allowed'] + current_data['blocked'],
          execution_time: execution_time
        };

        update_report(report_params);
      }
    }
  }
}

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(collect_data && message.action == 'log_input' && validates_code(message.data.type, 'almost_all')) {
    var key = message.tab_id +
              '^' + message.domain +
              '^' + message.data.kind +
              '^' + message.data.type;

    reports_stack_fifo[key] = {
      tab_id: message.tab_id,
      domain: message.domain,
      kind: message.data.kind,
      code: message.data.type
    };

    if(!process_reports_stack_timer) {
      process_reports_stack_timer = setTimeout(function() {
        process_reports_stack();
      }, 500);
    }
  }
});


db.open().then(function() {
  on_db_open();
}).catch(function(_) {
  // The base is probably corrupted:
  Dexie.delete('luminous');

  // Try again [first time]:
  db = create_luminous_db();

  db.open().then(function() {
    on_db_open();
  }).catch(function(_) {
    // The base is probably corrupted yet:
    Dexie.delete('luminous');

    // Try again [second time]:
    db = create_luminous_db();

    db.open().then(function() {
      on_db_open();
    }).catch(function(error) {
      // Giving up...
      console.error('Failed to open Luminous db: ' + (err.stack || err));
    });
  });
});
