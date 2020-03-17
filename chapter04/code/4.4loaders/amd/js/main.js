(function () {
  //配置
  requirejs.config({
    //基础路径
    baseUrl: "js/",
    //模块标与模块路径映射
    paths: {
      "message": "modules/message",
      "service": "modules/service",
      "jquery": "libs/jquery-3.4.1"
    }
  })

  //引入使用模块
  requirejs(['message'], function (msg) {
    msg.showMsg()
  })
})()