define(function (require, exports, module) {
  var service = require("service");
  var $ = require("jquery");
  var name = 'front-end-complete-book';

  function showMsg() {
    $('body').css('background', 'gray');
    console.log(service.formatMsg() + ', from:' + name);
  }
  exports.showMsg = showMsg;
})
