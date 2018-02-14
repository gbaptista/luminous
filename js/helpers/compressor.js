var compressor_map = { addEventListener: 'a', handleEvent: 'h', WebAPIs: 'w' }

var compressor_map_i = 0;

for(i in common_webapis) {
  compressor_map['WebAPIs' + '_' + common_webapis[i]] = compressor_map_i.toString();
  compressor_map_i += 1;
}

for(i in common_events) {
  compressor_map['addEventListener' + '_' + common_events[i]] = compressor_map_i.toString();
  compressor_map_i += 1;

  compressor_map['handleEvent' + '_' + common_events[i]] = compressor_map_i.toString();
  compressor_map_i += 1;
}

var compress_settings = function(settings) {
  // Cleanup
  for(kind in settings) {
    for(code in settings[kind]) {
      if(!settings[kind][code]) {
        delete settings[kind][code];
      }
    }

    if(!settings[kind] || JSON.stringify(settings[kind]) == '{}') {
      delete settings[kind];
    }
  }

  var compressed = [];

  for(kind in settings) {
    for(code in settings[kind]) {
      if(compressor_map[kind + '_' + code]) {
        compressed.push(compressor_map[kind + '_' + code]);
      } else {
        compressed.push(compressor_map[kind] + '-' + code);
      }
    }
  }

  return compressed.join(':');
}

var uncompress_setting = function(setting_code) {
  var setting = undefined;
  for(code in compressor_map) {
    if(compressor_map[code] == setting_code) {
      setting = code;
    }
  }

  if(!setting) {
    var original_kind = setting_code.slice(0, 1);
    var original_code = setting_code.slice(2);

    for(code in compressor_map) {
      if(compressor_map[code] == original_kind) {
        original_kind = code;
      }
    }

    setting = original_kind + '_' + original_code;
  }

  var kind = setting.split('_')[0];
  var code = setting.slice(kind.length + 1);

  return { kind: kind, code: code };
}

var uncompress_settings = function(compressed_settings) {
  if(!compressed_settings) {
    return {};
  } else {
    compressed_settings = compressed_settings.split(':');

    var hash_settings = [];

    for(i in compressed_settings) {
      hash_settings.push(uncompress_setting(compressed_settings[i]));
    }

    var settings = {};

    for(i in hash_settings) {
      var setting = hash_settings[i];
      if(!settings[setting.kind]) {
        settings[setting.kind] = {};
      }

      settings[setting.kind][setting.code] = true;
    }

    return settings;
  }
}
