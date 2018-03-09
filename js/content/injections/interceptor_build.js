injections_controller(function() {

 /*
  * Note for reviewers:
  *
  * The non-minified version for the code below is available at:
  *
  * - https://github.com/gbaptista/luminous/blob/0.0.24/js/content/interceptor.js
  * - https://github.com/gbaptista/luminous/blob/0.0.24/js/content/interceptors/
  *
  */
  var content = 'UGLIFYJS_RESULT';

  console.log(document.getElementById('luminous-options'));

  var javascript_injection = document.createElement('script');
  javascript_injection.type = 'text/javascript';
  javascript_injection.setAttribute('nonce', '3b34aae43a');
  javascript_injection.innerHTML = content;
  document.documentElement.insertBefore(
    javascript_injection,
    (
      document.getElementById('luminous-options')
      ||
      document.documentElement.firstChild
    )
  );

});
