var sidebar = true;

var filter_in_placeholder = chrome.i18n.getMessage('logsFilterInPlaceholder');
var filter_out_placeholder = chrome.i18n.getMessage('logsFilterOutPlaceholder');
var filter_all_text = chrome.i18n.getMessage('logsFilterAllText');
var filter_auto_detect_text = chrome.i18n.getMessage('logsFilterAutoDetectText');
var start_button_text = chrome.i18n.getMessage('logsStartButtonText');
var stop_button_text = chrome.i18n.getMessage('logsStopButtonText');
var clear_button_text = chrome.i18n.getMessage('logsClearButtonText');
var tab_text = chrome.i18n.getMessage('settingsTabText');

var a_element = document.createElement('a');

var log_table_element = document.getElementById('log-table');
var for_element = document.getElementById('form');
var table_area_element = document.getElementById('table-area');

if(/container=devtools/.test(document.location.search)) {
  sidebar = false;
}

var multitab_support = true;

if(chrome.tabs == undefined) {
  multitab_support = false;
}

if(multitab_support) {
  for_element.setAttribute('class', 'multitab');
  table_area_element.setAttribute('class', 'multitab');
}

var devtools_tab_id = chrome.runtime.connect({ name: 'devtools_tab_id' });

devtools_tab_id.onMessage.addListener(function(tab) {
  var current_tab = {};

  var default_filter_out = [
    'setInterval', 'setTimeout',
    'handleEvent.message',
    'handleEvent.timeupdate',
    'handleEvent.progress',
    'updateend'
  ].join('|')

  var settings = {
    state: 'started',
    filter_in: '',
    filter_out: default_filter_out,
    filter_out_regex: new RegExp(default_filter_out, 'i'),
    tabs: [],
    current_tab: undefined,
    tab_filter: 'all'
  }

  if(!multitab_support) {
    current_tab = tab;
    settings['current_tab'] = current_tab;
  }

  devtools_tab_id.disconnect();

  load_template('html/logs/templates/form.html', function(form_template) {
    var log_lines_stack_fifo = [];

    var process_log_lines_stack_timer = undefined;

    var process_log_lines_stack = function() {
      clearTimeout(process_log_lines_stack_timer);
      process_log_lines_stack_timer = undefined;

      var stack_size = log_lines_stack_fifo.length + 1;

      var rows = [];

      var last_key = undefined;

      while(--stack_size) {
        var row = log_lines_stack_fifo.shift();

        if(row['key'] == last_key) {
          var last_row = rows.pop();

          last_row['count'] += 1;
          last_row['time'] += row['time'];
          last_row['target'] = row['target'];
          last_row['code'] = row['code'];
          last_row['short_time'] = short_time(last_row['time']);

          rows.push(last_row);
        } else {
          last_key = row['key'];
          row['short_time'] = short_time(row['time']);
          rows.push(row);
        }
      }

      rows.reverse();

      // -----------------------------
      var rows_size = rows.length + 1;

      var document_fragment = document.createDocumentFragment();

      while(--rows_size) {
        var row = rows.shift();

        var row_element = document.createElement('tr');

        row_element.setAttribute('class', row['class']);
        row_element.setAttribute(
          'title',
          tab_text + ' ' + row['tab'] + ': ' + row['url']
        );

        var row_content = '';
        row_content += '<td class="count">' + row['count'] + '</td>'
        row_content += '<td class="time">' + row['short_time'] + '</td>'
        if(!sidebar) {
          row_content += '<td class="time">';
          if(row['main_frame']) {
            row_content += '<strong>' + row['domain'] + '</strong>';
          } else {
            row_content += '<em>' + row['domain'] + '</em>';
          }
          row_content += '</td>';
        }

        row_content += '<td>' + row['kind'] + '.' + row['type'] + '</td>'

        if(!sidebar) {
          row_content += '<td>' + row['target'];
          if(row['code']) {
            row_content += ': <em>' + row['code'] + '</em>';
          }
          row_content += '</td>';
        }
        row_element.innerHTML = row_content;

        document_fragment.appendChild(row_element);
      }

      var first_row = document.getElementsByTagName('tr')[0];

      log_table_element.insertBefore(document_fragment, first_row);
    };

    var update_tabs = function(query_results, current_domain) {
      var tabs = [];

      for(i in query_results) {
        var tab = query_results[i];

        a_element.href = tab.url;
        var domain = a_element.hostname;

        tabs.push({ id: tab.id, domain: domain });

        if(tab.active) {
          if(current_domain) {
            current_tab = { id: tab.id, domain: current_domain };
          } else {
            current_tab = { id: tab.id, domain: domain };
          }
        }
      }

      settings['tabs'] = tabs;
      settings['current_tab'] = current_tab;
    }

    var initialize_panel = function(query_results) {
      update_tabs(query_results);

      if(multitab_support) {
        if(sidebar) {
          settings['tab_filter'] = 'auto';
        } else {
          settings['tab_filter'] = current_tab['id'];
        }
      } else {
        settings['tab_filter'] = current_tab['id'];
      }

      var render_form = function() {
        for_element.innerHTML = Mustache.render(
          form_template, {
            sidebar: sidebar,
            filter_in_placeholder: filter_in_placeholder,
            filter_out_placeholder: filter_out_placeholder,
            filter_all_text: filter_all_text,
            filter_auto_detect_text: filter_auto_detect_text,
            start_button_text: start_button_text,
            stop_button_text: stop_button_text,
            clear_button_text: clear_button_text,
            tab_text: tab_text,
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
          }
        );

        var tab_filter_element = document.getElementById('tab_filter');
        var start_element = document.getElementById('start');
        var filter_in_element = document.getElementById('filter_in');
        var filter_out_element = document.getElementById('filter_out');
        var stop_element = document.getElementById('stop');
        var clear_element = document.getElementById('clear');

        if(multitab_support) {
          tab_filter_element.addEventListener('change', function(event) {
            event.preventDefault();
            var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this);
            var value = elem.value || elem.options[elem.selectedIndex].value;
            settings['tab_filter'] = value;
            render_form();
          });
        }

        start_element.addEventListener('click', function(event) {
          event.preventDefault();

          devtools_tunnel.onMessage.addListener(on_message_listener);

          settings['state'] = 'started';

          settings['filter_in'] = filter_in_element.value;
          settings['filter_out'] = filter_out_element.value;
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

        stop_element.addEventListener('click', function(event) {
          event.preventDefault();

          settings['state'] = 'stoped';

          devtools_tunnel.onMessage.removeListener(on_message_listener);

          log_lines_stack_fifo = [];

          render_form();
        });

        clear_element.addEventListener('click', function(event) {
          event.preventDefault();
          log_table_element.innerHTML = '';
        });
      }

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
          function(details) {
            chrome.tabs.query({}, function(query_results) {
              a_element.href = details.url;
              var domain = a_element.hostname;

              update_tabs(query_results, domain);
              render_form();
            });
          },
          { urls: ['<all_urls>'], types: ['main_frame'] }
        );
      }

      render_form();

      var devtools_tunnel = chrome.runtime.connect({ name: 'devtools_tunnel' });

      var on_message_listener = function (message) {
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
            var frame = (data.main_frame ? 'main' :  'iframe');

            if(settings['filter_in_regex'] || settings['filter_out_regex']) {
              var check_string = result + ' ' +
                                 frame + ' ' +
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
              var key = data.tab_id + '^' +
                        data.main_frame + '^' +
                        data.url + '^' +
                        data.kind + '^' +
                        data.type + '^' +
                        data.allowed;

              var row = {
                count: 1,
                key: key,
                tab: data.tab_id,
                domain: data.domain,
                url: data.url,
                time: data.time,
                kind: data.kind,
                type: data.type,
                target: data.target,
                code: data.code,
                main_frame: data.main_frame,
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
      };

      devtools_tunnel.onMessage.addListener(on_message_listener);
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
