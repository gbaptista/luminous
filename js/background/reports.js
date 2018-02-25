var db = create_luminous_db();

var update_reports_for_tab_id = function() {};

var on_db_open = function() {
  var update_report = function(data, callback) {
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

  var set_reports_for_tab = function(tab_ids, callback) {
    chrome.storage.sync.get('reports', function(sync_data) {
      if(sync_data['reports']['collect_data']) {
        chrome.storage.local.get(null, function(local_data) {
          for(i in tab_ids) {
            var tab_id = tab_ids[i];

            setTimeout(function(tab_id, callback) {
              if(local_data[tab_id]) {
                var domain = local_data[tab_id]['domain'];

                if(/\./.test(domain)) {
                  for(kind in local_data[tab_id]['counters']) {
                    for(code in local_data[tab_id]['counters'][kind]) {
                      if(validates_code(code, 'almost_all')) {
                        var key = domain + '^' + kind + '^' + code;

                        var allowed = local_data[tab_id]['counters'][kind][code]['allowed'];
                        var blocked = local_data[tab_id]['counters'][kind][code]['blocked'];
                        var calls = allowed + blocked;

                        var execution_time = local_data[tab_id]['counters'][kind][code]['execution_time'];

                        var report_params = {
                          id: key, domain: domain, kind: kind, code: code,
                          allowed: allowed, blocked: blocked, calls: calls,
                          execution_time: execution_time
                        }

                        setTimeout(function(report_params) {
                          update_report(report_params,);
                        }, 0, report_params);
                      }
                    }
                  }
                }
              }

              if(callback) { setTimeout(function() { callback(); }, 0); }
            }, 0, tab_id, callback);
          }
        });
      }
    });
  }

  setInterval(function() {
    chrome.storage.local.get(null, function(local_data) {
      var tab_ids = [];

      for(tab_id in local_data) { tab_ids.push(tab_id) }

      set_reports_for_tab(tab_ids);
    });
  }, 2000);

  var set_tab_reports = function(activeInfo) {
    chrome.tabs.get(parseInt(activeInfo.tabId), function(tab) {
      if(tab) {
        set_reports_for_tab([tab.id]);
      }
    });
  }

  chrome.tabs.onActivated.addListener(set_tab_reports);

  update_reports_for_tab_id = function(tab_id, callback) {
    set_reports_for_tab([tab_id], callback);
  };
}

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
