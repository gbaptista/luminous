if(Navigator.prototype.getBattery) {
  var original_Navigator_getBattery = Navigator.prototype.getBattery;

  Navigator.prototype.getBattery = function() {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      original_Navigator_getBattery.call(super_this);
    } else {
      var details = { target: super_this, code: {} };

      if(!is_allowed('WebAPIs', 'getBattery')) {
        increment_counter('WebAPIs', 'getBattery', 'blocked', details);

        return new Promise(function(_resolve, _reject) {});
      } else {
        var timer = performance.now();

        var execution_return = original_Navigator_getBattery.call(super_this);

        increment_counter(
          'WebAPIs', 'getBattery', 'allowed', details,
          performance.now() - timer
        );

        return execution_return;
      }
    }
  }
}
