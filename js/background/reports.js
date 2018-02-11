var db = new Dexie('luminous');

db.version(1).stores({
	reports: 'id,key,domain,kind,[domain+kind],code,allowed,blocked,calls'
});

db.open().then(function() {
	var update_report = function(data) {
	  db.reports.where({id: data.id }).first(function(report) {
	    var put = false;
	    if(report) {
	      if(data.allowed > report.allowed || data.blocked > report.blocked || data.calls > report.calls) {
					if(data.allowed < report.allowed) data['allowed'] = report.allowed;
					if(data.blocked < report.blocked) data['blocked'] = report.blocked;
					if(data.calls < report.calls) data['calls'] = report.calls;

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

	var set_reports_for_tab = function(tab_ids) {
		chrome.storage.sync.get('reports', function(sync_data) {
			if(sync_data['reports']['collect_data']) {
			  chrome.storage.local.get(null, function(local_data) {
			    for(i in tab_ids) {
			      var tab_id = tab_ids[i];
			      chrome.tabs.get(parseInt(tab_id), function(tab) {
			        if(tab && local_data[tab.id]) {
			          var a_element = document.createElement('a');
			          a_element.href = tab.url;
			          var domain = a_element.hostname;

			          if(/\./.test(domain)) {
			            for(kind in local_data[tab.id]['counters']) {
			              for(code in local_data[tab.id]['counters'][kind]) {
			                if(validates_code(code, 'almost_all')) {
												var key = domain + '^' + kind + '^' + code;

			                  var allowed = local_data[tab.id]['counters'][kind][code]['allowed'];
			                  var blocked = local_data[tab.id]['counters'][kind][code]['blocked'];
			                  var calls = allowed + blocked;

			                  update_report({
			                    id: key, domain: domain, kind: kind, code: code,
													allowed: allowed, blocked: blocked, calls: calls
			                  });
			                }
			              }
			            }
			          }
			        }
			      });
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
});
