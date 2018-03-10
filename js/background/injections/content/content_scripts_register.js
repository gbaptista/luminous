var update_content_script_settings = function() {
  // contentScripts.register not available
}

// Why?
// if(typeof browser !== 'undefined' && browser.contentScripts) {
//   var registered_content_scripts = [];
//
//   async function register_content_script(data, i) {
//     registered_content_scripts[i] = await browser.contentScripts.register({
//       runAt: 'document_start',
//       matches: ['<all_urls>'],
//       allFrames: true,
//       js: [{
//         code: "var luminous_settings = JSON.parse('" + JSON.stringify(data) + "'); intialize_luminous_injections('content_scripts_register');"
//       }]
//     });
//   }
//
//   update_content_script_settings = function(data) {
//     var pending = false;
//     for(i in registered_content_scripts) {
//
//       if(!registered_content_scripts[i]) {
//         pending = true;
//       } else if(registered_content_scripts[i] != 'unregistered') {
//         registered_content_scripts[i].unregister();
//         registered_content_scripts[i] = 'unregistered';
//       }
//     }
//
//     if(!pending) {
//       registered_content_scripts = [];
//     }
//
//     registered_content_scripts.push(null);
//
//     register_content_script(data, registered_content_scripts.length - 1);
//   }
// }
