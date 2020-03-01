$(document).ready(function() {

  var filter_codes = function() {
    setTimeout(function() {
      var search = $('#filter-domains').val();
      var regex = new RegExp(search, 'i');

      $('.item-code').each(function(_i, code) {
        if(regex.test($(code).data('code'))) {
          $(code).show();
        } else {
          $(code).attr('style', 'display:none!important;');
        }
      });

      $('.card-codes').each(function(_i, card) {
        if(
          $(card).find('.item-code:visible').length > 0
          ||
          $(card).find('.no-rules-empty').length == 1
        ) {
          $(card).find('.no-rules-search').hide();
        } else {
          $(card).find('.no-rules-search').show();
        }
      });
    }, 0);
  };

  load_template('html/settings/templates/rules/search.html', function(template) {
    $('.search').html(
      Mustache.render(template, {
        title: chrome.i18n.getMessage('settingsFilterRulesText'),
        placeholder_filter: chrome.i18n.getMessage('settingsSearchByCodePlaceHolderText')
      })
    );

    $('#filter-domains').keydown(function() {
      filter_codes();
    });
  });

  var load_rules = function() {
    chrome.storage.sync.get(null, function(sync_data) {
      load_template('html/settings/templates/rules/codes.html', function(template) {
        var rules = [];

        var kinds = ['WebAPIs', 'handleEvent', 'addEventListener'];

        for(i in kinds) {
          var kind = kinds[i];
          var codes = [];

          for(code in sync_data['default_disabled_' + kind]) {
            var disabled = sync_data['default_disabled_' + kind][code];

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

          rules.push({
            kind: kind,
            codes_a: codes_a,
            codes_b: codes_b
          });
        }

        $('.rules').html(
          Mustache.render(template, {
            domain: chrome.i18n.getMessage('settingsBlockDefaultRuleText'),
            rules: rules,
            no_rules_found: chrome.i18n.getMessage('settingsNoRulesFoundText'),
            placeholder_kind: 'handleEvent',
            placeholder_code: 'mousemove',
            default: true
          })
        );

        apply_locales();

        $('.add-code').submit(function(event) {
          event.preventDefault();

          var domain = $(this).data('domain');
          var kind = $(this).find('.input-kind').val();
          var code = $(this).find('.input-code').val();

          if(
            kind == 'WebAPIs' || kind == 'addEventListener' || kind == 'handleEvent'
          ) {
            if(code) {
              $('#filter-domains').val('');
              $(this).find('.input-kind').val('');
              $(this).find('.input-code').val('');
              add_code(domain, kind, code, true);
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
              $(this).hasClass('remove-code'),
              true
            );
          }
        });

        filter_codes();

        loaded();
      });
    });
  }

  load_rules();

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(namespace == 'sync' && changes) {
      loading(function() {
        load_rules();
      });
    }
  });

});
