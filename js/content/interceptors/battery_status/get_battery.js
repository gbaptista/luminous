if(Navigator.prototype.getBattery) {
  var original_Navigator_getBattery = Navigator.prototype.getBattery;

  Navigator.prototype.getBattery = function() {
    var super_this = this;

    if(get_options()['injection_disabled']) {
      original_Navigator_getBattery.call(super_this);
    } else {
      if(!is_allowed('WebAPIs', 'getBattery')) {
        increment_counter(
          'WebAPIs', 'getBattery', false, super_this, undefined, 0
        );

        return new Promise(function(_resolve, _reject) {});
      } else {
        var timer = performance.now();

        var execution_return = original_Navigator_getBattery.call(super_this);

        increment_counter(
          'WebAPIs', 'getBattery', true, super_this, undefined,
          performance.now() - timer
        );

        return execution_return;
      }
    }
  }
}
