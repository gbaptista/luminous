$(document).ready(function() {

  var add_code = function(domain, kind, code) {
    loading();

    setTimeout(function() {
      chrome.storage.sync.get('options', function(sync_data) {
        if(!sync_data['options']['disabled'][domain][kind]) {
          sync_data['options']['disabled'][domain][kind] = {};
        }

        if(!sync_data['options']['disabled'][domain][kind][code]) {
          sync_data['options']['disabled'][domain][kind][code] = false;
        }

        chrome.storage.sync.set(sync_data, function() {
          loaded();
        });
      });
    }, 0);
  }

  var toggle_code = function(domain, kind, code, remove = false) {
    loading();

    setTimeout(function() {
      chrome.storage.sync.get('options', function(sync_data) {
        if(remove) {
          delete sync_data['options']['disabled'][domain][kind][code];
        } else {
          if(sync_data['options']['disabled'][domain][kind][code]) {
            sync_data['options']['disabled'][domain][kind][code] = false;
          } else {
            sync_data['options']['disabled'][domain][kind][code] = true;
          }
        }

        chrome.storage.sync.set(sync_data, function() {
          loaded();
        });
      });
    }, 0);
  };

  var filter_cards = function() {
    setTimeout(function() {
      $('.nothing-found').hide();

      var search = $('#filter-domains').val();
      var regex = new RegExp(search, 'i');
      var some_card = false;

      $('.domain-card').each(function(_i, card) {
        if(regex.test($(card).data('domain'))) {
          some_card = true;
          $(card).show();
        } else {
          $(card).hide();
        }
      });

      if(some_card) {
        $('.nothing-found').hide();
      } else {
        $('.nothing-found').show();
      }
    }, 0);
  };

  load_template('html/settings/templates/blocks/search.html', function(template) {
    $('.search').html(
      Mustache.render(template, {
        placeholder_filter: chrome.i18n.getMessage('settingsSearchByDomainPlaceHolderText')
      })
    );

    $('#filter-domains').keydown(function() {
      filter_cards();
    });
  });

  var load_blocks = function() {
    chrome.storage.sync.get('options', function(sync_data) {
      load_template('html/settings/templates/blocks/codes.html', function(template) {
        $('.blocks').html('');

        for(domain in sync_data['options']['disabled']) {

          var blocks = [];

          for(kind in sync_data['options']['disabled'][domain]) {
            var codes = [];

            for(code in sync_data['options']['disabled'][domain][kind]) {
              var disabled = sync_data['options']['disabled'][domain][kind][code];

              codes.push({
                code: code,
                disabled: disabled,
                badge: (disabled ? chrome.i18n.getMessage('blockedText') : chrome.i18n.getMessage('allowedText'))
              });
            }

            var sort_by_code = function(a, b) {
              return (a.code.toLowerCase() > b.code.toLowerCase()) ? 1 : ((b.code.toLowerCase() > a.code.toLowerCase()) ? -1 : 0);
            };

            codes.sort(sort_by_code);

            var half = Math.ceil(codes.length / 2)

            var codes_a = codes.slice(0, half);
            var codes_b = codes.slice(half, codes.length);

            blocks.push({
              kind: kind,
              codes_a: codes_a,
              codes_b: codes_b
            });
          }

          $('.blocks').append(
            Mustache.render(template, {
              domain: domain,
              blocks: blocks,
              placeholder_kind: 'handleEvent',
              placeholder_code: 'mousemove'
            })
          );
        }

        $('.locale').each(function() {
          $(this).html(chrome.i18n.getMessage($(this).data('locale')));
        });

        $('.add-code').submit(function(event) {
          event.preventDefault();

          var domain = $(this).data('domain');
          var kind = $(this).find('.input-kind').val();
          var code = $(this).find('.input-code').val();

          if(
            kind == 'WebAPIs' || kind == 'addEventListener' || kind == 'handleEvent'
          ) {
            if(code) {
              add_code(domain, kind, code);
            } else {
              alert(chrome.i18n.getMessage('settingsInvalidCodeMessage'));
            }
          } else {
            alert(chrome.i18n.getMessage('settingsInvalidKindMessage'));
          }
        });

        $('.toggle-code, .remove-code').click(function(event) {
          event.preventDefault();

          if(
            !$(this).hasClass('remove-code')
            ||
            confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))
          ) {
            toggle_code(
              $(this).data('domain'),
              $(this).data('kind'),
              $(this).data('code'),
              $(this).hasClass('remove-code')
            );
          }
        });

        filter_cards();

        loaded();
      });
    });
  }

  load_blocks();

  chrome.storage.onChanged.addListener(function(_changes, namespace) {
    if(namespace == 'sync') {
      loading(function() {
        load_blocks();
      });
    }
  });

  $('#clear').click(function() {
    if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
      loading(function() {
        load_template('html/settings/templates/stored-data/empty.html', function(template) {
          $('.blocks').html(
            Mustache.render(
              template, { text: chrome.i18n.getMessage('settingsStorageEmptyText') }
            )
          );

          chrome.storage.sync.clear(function() {
            chrome.runtime.sendMessage({ action: 'set_default_settings' });
          });
        });
      });
    }
  });

});
