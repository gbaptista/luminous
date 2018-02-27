$(document).ready(function() {
  load_template('html/logs/templates/form.html', function(form_template) {
    load_template('html/logs/templates/row.html', function(row_template) {

      $('#form').html(Mustache.render(form_template, {
        title: 'lorem'
      }));

      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message.action == 'log_input') {
          $('tbody').prepend(Mustache.render(row_template, {
              tab: message.tab_id,
              domain: message.domain,
              time: short_time(message.data.time),
              kind: message.data.kind,
              type: message.data.type,
              target: message.data.details.target,
              code: message.data.details.code,
              result: message.data.result
          }));
        }
      });
    });
  });
});
