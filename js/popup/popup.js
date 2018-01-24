var load_template = function(path, callback_function) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
      callback_function(request.responseText);
    }
  }
  request.open('GET', chrome.extension.getURL(path), true);
  request.send(null);
}

var set_sync_option_disabled_for_kind_and_type = function(domain, kind, type, value) {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data) sync_data = {};
    if(!sync_data['options']) sync_data['options'] = {};
    if(!sync_data['options']['disabled']) sync_data['options']['disabled'] = {};

    if(!sync_data['options']['disabled'][domain]) {
      sync_data['options']['disabled'][domain] = {};
    }

    if(!sync_data['options']['disabled'][domain][kind]) {
      sync_data['options']['disabled'][domain][kind] = {};
    }

    sync_data['options']['disabled'][domain][kind][type] = value;

    chrome.storage.sync.set(sync_data);
  });
}

var set_sync_option = function(name, value) {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data['options']) sync_data['options'] = {}

    sync_data['options'][name] = value;

    chrome.storage.sync.set(sync_data);
  });
};

var set_sync_option_injection_disabled_for_name = function(name, value) {
  chrome.storage.sync.get(null, function(sync_data) {
    if(!sync_data['options']) sync_data['options'] = {}
    if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {}

    sync_data['options']['injection_disabled'][name] = value;

    chrome.storage.sync.set(sync_data);
  });
}

var load_store_data_from_tab = function(tab_id, current_tab_url) {
  chrome.storage.local.get(tab_id, function(local_data) {
    if(!local_data) { local_data = {}; }

    var a_element = document.createElement('a');
    a_element.href = current_tab_url;
    var domain = a_element.hostname;

    chrome.storage.sync.get(null, function(sync_data) {
      if(!sync_data) sync_data = {};
      if(!sync_data['options']) sync_data['options'] = {};
      if(!sync_data['options']['injection_disabled']) sync_data['options']['injection_disabled'] = {};
      if(!sync_data['options']['disabled']) sync_data['options']['disabled'] = {};
      if(!sync_data['options']['disabled'][domain]) {
        sync_data['options']['disabled'][domain] = {};
      }

      load_template('html/popup/templates/options.html', function(template) {

        $('#options-container').html(
          Mustache.render(template, {
            domain: domain,
            general_injection_enabled_title: chrome.i18n.getMessage('checkboxInjectionEnabledGeneral'),
            show_listener_functions_title: chrome.i18n.getMessage('checkboxShowListenerFunctions'),
            general_injection_enabled: !sync_data['options']['injection_disabled']['general'],
            domain_injection_enabled: !sync_data['options']['injection_disabled'][domain],
            show_listener_functions: sync_data['options']['show_listener_functions']
          })
        );

        $('#options-container input').change(function() {
          var value = $(this).is(':checked');
          var name = $(this).attr('name');

          if(name == 'show_listener_functions') {
            set_sync_option(name, value);
          } else {
            set_sync_option_injection_disabled_for_name(name, !value);
          }
        });
      });

      load_template('html/popup/templates/counters.html', function(template) {
        if(local_data[tab_id] && local_data[tab_id]['counters']) {
          var tooltip_content = function(name, samples) {
            var target = samples[0]['target'].replace('[object ', '').replace(']', '');

            if(sync_data['options']['show_listener_functions']) {
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

          var timer_calls = [];

          $.each(local_data[tab_id]['counters']['timer'], function(name, value) {
            timer_calls.push({
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
          timer_calls.sort(sort_by_name);

          $('#counters-container').html(
            Mustache.render(template, {
              add_event_listener_calls: add_event_listener_calls,
              handle_event_calls: handle_event_calls,
              timer_calls: timer_calls,
              options_json: JSON.stringify(
                sync_data['options']['disabled'][domain], null, 2
              ),
              nothing_detected: false,
              nothing_detected_message: chrome.i18n.getMessage('messageNothingDetected'),
              handle_event_title: chrome.i18n.getMessage('titleHandleEvent'),
              timer_title: chrome.i18n.getMessage('titleTimer'),
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
            var kind = $(this).data('kind');
            var type = $(this).data('type');
            var value = !$(this).hasClass('disabled');

            set_sync_option_disabled_for_kind_and_type(
              domain, kind, type, value
            );
          });

          tippy('.interceptions .calls', {
            theme: 'js-sample', animateFill: false, size: 'small',
            performance: true, interactive: sync_data['options']['show_listener_functions'],
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

chrome.storage.onChanged.addListener(function(changes, _namespace) {
  if(changes[current_tab_id] || changes['options']) load_stored_data();
});

$(document).ready(function() {
  $('title').html(chrome.i18n.getMessage('manifestName'));
  $('#help-link').attr('href', chrome.i18n.getMessage('linkHelpHref'));
  $('#help-link').html(chrome.i18n.getMessage('linkHelpText'));
});
