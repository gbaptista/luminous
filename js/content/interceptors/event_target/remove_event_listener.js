var removeEventListener_alias = {};

var original_EventTarget_removeEventListener = EventTarget.prototype.removeEventListener;

EventTarget.prototype.removeEventListener = function(type, listener, options) {
  var super_this = this;

  var value_to_return_a = original_EventTarget_removeEventListener.call(
    super_this, type, listener, options
  );

  if(removeEventListener_alias[type] && removeEventListener_alias[type][listener]) {
    var value_to_return_b = original_EventTarget_removeEventListener.call(
      super_this, type, removeEventListener_alias[type][listener], options
    );

    return value_to_return_a || value_to_return_b;
  } else {
    return value_to_return_a;
  }
};
