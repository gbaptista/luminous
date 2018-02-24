$(document).ready(function() {
  var limit = 10;

  var db = create_luminous_db();

  var complete_loads = 0;

  setTimeout(function() {
    if(complete_loads < 2) {
      alert('Reports loading failed! db.isOpen(): ' + db.isOpen());
    }
  }, 1000);

  db.open().then(function() {
    var is_loaded = function() {
      complete_loads += 1;

      if(complete_loads > 1) {
        loaded();
      }
    }

    db.reports.count(function(count) {
      $('#used').html(short_number(count) + ' ' + chrome.i18n.getMessage('settingsRecordsText') + ' | ');
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

    if(/sort_by=execution_time/.test(document.location.toString().split('?')[1])) {
      $('.sort_by_execution_time').addClass('bold');
    } else {
      $('.sort_by_calls').addClass('bold');
    }

    var sort_by_parameter = function() {
      if(/sort_by=execution_time/.test(document.location.toString().split('?')[1])) {
          return 'execution_time';
      } else {
        return 'calls';
      }
    }

    load_template('html/settings/templates/reports/form.html', function(template) {
      var load_sync_data = function() {
        chrome.storage.sync.get(null, function(sync_data) {
          $('#form').html(
            Mustache.render(template, {
              collect_data_title: chrome.i18n.getMessage('settingsEnableReportsGenerationText'),
              collect_data: sync_data['reports']['collect_data']
            })
          );

          observe_form();
        });
      }

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

              grouped_list[list[i][group_by]]['execution_time'] = 0;
              grouped_list[list[i][group_by]]['calls'] = 0;
            }

            if(list[i]['execution_time'] == undefined) {
              list[i]['execution_time'] = 0.0;
            }

            grouped_list[list[i][group_by]]['execution_time'] += list[i]['execution_time'];
            grouped_list[list[i][group_by]]['calls'] += list[i]['calls'];
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

    var format_items = function(items) {
      for(i in items) {
        items[i]['calls'] = short_number(items[i]['calls'], '0', ' ');
        items[i]['execution_time'] = short_time(items[i]['execution_time'], ' ');
      }
      return items;
    }

    var load_custom_domain = function(domain) {
      loading();

      load_template('html/settings/templates/reports/by-type.html', function(template) {
        $('#custom-domain').html(
          Mustache.render(template, {
            title: chrome.i18n.getMessage('settingsMostExecutedJavaScriptCodesText'),
            domain: domain,
            filter_buton_text: chrome.i18n.getMessage('settingsFilterButtonText'),
            placeholder: chrome.i18n.getMessage('settingsFilterByDomainPlaceHolderText'),
            domain_filter: true,
            no_records: chrome.i18n.getMessage('settingsNoRecordsText')
          })
        );

        load_template('html/settings/templates/reports/tables/executions.html', function(template) {
          var where = function(query) {
            return query.where({domain: domain});
          }

          group_and_sort('code', sort_by_parameter(), limit, where, function(items) {
            $('#custom-domain .total-calls').html(
              Mustache.render(template, {
                group_title: 'domain',
                count_title: chrome.i18n.getMessage('settingsAddEventAllLabel'),
                items: format_items(items),
                no_records: chrome.i18n.getMessage('settingsNoRecordsText')
              })
            );

            $('#domain-filter-form').submit(function(event) {
              event.preventDefault();

              loading(function() {
                var domain = 'https://' + $('#filter-by-domain').val().toLowerCase().replace(
                  /.*:\/\//, ''
                ).replace(/\s/g, '');

                var a_element = document.createElement('a');
                a_element.href = domain;

                if(a_element.hostname && a_element.hostname != window.location.hostname) {
                  load_custom_domain(a_element.hostname);
                } else {
                  alert(chrome.i18n.getMessage('settingsInvalidDomainMessage'));
                  loaded();
                }
              });
            });

            loaded();
          });
        });

        var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

        var load_report_by_kind = function(kind) {
          load_template('html/settings/templates/reports/tables/executions.html', function(template) {
            var where = function(query) {
              return query.where({domain: domain, kind: kind});
            }

            group_and_sort('code', sort_by_parameter(), limit, where, function(items) {
              $('#custom-domain .' + kind + '-calls').html(
                Mustache.render(template, {
                  group_title: 'domain',
                  count_title: kind,
                  items: format_items(items),
                  no_records: chrome.i18n.getMessage('settingsNoRecordsText')
                })
              );
            })
          });
        }

        for(i in kinds) { load_report_by_kind(kinds[i]); }
      });
    }

    load_template('html/settings/templates/reports/by-type.html', function(template) {
      $('#per-code').html(
        Mustache.render(template,
          { title: chrome.i18n.getMessage('settingsMostExecutedJavaScriptCodesText')
        })
      );

      load_template('html/settings/templates/reports/tables/executions.html', function(template) {
        group_and_sort('code', sort_by_parameter(), limit, undefined, function(items) {
          $('#per-code .total-calls').html(
            Mustache.render(template, {
              group_title: 'domain',
              count_title: chrome.i18n.getMessage('settingsAddEventAllLabel'),
              items: format_items(items),
              no_records: chrome.i18n.getMessage('settingsNoRecordsText')
            })
          );

          is_loaded();
        });
      });

      var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

      var load_report_by_kind = function(kind) {
        load_template('html/settings/templates/reports/tables/executions.html', function(template) {
          var where = function(query) {
            return query.where('kind').equals(kind);
          }

          group_and_sort('code', sort_by_parameter(), limit, where, function(items) {
            $('#per-code .' + kind + '-calls').html(
              Mustache.render(template, {
                group_title: 'domain',
                count_title: kind,
                items: format_items(items),
                no_records: chrome.i18n.getMessage('settingsNoRecordsText')
              })
            );
          })
        });
      }

      for(i in kinds) { load_report_by_kind(kinds[i]); }
    });

    load_template('html/settings/templates/reports/by-type.html', function(template) {
      $('#per-domain').html(
        Mustache.render(template, {
          title: chrome.i18n.getMessage('settingsDomainsMostJavaScriptCodesText')
        })
      );

      load_template('html/settings/templates/reports/tables/executions.html', function(template) {
        group_and_sort('domain', sort_by_parameter(), limit, undefined, function(items) {

          if(items[0]) {
            load_custom_domain(items[0].name);
          }

          $('#per-domain .total-calls').html(
            Mustache.render(template, {
              group_title: 'domain',
              count_title: chrome.i18n.getMessage('settingsAddEventAllLabel'),
              items: format_items(items),
              no_records: chrome.i18n.getMessage('settingsNoRecordsText')
            })
          );

          is_loaded();
        })
      });

      var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

      var load_report_by_kind = function(kind) {
        load_template('html/settings/templates/reports/tables/executions.html', function(template) {
          var where = function(query) {
            return query.where('kind').equals(kind);
          }

          group_and_sort('domain', sort_by_parameter(), limit, where, function(items) {
            $('#per-domain .' + kind + '-calls').html(
              Mustache.render(template, {
                group_title: 'domain',
                count_title: kind,
                items: format_items(items),
                no_records: chrome.i18n.getMessage('settingsNoRecordsText')
              })
            );
          })
        });
      }

      for(i in kinds) { load_report_by_kind(kinds[i]); }
    });
  }).catch(function(err) {
    alert('Failed to open Luminous db: ' + (err.stack || err));
    loaded();
  });
});
