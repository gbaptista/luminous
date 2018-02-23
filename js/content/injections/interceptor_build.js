injections_controller(function() {

 /*
  * Disclaimer for reviewers:
  *
  * The non-minified version for the code below is available at:
  * https://github.com/gbaptista/luminous/blob/0.0.18/js/content/interceptor.js
  *
  * This version was generated with the uglifyjs project
  * from the following command:
  * > uglifyjs -c -m -- js/content/interceptor.js
  *
  * This was done for performance reasons.
  */
  var content = 'UGLIFYJS_RESULT';

  var javascript_injection = document.createElement('script');
  javascript_injection.type = 'text/javascript';
  javascript_injection.setAttribute('nonce', '3b34aae43a');
  javascript_injection.innerHTML = content;
  document.documentElement.insertBefore(javascript_injection, document.documentElement.firstChild);

});
