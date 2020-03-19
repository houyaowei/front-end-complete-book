define(function (require, exports, module) {
  var msg = 'this is service module';

  function formatMsg() {
    return msg.toUpperCase()
  };
  exports.formatMsg = formatMsg;
})