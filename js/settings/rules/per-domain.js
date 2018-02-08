$(document).ready(function() {

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

  load_template('html/settings/templates/rules/form.html', function(template) {
    $('.form').html(
      Mustache.render(template, {
        placeholder: chrome.i18n.getMessage('settingsNewDomainPlaceHolderText')
      })
    );

    $('#new-domain-form').submit(function() {
      event.preventDefault();

      loading(function() {
        var new_domain = 'https://' + $('#new-domain').val().toLowerCase().replace(
          /.*:\/\//, ''
        ).replace(/\s/g, '');

        var a_element = document.createElement('a');
        a_element.href = new_domain;

        if(a_element.hostname && a_element.hostname != window.location.hostname) {
          $('#filter-domains').val('');
          set_sync_option(a_element.hostname, {}, 'disabled');
          $('#new-domain').val('');
        } else {
          alert(chrome.i18n.getMessage('settingsInvalidDomainMessage'));
          loaded();
        }
      });
    });
  });

  load_template('html/settings/templates/rules/search.html', function(template) {
    $('.search').html(
      Mustache.render(template, {
        title: chrome.i18n.getMessage('settingsFilterWebsitesText'),
        placeholder_filter: chrome.i18n.getMessage('settingsSearchByDomainPlaceHolderText')
      })
    );

    $('#filter-domains').keydown(function() {
      filter_cards();
    });
  });

  var load_rules = function() {
    chrome.storage.sync.get(null, function(sync_data) {
      load_template('html/settings/templates/rules/codes.html', function(template) {
        $('.rules').html('');

        for(domain in sync_data) {
          if(/^disabled_/.test(domain)) {
            domain = domain.replace(/^disabled_/, '');

            var rules = [];

            for(kind in sync_data['disabled_' + domain]) {
              var codes = [];

              for(code in sync_data['disabled_' + domain][kind]) {
                var disabled = sync_data['disabled_' + domain][kind][code];

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

            $('.rules').append(
              Mustache.render(template, {
                domain: domain,
                rules: rules,
                no_rules_found: chrome.i18n.getMessage('settingsNoRulesFoundText'),
                placeholder_kind: 'handleEvent',
                placeholder_code: 'mousemove'
              })
            );
          }
        }

        $('.locale').each(function() {
          $(this).html(chrome.i18n.getMessage($(this).data('locale')));
        });

        $('.remove-domain-rules').click(function() {
          var domain = $(this).data('domain');
          if(confirm(chrome.i18n.getMessage('settingsConfirmWindowText'))) {
            loading(function() {
              remove_sync_option('disabled_' + domain);
            });
          }
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

  load_rules();

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(namespace == 'sync' && changes) {
      loading(function() {
        load_rules();
      });
    }
  });

});
