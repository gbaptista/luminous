var load_interceptor_element = function(from, callback_function) {

 /*
  * Note for reviewers:
  *
  * The non-minified version for the code below is available at:
  *
  * - https://github.com/gbaptista/luminous/blob/0.0.25/js/content/interceptor.js
  * - https://github.com/gbaptista/luminous/blob/0.0.25/js/content/interceptors/
  *
  */
  var content = 'UGLIFYJS_RESULT';

  var javascript_injection = document.createElement('script');
  javascript_injection.id = 'luminous-interceptor';
  javascript_injection.setAttribute('class', 'luminous-interceptor');
  javascript_injection.type = 'text/javascript';
  javascript_injection.setAttribute('nonce', '3b34aae43a');
  javascript_injection.setAttribute('data-from', from);
  javascript_injection.innerHTML = content;

  callback_function(javascript_injection);

};
