#### 第六章  前端展望

前端的发展日新月异，就像在前端里流行的一句话"每三个月都会有新的轮子出现"，发展速度可见一斑，有些技术经得起时间的检验而日益强大，有些呢，慢慢地消失在人们的视线中、或许能留下一点痕迹。PWA,微前端，Serverless, webassembly，flutter，BFF...., 很多已不再年轻，却值得慢慢琢磨。

本章中，笔者主要结合这几年前端的发展中的几个技术点做详细的介绍，结合具体场景来阐述各技术的核心，本章重要包含以下内容：

1、已天气为例实践PWA应用

2、以single-spa为核心进行微前端实践

3、怎么用webAssembly提高前端性能

4、前端该怎么和docker融合



##### 6.1 PWA实践

PWA,全称为Progressive Web App,2016年由Google提出，主旨在于增强web体验，堪成"下一代web应用模型"，自从2015年初次发布后，从国外的公司Google，Twitter, Facebook, Instagram, Uber,Flipboard,Wikipedia到国内的AliExpress, 饿了么，微博，飞猪旅行都已经发布了相关的应用。

> 国内pwa应用可以访问 https://pwapp.net/ ，这里汇集了一批好的应用。

PWA为web应用开发提供一种完全离线的能力，提供瞬间加载的体验。现在虽然移动设备已经变得愈发强大，但是移动网络能力不是总能让我们满意，这时才能感知到移动连接有时就是那么脆弱，所以在今天人们普遍期望24小时在线的情况下，离线能力应该是很多应用需要考虑的，原生应用已经能提供更好的整体用户体验，只要下载完就可以立即下载，即使是在没有网络连接到情况下，也并不是完全不可用，因为设备上已经存储了大部分资源。

普通的web应用无法提供像原生应用那么强大的功能，如离线缓存，瞬时加载、高可靠性。即使HTTP提供了缓存的内里，但是要真正做到强缓存还是很多的局限性，使用HTTP缓存就意味着依赖服务器来告诉浏览器该如何缓存资源、资源什么时候到期，并且对于相关性的资源也无法做到同步。

各大浏览器对PWA的支持已经比较完善，Chrome、Firefox，Opera，Edge,Safari都已经完全支持。更详细的支持情况请参考https://jakearchibald.github.io/isserviceworkerready/

| Chrome | Firefox | Opera | Edge | Safari | IOS Safari |
| ------ | ------- | ----- | ---- | ------ | ---------- |
| 45+    | 44+     | 32+   | 17+  | 11.1+  | 11.3+      |

下面我们详细下介绍下PWA到底是什么样子的。

PWA主要由web app manifest, service worker和notification组成。Web app manifest文件是一个简单的JSON文件，在该文件中说明应用的都相关信息，如应用名称，作者、icon、描述、启动文件等,形式如下面的配置：

```json
{
    "name": "weather PWA",
    "short_name": "weather",
    "description": "show some places weather",
    "icons": [
        {
            "src": "./favicon.ico",
            "sizes": "16x16",
            "type": "image/png"
        }
    ],
    "start_url": "./index.html",
    "display": "fullscreen",
    "theme_color": "#B12A34",
    "background_color": "#B12A34"
}
```

对上面的配置做下简要的解释：

- name : 提示用户安装应用时的描述

- Short_name : 描述应用安装在主屏幕上显示的内容

- Description: 应用描述

- Icons: web应用添加到主屏幕上时显示的图标

- start_url: 应用启动时加载的入口文件

- Display: 指定应用如何展示。

- Theme_color: 指定对浏览器地址栏的着色。

- orientation: 定义所有Web应用程序顶级的默认方向

  

  PWA的的核心是Service worker(以下简称sw), 关于sw已在第五章有了初步介绍。在本小节中，我们将进行详细的介绍。sw只是在后台运行的worker脚本，给开发者提供一个全局控制网络请求的机会，为其他场景应用开辟了可能性，比如说实现一个简单的mock Server。

  尽管sw是由javascript实现，但是运行方式和标准的JavaScript稍有不同，具体的不同点有：

  1、运行在自己都全局上下文中，不会被阻塞。

  2、独立于当前网页，并且不能修改网页中的元素，但是可以通过postMessage可以与其他。

  3、部署sw服务，需要https支持。

  4、sw是一个可编程的网络代理，允许控制某一服务下的所有请求。

  5、sw是完全异步的，不能使用localstorage之类的功能。

  

  上面我们了解下sw有哪些特点，下面看看它的生命周期，sw有一套独立于web页面的声明周期。

  ![sw-01](./images/sw-01.png)

  在注册sw前，需要检查浏览器是否支持。如果支持，就使用navigator.serviceWorker.register函数注册。

  ```js
  // Registering Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
  ```

  当调用register函数时，会通知浏览器下载sw文件并解析、运行sw，如果注册失败，该函数返回的Promise都会执行reject方法。

  ```js
  navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered!', reg))
  .catch(err => console.log('Sorry,error occured', err));
  ```

  只要sw注册成功，install事件就会激活。

  ```js
  self.addEventListener("install", function (e) {
   //具体逻辑
  });
  ```

  安装完成后，sw回被激活，并开始控制范围内的所有页面。不过第一次在页面注册 sw 时不会控制页面，直到它再次加载。一旦 sw再生效,它会处于两种状态之一：一种终止sw来节省内存，另一种发起请求，处理请求获取和消息事件。

  ![sw-02](./images/sw-02.png)

  上面我们介绍了sw的安装过程，那么sw是如何更新的呢？

  1、更新sw的JavaScript 文件
      用户浏览系统时，浏览器尝试在后台重新下载 sw 的脚本文件。经过对比，只要服务器上的文件和本地文件有不同，这个文件就认为是新的。

  2、更新sw脚本文件、启动并触发 install 事件。

  3、这时，当前系统生效的依然是老版本的 sw，新的sw处于 “waiting” 状态。

  4、当页面关闭之后，老的sw会被清掉，新的将接管页面。

  5、一旦新的sw生效，会触发 activate 事件。

  

  有了上面的理论，接下来，我们将以一个天气预报的例子来系统梳理下一个简单PWA应用的开发过程。



