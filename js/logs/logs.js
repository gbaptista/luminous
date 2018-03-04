$(document).ready(function() {
  var sidebar = true;

  if(/container=devtools/.test(document.location.search)) {
    sidebar = false;
  }

  var multitab_support = true;

  if(chrome.tabs == undefined) {
    multitab_support = false;
  }

  if(multitab_support) {
    $('#form').addClass('multitab');
    $('.table-area').addClass('multitab');
  }

  load_template('html/logs/templates/form.html', function(form_template) {
    load_template('html/logs/templates/rows.html', function(rows_template) {

      var log_lines_stack_fifo = [];

      var process_log_lines_stack_timer = undefined;

      var process_log_lines_stack = function() {
        clearTimeout(process_log_lines_stack_timer);
        process_log_lines_stack_timer = undefined;

        var html = Mustache.render(
          rows_template, { sidebar: sidebar, rows: log_lines_stack_fifo.reverse() }
        );

        log_lines_stack_fifo = [];

        $('tbody').prepend(html);
      };

      var current_tab = {};

      var settings = {
        state: 'started',
        filter_in: '',
      filter_out: 'setInterval|setTimeout|handleEvent.message',
        filter_out_regex: new RegExp(
        'setInterval|setTimeout|handleEvent.message', 'i'
        ),
        tabs: [],
        current_tab: undefined,
        tab_filter: 'all'
      }

      var update_tabs = function(query_results) {
        var tabs = [];

        for(i in query_results) {
          var tab = query_results[i];

          var a_element = document.createElement('a');
          a_element.href = tab.url;
          var domain = a_element.hostname;

          tabs.push({ id: tab.id, domain: domain });

          if(tab.active) {
            current_tab = { id: tab.id, domain: domain };
          }
        }

        settings['tabs'] = tabs;
        settings['current_tab'] = current_tab;
      }

      var initialize_panel = function(query_results) {
        update_tabs(query_results);

        if(multitab_support) {
          // TODO use current_tab filter
          // settings['tab_filter'] = current_tab['id'];
          settings['tab_filter'] = 'auto';
        }

        var render_form = function() {
          $('#form').html(Mustache.render(form_template, {
            sidebar: sidebar,
            started: (settings['state'] == 'started'),
            filter_in: settings['filter_in'],
            filter_out: settings['filter_out'],
            tabs: settings['tabs'],
            current_tab: settings['current_tab'],
            tab_filter: settings['tab_filter'],
            multitab_support: multitab_support,
            option_selected: function () {
              return function (text, render) {
                if(render(text) == settings['tab_filter']) {
                  return 'selected'
                } else {
                  return '';
                }
              }
            }
          }));

          if(multitab_support) {
            chrome.tabs.onActivated.addListener(function(activeInfo) {
              chrome.tabs.query({}, function(query_results) {
                update_tabs(query_results);
                render_form();
              });
            });
          }

          if(multitab_support) {
            chrome.webRequest.onBeforeRequest.addListener(
              function(_details) {
                chrome.tabs.query({}, function(query_results) {
                  update_tabs(query_results);
                  render_form();
                });
              },
              { urls: ['<all_urls>'], types: ['main_frame'] }
            );
          }

          $('#tab_filter').change(function(event) {
            event.preventDefault();
            settings['tab_filter'] = $(this).val();
            render_form();
          });

          $('#start').click(function(event) {
            event.preventDefault();
            settings['state'] = 'started';
            settings['filter_in'] = $('#filter_in').val();
            settings['filter_out'] = $('#filter_out').val();
            if(settings['filter_in'] != '') {
              // TODO regex for multiline codes
              settings['filter_in_regex'] = new RegExp(settings['filter_in'], 'i');
            } else {
              settings['filter_in_regex'] = undefined;
            }

            if(settings['filter_out'] != '') {
              settings['filter_out_regex'] = new RegExp(settings['filter_out'], 'i');
            } else {
              settings['filter_out_regex'] = undefined;
            }

            render_form();
          });

          $('#stop').click(function(event) {
            event.preventDefault();
            settings['state'] = 'stoped';
            render_form();
          });

          $('#clear').click(function(event) {
            event.preventDefault();
            $('tbody').html('');
          });
        }

        render_form();

        var port = chrome.runtime.connect({ name: 'devtools_tunnel' });

        port.onMessage.addListener(function (message) {
          if(settings['state'] == 'started') {
            if(
              settings['tab_filter'] == 'all'
              ||
              (
                settings['tab_filter'] == 'auto'
                &&
                message.tab_id == settings['current_tab']['id']
              )
              ||
              settings['tab_filter'] == message.tab_id
            ) {
              var stack = message.stack;
              var stack_size = stack.length;

              for (i = 0; i < stack_size; i++) {
                var data = stack[i];

                var formated_time = short_time(data.time);

                var display_input = true;
                var result = (data.allowed ? 'allowed' :  'blocked');

                if(settings['filter_in_regex'] || settings['filter_out_regex']) {
                  var check_string = result + ' ' +
                                     data.tab_id + ' ' +
                                     data.domain + ' ' +
                                     data.url + ' ' +
                                     formated_time + ' ' +
                                     data.kind + ' ' +
                                     data.type + ' ' +
                                     data.target + ' ' +
                                     data.code + ' ';

                  if(settings['filter_out_regex']) {
                    if(settings['filter_out_regex'].test(check_string)) {
                      display_input = false;
                    }
                  }

                  if(settings['filter_in_regex']) {
                    if(!settings['filter_in_regex'].test(check_string)) {
                      display_input = false;
                    }
                  }
                }

                if(display_input) {
                  var row = {
                    tab: data.tab_id,
                    domain: data.domain,
                    url: data.url,
                    time: formated_time,
                    kind: data.kind,
                    type: data.type,
                    target: data.target,
                    code: data.code,
                    class: (data.allowed ? '' : 'table-danger')
                  };

                  log_lines_stack_fifo.push(row);

                  if(!process_log_lines_stack_timer) {
                    process_log_lines_stack_timer = setTimeout(function() {
                      process_log_lines_stack();
                    }, 300); // STACK_TIMER_05
                  }
                }
              }
            }
          }
        });
      }

      if(multitab_support) {
        chrome.tabs.query({}, function(query_results) {
          initialize_panel(query_results);
        });
      } else {
        initialize_panel([]);
      }
    });
  });
});
