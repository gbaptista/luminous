$(document).ready(function() {
  load_template('html/logs/templates/form.html', function(form_template) {
    load_template('html/logs/templates/row.html', function(row_template) {

      var settings = {
        state: 'started',
        filter_in: '',
        filter_out: '',
        regex: undefined
      }

      var render_form = function() {
        $('#form').html(Mustache.render(form_template, {
          started: (settings['state'] == 'started'),
          filter_in: settings['filter_in'],
          filter_out: settings['filter_out']
        }));

        $('#start').click(function(event) {
          event.preventDefault();
          settings['state'] = 'started';
          settings['filter_in'] = $('#filter_in').val();
          settings['filter_out'] = $('#filter_out').val();
          if(settings['filter_in'] != '') {
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

      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message.action == 'log_input') {
          if(settings['state'] == 'started') {

            var formated_time = short_time(message.data.time);

            var display_input = true;
            if(settings['filter_in_regex'] || settings['filter_out_regex']) {
              var check_string = message.tab_id + ' ' +
                                 message.domain + ' ' +
                                 formated_time + ' ' +
                                 message.data.kind + ' ' +
                                 message.data.type + ' ' +
                                 message.data.details.target + ' ' +
                                 message.data.details.code + ' ' +
                                 message.data.result;

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
              $('tbody').prepend(Mustache.render(row_template, {
                tab: message.tab_id,
                domain: message.domain,
                time: formated_time,
                kind: message.data.kind,
                type: message.data.type,
                target: message.data.details.target,
                code: message.data.details.code,
                class: (message.data.result == 'blocked' ? 'table-danger' : '')
              }));
            }
          }
        }
      });
    });
  });
});
