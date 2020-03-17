define([
  'service', 'jquery'
], function (service, $) {
  var name = 'front-end-complete-book';
  function showMsg() {
    $('body').css('background', 'gray');
    console.log(service.formatMsg() + ', from:' + name);
  }
  return {showMsg}
})
