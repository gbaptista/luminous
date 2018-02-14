var apply_settings_for_domain = function(settings, domain) {
  if(!settings['disabled_' + domain]) {
    settings['disabled_' + domain] = {};
  }

  var kinds = [];

  for(possible_kind in settings) {
    var regex = /^default_disabled_/;
    if(regex.test(possible_kind)) {
      kinds.push(possible_kind.replace(regex, ''));
    }
  }

  // Apply default rules
  for(i in kinds) {
    var kind = kinds[i];

    if(!settings['disabled_' + domain][kind]) {
      settings['disabled_' + domain][kind] = {};
    }

    for(code in settings['default_disabled_' + kind]) {
      if(settings['disabled_' + domain][kind][code] == undefined) {
        if(settings['default_disabled_' + kind][code]) {
          settings['disabled_' + domain][kind][code] = settings['default_disabled_' + kind][code];
        }
      }
    }
  }

  return settings;
}
