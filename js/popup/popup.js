var set_sync_option_disabled_for_kind_and_type = function(domain, kind, type, value) {
  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      if(!sync_data['options']['disabled'][domain]) {
        sync_data['options']['disabled'][domain] = {};
      }

      if(!sync_data['options']['disabled'][domain][kind]) {
        sync_data['options']['disabled'][domain][kind] = {};
      }

      sync_data['options']['disabled'][domain][kind][type] = value;

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
}

var set_sync_popup_option = function(name, value) {
  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      sync_data['options']['popup'][name] = value;

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
};

var set_sync_option_injection_disabled_for_name = function(name, value) {
  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      sync_data['options']['injection_disabled'][name] = value;

      chrome.storage.sync.set(sync_data);
    });
  }, 0);
}

var load_store_data_from_tab = function(tab_id, current_tab_url) {
  chrome.storage.local.get(tab_id, function(local_data) {
    if(!local_data) { local_data = {}; }

    var a_element = document.createElement('a');
    a_element.href = current_tab_url;
    var domain = a_element.hostname;

    chrome.storage.sync.get('options', function(sync_data) {
      if(!sync_data['options']['disabled'][domain]) {
        sync_data['options']['disabled'][domain] = {};
      }

      load_template('html/popup/templates/options.html', function(template) {

        $('#options-container').html(
          Mustache.render(template, {
            domain: domain,
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_code_details_title: chrome.i18n.getMessage('checkboxShowCodeDetails'),
            general_injection_enabled: !sync_data['options']['injection_disabled']['general'],
            domain_injection_enabled: !sync_data['options']['injection_disabled'][domain],
            show_code_details: sync_data['options']['popup']['show_code_details']
          })
        );

        $('#options-container input').change(function() {
          $('#loading').fadeIn(200);

          var value = $(this).is(':checked');
          var name = $(this).attr('name');

          if(name == 'show_code_details') {
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

            if(sync_data['options']['popup']['show_code_details']) {
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
              title_for_tooltip: tooltip_content(name, value['samples'])
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
              title_for_tooltip: tooltip_content(name, value['samples'])
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
              title_for_tooltip: tooltip_content(name, value['samples'])
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
                sync_data['options']['disabled'][domain], null, 2
              ),
              nothing_detected: false,
              nothing_detected_message: chrome.i18n.getMessage('messageNothingDetected'),
              handle_event_title: chrome.i18n.getMessage('titleHandleEvent'),
              web_apis_title: chrome.i18n.getMessage('titleWebAPIs'),
              add_event_listener_title: chrome.i18n.getMessage('titleAddEventListener'),
              disabled_class: function() {
                return function (text, render) {
                  var keys = render(text).split(',');
                  var disabled = false;

                  if(sync_data['options']['disabled'][domain][keys[0]]) {
                    disabled = sync_data['options']['disabled'][domain][keys[0]][keys[1]];
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
            performance: true, interactive: sync_data['options']['popup']['show_code_details'],
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

chrome.storage.onChanged.addListener(function(changes, _namespace) {
  if(changes[current_tab_id] || changes['options']) {
    if(changes['options']) {
      should_hidde_loading = true;
    }
    should_reload = true;
  }
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
  $('#help-link').attr('href', chrome.i18n.getMessage('linkHelpHref'));
  $('#help-link').html(chrome.i18n.getMessage('linkHelpText'));
  $('#settings-link').html(chrome.i18n.getMessage('linkSettingsText'));
});
