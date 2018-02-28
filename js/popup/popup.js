var set_sync_option_disabled_for_kind_and_type = function(domain, kind, type, value) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      if(!sync_data['disabled_' + domain]) {
        sync_data['disabled_' + domain] = {};
      }

      if(!sync_data['disabled_' + domain][kind]) {
        sync_data['disabled_' + domain][kind] = {};
      }

      if(sync_data['popup']['apply_to_default']) {
        if(sync_data['disabled_' + domain][kind][type] != value) {
          delete sync_data['disabled_' + domain][kind][type];
        }

        sync_data['default_disabled_' + kind][type] = value;
      } else {
        sync_data['disabled_' + domain][kind][type] = value;
      }

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
}

var set_sync_popup_option = function(name, value) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      sync_data['popup'][name] = value;

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
};

var set_sync_option_injection_disabled_for_name = function(name, value) {
  setTimeout(function() {
    chrome.storage.sync.get(null, function(sync_data) {
      sync_data['injection_disabled'][name] = value;

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
}

var load_store_data_from_tab = function(tab_id, current_tab_url) {
  chrome.runtime.sendMessage({ action: 'counters_for_tab_id', tab_id: tab_id }, function(response) {
    var local_data = response.data;

    if(!local_data) { local_data = {}; }

    var domain = local_data[tab_id]['domain'];

    chrome.storage.sync.get(null, function(sync_data) {
      if(!sync_data['disabled_' + domain]) {
        sync_data['disabled_' + domain] = {};
      }

      if(sync_data['popup']['zoom_in']) {
        $('body').addClass('zoom-in');
      } else {
        $('body').removeClass('zoom-in');
      }

      var kinds = [];

      for(possible_kind in sync_data) {
        var regex = /^default_disabled_/;
        if(regex.test(possible_kind)) {
          kinds.push(possible_kind.replace(regex, ''));
        }
      }

      // Apply default rules
      for(i in kinds) {
        var kind = kinds[i];

        if(!sync_data['disabled_' + domain][kind]) {
          sync_data['disabled_' + domain][kind] = {};
        }

        for(code in sync_data['default_disabled_' + kind]) {
          if(sync_data['disabled_' + domain][kind][code] == undefined) {
            if(sync_data['default_disabled_' + kind][code]) {
              sync_data['disabled_' + domain][kind][code] = sync_data['default_disabled_' + kind][code];
            }
          }
        }
      }

      load_template('html/popup/templates/options.html', function(template) {

        $('#options-container').html(
          Mustache.render(template, {
            domain: domain,
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),
            general_injection_enabled: !sync_data['injection_disabled']['general'],
            domain_injection_enabled: !sync_data['injection_disabled'][domain],
            show_code_details: sync_data['popup']['show_code_details'],
            zoom_in_title: chrome.i18n.getMessage('checkboxZoomIn'),
            zoom_in: sync_data['popup']['zoom_in'],
            show_performance_metrics_title: chrome.i18n.getMessage('checkboxShowPerformanceMetrics'),
            show_performance_metrics: sync_data['popup']['show_performance_metrics'],
            apply_to_default_title: chrome.i18n.getMessage('checkboxApplyToDefault'),
            apply_to_default: sync_data['popup']['apply_to_default'],
            no_domain: chrome.i18n.getMessage('settingsInvalidDomainMessage')
          })
        );

        $('#help-link').attr('href', chrome.i18n.getMessage('linkHelpHref'));
        $('#help-link').html(chrome.i18n.getMessage('linkHelpText'));
        $('#settings-link').html(chrome.i18n.getMessage('linkSettingsText'));

        $('#options-container input').change(function() {
          $('#loading').fadeIn(200);

          var value = $(this).is(':checked');
          var name = $(this).attr('name');

          if(
            name == 'show_code_details'
            ||
            name == 'zoom_in'
            ||
            name == 'apply_to_default'
            ||
            name == 'show_performance_metrics'
          ) {
            set_sync_popup_option(name, value);
          } else {
            set_sync_option_injection_disabled_for_name(name, !value);
          }
        });
      });

      load_template('html/popup/templates/counters.html', function(template) {
        if(local_data[tab_id] && local_data[tab_id]['counters']) {
          var tooltip_content = function(name, samples) {
            if(!samples) {
              samples = [{ name: name, target: target }];
            }

            var target = samples[0]['target'].replace('[object ', '').replace(']', '');

            if(sync_data['popup']['show_code_details']) {
              var text = '';

              var codes = [];

              for(key in samples) { codes.push(samples[key]['code']) }

              return Mustache.render(
                '<strong>{{name}}</strong> -> <strong>{{target}}</strong><br>' +
                '{{#codes}}<pre><code>{{.}}</code></pre>{{/codes}}',
                { name: name, target: target, codes: codes.reverse() }
              );
            } else {
              return Mustache.render(
                '<strong>{{name}}</strong> -> <strong>{{target}}</strong>',
                { name: name, target: target }
              );
            }
          }
          var add_event_listener_calls = [];

          $.each(local_data[tab_id]['counters']['addEventListener'], function(name, value) {
            add_event_listener_calls.push({
              name: name,
              allowed: short_number_for_counter(value['allowed']),
              blocked: short_number_for_counter(value['blocked']),
              allowed_color: background_color_for_counter(value['allowed']),
              blocked_color: background_color_for_counter(value['blocked']),
              title_for_tooltip: tooltip_content(name, value['samples']),
              execution_time: short_time(value['execution_time'])
            });
          });

          var handle_event_calls = [];

          $.each(local_data[tab_id]['counters']['handleEvent'], function(name, value) {
            handle_event_calls.push({
              name: name,
              allowed: short_number_for_counter(value['allowed']),
              blocked: short_number_for_counter(value['blocked']),
              allowed_color: background_color_for_counter(value['allowed']),
              blocked_color: background_color_for_counter(value['blocked']),
              title_for_tooltip: tooltip_content(name, value['samples']),
              execution_time: short_time(value['execution_time'])
            });
          });

          var web_apis_calls = [];

          $.each(local_data[tab_id]['counters']['WebAPIs'], function(name, value) {
            web_apis_calls.push({
              name: name,
              allowed: short_number_for_counter(value['allowed']),
              blocked: short_number_for_counter(value['blocked']),
              allowed_color: background_color_for_counter(value['allowed']),
              blocked_color: background_color_for_counter(value['blocked']),
              title_for_tooltip: tooltip_content(name, value['samples']),
              execution_time: short_time(value['execution_time'])
            });
          });

          var sort_by_name = function(a, b) {
            return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);
          };

          add_event_listener_calls.sort(sort_by_name);
          handle_event_calls.sort(sort_by_name);
          web_apis_calls.sort(sort_by_name);

          $('#counters-container').html(
            Mustache.render(template, {
              add_event_listener_calls: add_event_listener_calls,
              handle_event_calls: handle_event_calls,
              web_apis_calls: web_apis_calls,
              options_json: JSON.stringify(
                sync_data['disabled_' + domain], null, 2
              ),
              nothing_detected: false,
              nothing_detected_message: chrome.i18n.getMessage('messageNothingDetected'),
              handle_event_title: chrome.i18n.getMessage('titleHandleEvent'),
              web_apis_title: chrome.i18n.getMessage('titleWebAPIs'),
              add_event_listener_title: chrome.i18n.getMessage('titleAddEventListener'),
              show_performance_metrics: sync_data['popup']['show_performance_metrics'],
              disabled_class: function() {
                return function (text, render) {
                  var keys = render(text).split(',');
                  var disabled = false;

                  if(sync_data['disabled_' + domain][keys[0]]) {
                    disabled = sync_data['disabled_' + domain][keys[0]][keys[1]];
                  }

                  if(disabled) { return 'disabled'; } else { return ''; };
                }
              }
            })
          );

          $('.interceptions .calls').click(function() {
            $('#loading').fadeIn(200);

            var kind = $(this).data('kind');
            var type = $(this).data('type');
            var value = !$(this).hasClass('disabled');

            set_sync_option_disabled_for_kind_and_type(
              domain, kind, type, value
            );

            if($(this).hasClass('disabled')) {
              $(this).removeClass('disabled');
            } else {
              $(this).addClass('disabled');
            }
          });

          tippy('.interceptions .calls', {
            theme: 'js-sample', animateFill: false, size: 'small',
            performance: true, interactive: sync_data['popup']['show_code_details'],
            duration: [0, 0],
            onShown: function() {
              $('.tippy-popper:not(:last-child)').remove();
            },
            onHidde: function() {
              $('.tippy-popper').remove();
            }
          });
        } else {
          $('.tippy-popper').remove();

          $('#counters-container').html(
            Mustache.render(template, {
              nothing_detected: true,
              nothing_detected_message: chrome.i18n.getMessage('messageNothingDetected')
            })
          )
        }

        if(should_hidde_loading) {
          should_hidde_loading = false;
          $('#loading').fadeOut(200);
        }
      });
    });
  });
}

var load_stored_data = function() {
  load_store_data_from_tab(current_tab_id, current_tab_url);
};

var current_tab_id = 'x';
var current_tab_url = 'x';

chrome.tabs.query({ currentWindow:true, active: true, lastFocusedWindow: true }, function(tabs) {
  if(tabs[0]) {
    current_tab_id = tabs[0].id.toString();
    current_tab_url = tabs[0].url;
  }

  load_stored_data();
});

var should_reload = false;
var should_hidde_loading = false;

chrome.runtime.onMessage.addListener(function (message, _sender) {
  if(message.action == 'reload_popup' && message.tab_id == current_tab_id) {
    should_reload = true;
  }
});

chrome.storage.onChanged.addListener(function(changes, _namespace) {
  if(changes) {
    should_hidde_loading = true;
  }
  should_reload = true;
});

setInterval(function() {
  if(should_reload) {
    should_reload = false;
    load_stored_data();
  }
}, 450);

$(document).ready(function() {
  $('title').html(chrome.i18n.getMessage('manifestName'));
  $('#loading').html(chrome.i18n.getMessage('messageLoading'));
});
