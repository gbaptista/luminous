$(document).ready(function() {
  var db = new Dexie('luminous');

  db.version(1).stores({
  	reports: 'id,key,domain,kind,code,allowed,blocked,calls'
  });

  db.open().catch(function (err) {
    console.error('Failed to open db: ' + (err.stack || err));
  }).then(function() {
    db.reports.count(function(count) {
      $('#used').html(count + ' rows | ');
    });

    $('#clear').click(function() {
      if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
        loading(function() {
          db.reports.where('calls').aboveOrEqual(-1).delete().then(function() {
            location.reload();
          });
        })
      }
    });

    load_template('html/settings/templates/reports/form.html', function(template) {
      var load_sync_data = function() {
        chrome.storage.sync.get(null, function(sync_data) {
          $('#form').html(
            Mustache.render(template, {
              collect_data_title: 'enable reports collection',
              collect_data: sync_data['reports']['collect_data']
            })
          );

          observe_form();

          loaded();
        });
      }

      chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(namespace == 'sync' && changes) {
          loading();
          load_sync_data();
        }
      });

      load_sync_data();
    });

    //  Domain Reports ---------------------------------------------------------

    var group_and_sort = function(group_by, sort_by, limit, where, callback) {
      var query = db.reports;

      if(!where) {
        applyed_where = function(query, callback) {
          callback(query);
        }
      } else {
        applyed_where = function(query, callback) {
          callback(where(query));
        }
      }

      applyed_where(query, function(query) {
        query.toArray(function(list) {
          var grouped_list = {};

          for(i in list) {
            if(!grouped_list[list[i][group_by]]) {
              grouped_list[list[i][group_by]] = {
                name: list[i][group_by]
              };

              grouped_list[list[i][group_by]][sort_by] = 0;
            }

            grouped_list[list[i][group_by]][sort_by] += list[i][sort_by];
          }

          var list = [];

          for(i in grouped_list) { list.push(grouped_list[i]); }

          var sort_by_function = function(a, b) {
            return (a[sort_by] < b[sort_by]) ? 1 : ((b[sort_by] < a[sort_by]) ? -1 : 0);
          };

          list.sort(sort_by_function);

          callback(list.slice(0, limit));
        });
      });
    }

    load_template('html/settings/templates/reports/by-type.html', function(template) {
      $('#per-code').html(
        Mustache.render(template, { title: 'Top JavaScript Executions per code' })
      );

      load_template('html/settings/templates/reports/tables/executions.html', function(template) {
        group_and_sort('code', 'calls', 10, undefined, function(items) {
          $('#per-code .total-calls').html(
            Mustache.render(template, {
              group_title: 'domain',
              count_title: 'Everything',
              items: items
            })
          );
        })
      });

      var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

      var load_report_by_kind = function(kind) {
        load_template('html/settings/templates/reports/tables/executions.html', function(template) {
          var where = function(query) {
            return query.where('kind').equals(kind);
          }

          group_and_sort('code', 'calls', 10, where, function(items) {
            $('#per-code .' + kind + '-calls').html(
              Mustache.render(template, {
                group_title: 'domain',
                count_title: kind,
                items: items
              })
            );
          })
        });
      }

      for(i in kinds) { load_report_by_kind(kinds[i]); }
    });

    load_template('html/settings/templates/reports/by-type.html', function(template) {
      $('#per-domain').html(
        Mustache.render(template, { title: 'Top JavaScript Executions per domain' })
      );

      load_template('html/settings/templates/reports/tables/executions.html', function(template) {
        group_and_sort('domain', 'calls', 10, undefined, function(items) {
          $('#per-domain .total-calls').html(
            Mustache.render(template, {
              group_title: 'domain',
              count_title: 'Everything',
              items: items
            })
          );
        })
      });

      var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

      var load_report_by_kind = function(kind) {
        load_template('html/settings/templates/reports/tables/executions.html', function(template) {
          var where = function(query) {
            return query.where('kind').equals(kind);
          }

          group_and_sort('domain', 'calls', 10, where, function(items) {
            $('#per-domain .' + kind + '-calls').html(
              Mustache.render(template, {
                group_title: 'domain',
                count_title: kind,
                items: items
              })
            );
          })
        });
      }

      for(i in kinds) { load_report_by_kind(kinds[i]); }
    });

    loaded();
  });
});
