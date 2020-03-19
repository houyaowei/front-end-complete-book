(function () {
  //配置
  requirejs.config({
    //基础路径
    baseUrl: "js/",
    //模块声明与路径映射
    paths: {
      "message": "modules/message",
      "service": "modules/service",
      "jquery": "libs/jquery-3.4.1"
    }
  })

  //加载模块
  requirejs(['message'], function (msg) {
    msg.showMsg()
  })
})()