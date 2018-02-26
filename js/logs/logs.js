$(document).ready(function() {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.action == 'log_input') {
      var row = Mustache.render(
        '<tr class="{{result}}">' +
          '<td>{{tab}}</td>' +
          '<td>{{domain}}</td>' +
          '<td>{{time}}</td>' +
          '<td>{{kind}}</td>' +
          '<td>{{type}}</td>' +
          '<td>{{target}}</td>' +
          '<td>{{code}}</td>' +
        '</tr>',
        {
          tab: message.tab_id,
          domain: message.domain,
          time: short_time(message.data.time),
          kind: message.data.kind,
          type: message.data.type,
          target: message.data.details.target,
          code: message.data.details.code,
          result: message.data.result
        }
      );

      $('tbody').prepend(row);
    }
  });
});
