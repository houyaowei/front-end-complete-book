define(function () {
  var msg = 'this is service module';
  function formatMsg() {
    return msg.toUpperCase()
  };
  return {formatMsg}
})