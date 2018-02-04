var add_code = function(domain, kind, code, is_default) {
  loading();

  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      if(is_default) {
        if(!sync_data['options']['default_disabled'][kind]) {
          sync_data['options']['default_disabled'][kind] = {};
        }

        if(!sync_data['options']['default_disabled'][kind][code]) {
          sync_data['options']['default_disabled'][kind][code] = false;
        }
      } else {
        if(!sync_data['options']['disabled'][domain][kind]) {
          sync_data['options']['disabled'][domain][kind] = {};
        }

        if(!sync_data['options']['disabled'][domain][kind][code]) {
          sync_data['options']['disabled'][domain][kind][code] = false;
        }
      }

      chrome.storage.sync.set(sync_data, function() {
        loaded();
      });
    });
  }, 0);
}

var toggle_code = function(domain, kind, code, remove, is_default) {
  loading();

  setTimeout(function() {
    chrome.storage.sync.get('options', function(sync_data) {
      if(is_default) {
        if(remove) {
          delete sync_data['options']['default_disabled'][kind][code];
        } else {
          if(sync_data['options']['default_disabled'][kind][code]) {
            sync_data['options']['default_disabled'][kind][code] = false;
          } else {
            sync_data['options']['default_disabled'][kind][code] = true;
          }
        }
      } else {
        if(remove) {
          delete sync_data['options']['disabled'][domain][kind][code];
        } else {
          if(sync_data['options']['disabled'][domain][kind][code]) {
            sync_data['options']['disabled'][domain][kind][code] = false;
          } else {
            sync_data['options']['disabled'][domain][kind][code] = true;
          }
        }
      }

      chrome.storage.sync.set(sync_data, function() {
        loaded();
      });
    });
  }, 0);
};
