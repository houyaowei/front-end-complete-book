

#### 第6章  实践：从0开发微前端和WebAssembly

前端的发展日新月异，因此在前端圈里流行这样一句话，“每三个月就会有新的轮子出现”，前端的发展速度可见一斑。有些技术经得起时间的检验而日益强大，而有些技术则慢慢地消失在人们的视线中，或许能留下一点痕迹，如PWA、微前端、Serverless、 WebAssembly、Flutter、BFF，等等，很多技术已不再年轻，却值得慢慢琢磨。

在本章中，笔者对近几年前端发展中的几个技术做详细的介绍，并结合具体场景阐述各技术的核心。本章主要包含以下内容：

   (1)  以天气为例实践PWA应用。

（2）以single-spa为核心进行微前端实践。

（3）在Docker中部署前端应用。

（4）讲解如何用webAssembly提高前端性能。



##### 6.1 从0开发PWA实践

PWA（Progressive Web App）于2015年由设计师弗朗西斯·贝里曼和Google Chrome的工程师亚历克斯·罗素提出，主旨在于增强Web体验，堪称“下一代Web应用模型”。自从初次发布后，从Google、Twitter、 Facebook、Instagram、Uber、Flipboard、维基百科到国内的AliExpress、饿了么、新浪微博、飞猪旅行都已经发布了相关的应用。

> 国内pwa应用可以访问 https://pwapp.net/ ，这里汇集了一批好的应用。

PWA为Web应用开发提供了一种完全离线的能力，提供瞬间加载的体验。虽然移动设备已经变得愈发强大，但是移动网络并不总是让我们满意。在今天人们普遍期望能24小时在线的情况下，离线能力是许多应用需要考虑的。原生应用可以提供更好的整体用户体验，只要下载完就可以立即下载，即使在没有网络连接的情况下，也并不是完全不可用，因为设备上已经存储了大部分资源。

普通的Web应用无法提供像原生应用那么强大的功能，如离线缓存、瞬时加载、高可靠性等。即使HTTP提供了缓存的内里，但是想要真正做到强缓存仍有很多的局限性。例如，想要使用HTTP缓存就意味着需要依赖服务器来告诉浏览器该如何缓存资源、资源什么时候到期，并且对于相关性的资源无法做到同步。

各大浏览器对PWA的支持已经比较完善，Chrome、Firefox、Opera、Edge和Safari都已经完全支持PWA。

| Chrome | Firefox | Opera | Edge | Safari | IOS Safari |
| ------ | ------- | ----- | ---- | ------ | ---------- |
| 45+    | 44+     | 32+   | 17+  | 11.1+  | 11.3+      |

下面详细介绍PWA是什么样子的。

PWA主要由web app manifest、service worker和notification组成。Web app manifest是一个简单的JSON文件，该文件中存放的是应用的相关信息，如应用名称、作者、icon、描述、启动文件等，配置如下。

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

- name：提示用户安装应用时的描述

- Short_name：描述应用安装在主屏幕上显示的内容

- Description：应用描述

- Icons： web应用添加到主屏幕上时显示的图标

- start_url： 应用启动时加载的入口文件

- Display： 指定应用如何展示。

- Theme_color：指定对浏览器地址栏的着色。

- orientation：定义所有Web应用程序顶级的默认方向

  

    PWA的核心是service worker（以下简称sw）。sw是在后台运行的worker脚本，给开发者提供一个全局控制网络请求的机会，为其他场景应用开辟了可能性。比如，实现一个简单的mock Server。

    尽管sw是由JavaScript实现的，但是sw的运行方式和标准的JavaScript相比，稍有不同，具体如下。

  - 运行在自己的全局上下文中，不会被阻塞。

  - 独立于当前网页，并且不能修改网页中的元素，但是可以通过postMessage通信。

  - 部署sw服务，需要HTTPS支持。

  - sw是一个可编程的网络代理，允许控制某一服务下的所有请求。

  - sw是完全异步的，不能使用localstorage之类的功能。

  

  下面看看sw的生命周期，sw有一套独立于Web页面的声明周期，如图6-1所示。

  ![sw-01](./images/sw-01.png)

  <center>图6-1</center>

  在注册sw前，需要检查浏览器是否支持。如果支持，就使用register函数注册。
  
  ```js
  // Registering Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
  ```

    当调用register函数时，会通知浏览器下载sw文件并解析、运行sw。如果注册失败，则该函数返回的Promise会执行reject方法。
  
  ```js
  navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered!', reg))
  .catch(err => console.log('Sorry,error occured', err));
  ```

  只要sw注册成功，install事件就会被激活。
  
  ```js
  self.addEventListener("install", function (e) {
   //具体逻辑
  });
  ```

    安装完成后，sw会被激活，并开始控制范围内的所有页面。注意，第一次注册 sw 时是不会控制页面的，直到它被再次加载。一旦 sw再次生效，它会处于两种状态之一：一种是终止sw，以节省内存；另一种是发起请求，并处理请求获取和消息事件，如图6-2所示。

  ![sw-02](./images/sw-02.png)

  <center>图6-2</center>
  
  前面我们介绍了sw的安装过程，那么sw是如何更新的呢？
  
  （1）更新sw的JavaScript 文件。 用户浏览系统时，浏览器会尝试在后台重新下载 sw 的脚本文件并进行对比，只要服务器上的文件和本地文件不同，这个文件就被认为是新的。
  
  （2）更新sw脚本文件，启动并触发 install 事件。这时，在当前系统上生效的依然是老版本的 sw，新版本的sw处于“waiting”状态。
  
  （3）在页面关闭之后，老版本的sw会被清掉，新版本的sw将接管页面。一旦新的sw生效，就会触发 activate 事件。
  
  
  
  接下来我们通过一个天气预报的例子系统梳理一个简单的PWA应用的开发过程。在开始之前，需要准备三样东西。
  
  （1）UI 外壳 。用户界面所需要的最小化的HTML、CSS和JavaScript文件，详细的请参考源代码部分。AJAX请求为了简单起见，借用下fetch库。
  
  
  
  （2）城市代码。中国气象局提供了一组API，可查询各城市、自治区、直辖市的代码。具体方法是，首先使用http://www.weather.com.cn/data/city3jdata/china.html查询省会的代码，然后根据某一省会代码，比如陕西省省会的的代码是10111，调用接口
  
  http://www.weather.com.cn/data/city3jdata/provshi/10111.html 获取城市列表。以西安为例，西安市的城市代码为1011101（省会代码+城市代码）。如果想进一步获取西安下属各区的代码，则可以调用接口http://www.weather.com.cn/data/city3jdata/station/1011101.html，最终的城市代码由西安市代码和某区代码联合组成。
  
  
  
  （3）天气接口。这里使用易客云提供的免费的天气API接口，前提是需要注册一个账号。登录控制台获取APPID和APPSecret，这两项配置需要在查询天气的URL中指定。

现在我们先看下要实现一个什么样的功能，该页面的功能比较简单，在选择框中选择相应的城市，通过易客云提供的API查询所选城市近7天的天气情况，单击“发送通知”按钮发送通知，界面如图6-3所示。

![sw-04](./images/sw-04.png)

<center>图6-3</center>

首先通过中国气象局提供的API，查询几个城市的城市代码，如西安 （101110101）、上海（101020100）、杭州（101210101）等，构造下拉框。

```html
<section >
  <label>请选择城市：</label>
  <select id="city">
    <option value="101110101">西安</option>
    <option value="101020100">上海</option>
    <option value="101210101">杭州</option>
  </select>
  <button id="notifications">发送通知</button>
 </section>
```

工程的目录结构如图6-4所示。

![sw-05](./images/sw-05.png)

<center>图6-4</center>

在项目开始之前，我们需要配置一下manifest文件、.js入口文件和.html文件。首先，创建weather.manifest文件并输入以下内容。注意，这里对文件名并无要求，也就是说，可以不以manifest为结尾。

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

其次，在index.html 的header中加入如下内容，使manifest文件生效。

```js
<link rel="manifest" href="./weather.manifest" />
```

在该例中，业务部分的入口文件是app.js，主要用来实现业务逻辑、注册sw和发送通知等。

项目启动后自动注册sw。

```js
// Registering Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(res => {
      console.log('Registration succeeded. Scope is ' + res.scope);
  });
}
```

这里面需要特别注意 sw文件的路径问题。在这个例子中，sw文件被放在这个域的根目录下，这意味着 	Service Worker是与网站同源的。也就是说，这个Service Worker只会拦截这个域下的所有fetch 事件。比如，Service Worker文件被注册到/example/sw.js，那么Service Worker只能收到 /example/ 路径下的 fetch 事件，这时就需要在注册sw文件时指定scope属性。

```js
navigator.serviceWorker.register('/example/sw.js', { scope: '/example/' })
```

在sw中，指定文件缓存版本号和需要缓存的文件。

```js
var cacheName = "weather-pwa-v1";
var appShellFiles = [
  "./index.html",
  "./app.js",
  "./style.css",
  "./jquery.js",
  "./favicon.ico",
  "./img/bg.png"
];
```

sw文件被注册后，会执行绑定的install事件。install事件一般被用来填充你的浏览器的离线缓存能力。为了实现缓存能力，我们使用sw文件的新的标志性的全局Cache API。 主要有三个API：

open:  打开一个Cache 对象。

match: 返回一个promise对象，resolve的结果是与cache对象中匹配的第一个已经缓存的请求。

addAll: 把指定的文件添加到指定的cache对象。

put：同时抓取一个请求及其响应，并将其添加到给定的cache。

> Cache API： https://developer.mozilla.org/zh-CN/docs/Web/API/Cache

```js
// Installing Service Worker
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log("[Service Worker] Caching all: app shell and content");
      return cache.addAll(appShellFiles);
    })
  );
});
```

事件上接了一个ExtendableEvent.waitUntil()方法，这样做的目的是确保sw文件不会在waitUntil()里面的代码执行完毕之前完成安装。

```js
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      console.log("[Service Worker] Fetching resource: " + e.request.url);
      return (
        r ||
        fetch(e.request).then(function (response) {
          return caches.open(cacheName).then(function (cache) {
            console.log(
              "[Service Worker] Caching new resource: " + e.request.url
            );
            cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
```

在fetch的事件监听器中，先匹配每个请求。如果在cache对象中能匹配到已经缓存的请求，就返回已缓存的内容，否则重新发起请求，并将缓存的结果继续放入cache。

至此，PWA核心部分已经配置完成，现在开始用select框选择地区并查询天气信息。

```js
document.getElementById("city").addEventListener("change", (e) => {
  //天气API
  let url = `https://www.tianqiapi.com/free/weekappid=68134783&appsecret=PblyiX1y&cityid=${e.target.value}`;
fetch(url).then((res) => {
   return res.json()
}).then(res => {
    currentPlace = res;
      document.getElementsByClassName("weather")[0].innerHTML = buildCard(res.data)
   })
});
```

初始化加载页面资源的情况如图6-5所示。

![sw-06](./images/sw-06.png)

<center>图6-5</center>

从资源加载情况来看，文件是从站点加载并进行缓存的。现在刷新页面或者断掉网络进行测试，如图6-6所示。

![sw-07](./images/sw-07.png)

<center>图6-6</center>

从Size列可以看出，这些文件都来自ServiceWorker缓存。在select框中选择“杭州”，看一下数据请求的情况，如图6-7所示。

![sw-08](./images/sw-08.png)

<center>图6-7</center>

数据来自网络，并且数据能够正常返回和展示。下面继续刷新页面或者断掉网络进行测试，如图6-8所示。

![sw-09](./images/sw-09.png)

<center>图6-8</center>

从上图中可以看出，数据来自sw文件，并且能够正确返回。



##### 6.2 基于single-spa的微前端实践

single-spa是由JavaScript实现的微前端框架。这个概念是由ToughtWorks于2016年提出的，微前端和后端的微服务相对，将后端微服务的理念应用于浏览器端，即Web应用由单一的单体应用转变为由多个小型前端应用聚合在一起的应用。各个前端应用可以独立运行、独立开发、独立部署，从而不影响其他模块的开发和部署。 独立部署的能力为构建孤立、松散耦合的服务提供了可能。

在前端的圈子里，各种轮子在不停的飞，美团的Bifrost， 阿里的icestark、qiankun，以及针对angular应用的Mooa,最后就是大名鼎鼎的single-spa。不过很多实践都是基于single-spa进行封装，包括在很多前端社区中能够看到的实现很多也都是基于single-spa的实践，所以我们也以这个实现作为蓝本实现微前端应用的基本骨架。

在介绍single-spa前，先介绍下微前端的实现方式有几种：

1.iframe方式

iframe实现可以让子应用独立开发、部署，然后方便地接入到主应用中，这个方案比较彻底并且用的也最多。但是很多问题去无法避免：页面加载变慢、内部蒙层无法完全覆盖外部页面、双向滚动条的问题、刷新后iframe回到首页的问题......

2.路由分发

路由分发式，即通过路由将不同的业务进行拆分，每个应用独立部署。通常可以通过 HTTP 服务器的反向代理来实现，又或者是应用框架自带的路由来解决。如图6-9所示。

![mf-01](./images/mf-01.png)

<center>图6-9</center>

3.微件化

微件化（Widget）是一段可以直接嵌入应用上运行的代码，它由开发人员预先编译好bundle文件，在主应用启动时直接加载，不用做其他处理。微前端下的微件化是指每个业务线写自己的业务代码，并将编译好的bundle文件部署到指定的服务器上，运行时在特定模块加载相应的代码，如图6-10所示。

![mf-02](./images/mf-02.png)

<center>图6-10</center>

4.Web Components

Web Components主要由以下四部分组成：

- Custom Ellements：开发者可以创建自定义元素。
- Shadow DOM：通常是将Shadow DOM 附加到主文档 DOM 中，并控制其关联的功能。Shadow DOM 为DOM和CSS提供了封装，使得这些东西与主文档的DOM保持分离。
- HTML templates：即 <template> 和 <slot> 元素，用于编写不在页面中显示的标记模板。
- HTML Imports：用于引入自定义组件。

组件拥有自己独立的脚本和样式，以及对应的用于单独部署组件的域名。然而实现过程并不顺利，想要直接使用 Web Components来构建前端应用还有很多困难需要面对：

- 重写现有应用的挑战，实现的工作量约等于重写应用的工作量。
- 生态系统不完善，对第三方组件的支持比较差。
- 系统架构复杂。当应用被拆分为多个组件时，组件间的通信就成了一个大麻烦。
- 不是所有浏览器都支持。例如，对已经习惯掉队的IE浏览器依然不支持，如果应用必须支持IE浏览器，则只能绕行了。

为了能够说清楚single-spa是如何实现微前端的，我们还需要了解以下几个前置条件：

- 高性能通用模块加载器SystemJS：它可以在浏览器中使用各种通用规范，如CommonJS、AMD、CMD、UMD和ESM等。在single-spa中需要使用该加载器对各模块进行动态导入。

- single-spa: 微前端开发框架之一，它支持在少量改造现有应用的基础上提供微前端应用接入的能力。

- Import maps规范： 该规范允许控制js的import语句或者import()表达式导入库，并允许在非导入上下文中重用这个映射。

  ```js
  <script type="importmap">
  {
    "imports": {
      "moment": "****/moment/src/moment.js", 
      "lodash": "****/lodash-es/lodash.js"
    }
  }
  </script>
  ```
  
    需要说明的是，这里配置第三方库的地址既可以是本地文件，也可以是CDN文件。通过上面的方式安装完import map后，就可以使用import方式导入了。

  ```js
  import moment from "moment";
  import _ from "lodash";
  ```
  
    有时候，可能有这样的场景，在模块中可能需要使用某个库的不同版本。在这种情况下，有两种解决办法：（1）在imports中声明两个key值，（2）在import maps 中加入scopes配置。

  ```js
  {
    "imports": {
      "querystringify": "/node_modules/querystringify/index.js"
    },
    "scopes": {
      "/node_modules/socksjs-client/": {
        "querystringify": "/node_modules/socksjs-client/querystringify/index.js"
      }
    }
  }
  ```
  
  **querystringify**映射到**/node_modules/querystringify/index.js**，并且 **/node_modules/socksjs-client/querystringify**映射到**/node_modules/socksjs-client/querystringify/index.js**。从扩展性上看，在scopes上添加配置的方式更加灵活，语义性也更好，因此推荐使用这种方式。

  

    有了上面的基础，是时候揭开single-spa的面纱了。在该实践中会接入React项目、Vue项目、AngularJS项目和Angular项目。需要说明的是，为了项目的快速集成，每个子项目只提供最基础的功能，并且所有子项目和Portal都在同一个工程中，在后续的代码更新中会逐渐完善部署部分、样式隔离部分等内容。

     项目的代码结构如下图所示，React、Vue、Angularjs和Angular项目分别对应app1,app2,app3和app4。有一个baseDep需要说明一下，在前端开发中，我们不总是希望把三方的核心开发包打入到bundle文件中，所以就提供一个公共的工程，在工程启动的时候把三方包写入到Portal的systemjs-importmap中，如图6-11所示。

  ![mf-03](./images/mf-03.png)

  <center>图6-11</center>

  

    在baseDep工程的根目录下新建一个base.js， 先定义需要写入的第三方包，为了区分开发环境和生产环境，需要分别进行定义。

  ```js
  const devLibs = {
    imports: {
      react: "/libs/frameworks/react/react.development.js",
      vue: "https://www.unpkg.com/vue@2.6.10/dist/vue.js",
      "react-dom": "/libs/frameworks/react/react-dom.development.js",
      "single-spa": "/libs/systemjs/single-spa.js"
    }
  };
  const prodLibs = {
    imports: {
      react: "/dist/libs/framework/react/react.production.min.js",
      "react-dom": "/dist/libs/framework/react/react-dom.production.min.js",
      "single-spa": "/dist/libs/single-spa.min.js"
    }
  };
  ```

    定义第三方包后，还需要定义一个方法，它需要有这么一种能力，工程启动动态创建script标签，并把上面的配置写入portal，比如方法名叫作insertNewImportMap ，参数即为上面定义的配置对象。

  ```js
  function insertNewImportMap(mapJson) {
    const scriptObj = document.createElement("script");
    scriptObj.type = "systemjs-importmap";
    scriptObj.innerHTML = JSON.stringify(mapJson);
  
    const allImportMaps = document.querySelectorAll('script[type="systemjs-importmap"]');
    allImportMaps[allImportMaps.length - 1].insertAdjacentElement("afterEnd", scriptObj);
  }
  ```

    接下来就可以写portal部分了，我们先实现一个简单的菜单，点击菜单加载应用，在Portal中，暂时没有提供框架支持，仍需使用history的pushState方法进行路由切换。

  >   single-spa官网提供了一个名为navigateToUrl的方法可以进行路由切换，通过对它的源码进行分析可知，该方法是在history的基础上进行封装的。
  >
  > 
  
  
  
  页面导航部分如图6-12所示。
  
  ![mf-04](./images/mf-04.png)
  
  <center>图6-12</center>
  
  对应的HTML代码如图6-13所示。
  
  ![mf-05](./images/mf-05.png)
  
  <center>图6-13</center>
  
    下面实现一个js跳转的方法，该参数值的作用是在注册子应用时，提供一个检测是否激活某个子应用的方法。如果检测方法返回true，则single-spa会激活该应用并挂载到相应的节点，如果检测方法返回false，则会unmount解除这个应用。我们在后文注册子应用时实现这个方法。
  
  ```js
  function pushToState(target) {
     window.history.pushState({}, "title", target);
  }
  ```
  
    前文曾介绍过，前端的模块开发需要遵循几个规范，最常见的有AMD、CMD、UMD和CommonJS，也更加通用。我们现在想一个问题，有了遵循这些规范开发的模块，我们应该已某种方式加载这种规范的实现。在本书的4.4节中详细地介绍了这4种规范的具体实现，如果有需要可以移步到那里。
  
    在微前端的开发中，官方提供了一个叫作SystemJS的通用模块加载器，可以运行在服务端和浏览器端。有了这个工具就可以注册子应用了，single-spa官网提供了一个名为registerApplication的API可用来注册子应用。
  
  先注册4个应用，并提供活动监测函数，函数实现如下所示。
  
  ```js
  export function prefix(location, ...prefixes) {
    return prefixes.some(prefix => location.href.indexOf(`${location.origin}/${prefix}`) !== -1);;
  }
  export function app1React(location) {
    return prefix(location, "reactApp");
  }
  export function app2Vue(location) {
    return prefix(location, "vueApp");
  }
  export function n1App(location) {
    return prefix(location, "a1App");
  }
  export function n7App(location) {
    return prefix(location, "a7App");
  }
  ```
  
  
  
  注册应用代码。
  
  ```js
  import * as isActive from "./activityFns";
  singleSpa.registerApplication("reactApp", () => SystemJS.import ("@portal/reactApp"), isActive.app1React);
  singleSpa.registerApplication("vueApp", () => SystemJS.import ("@portal/vueApp"), isActive.app2Vue);
  singleSpa.registerApplication("a1App", () => SystemJS.import ("@portal/a1App"), isActive.n1App);
  singleSpa.registerApplication("a7App", () => SystemJS.import ("@portal/a7App"), isActive.n7App);
  ```
  
    调用该API注册后，single-spa会在数组中暂存这些应用，如下面的源码所示，并把应用状态设置成NOT_LOADED。
  
  ```js
  apps.push({
      loadErrorTime: null,
      name: appName,
      loadImpl,
      activeWhen: activityFn,
      status: NOT_LOADED,
      parcels: {},
      devtools: {
        overlays: {
          options: {},
          selectors: [],
        }
      },
      customProps
    });
  ```
  
    接下来调用start方法启动应用，并根据当前URL判断要加载哪些应用。activeWhen保存的是之前定义的应用活动监测函数。
  
  ```js
  //app.helper.js
  export function shouldBeActive(app) {
    try {
      //app表示每个已经注册的应用
      return app.activeWhen(window.location);
    } catch (err) {
      handleAppError(err, app);
      app.status = SKIP_BECAUSE_BROKEN;
    }
  }
  ```
  
    试想，当我们切换应用时，single-spa是以什么样的方式切换的呢？首先，single-spa在路由层做了一层拦截，使用注册全局监听的方式。
  
  > 当然也可以通过window.onhashchange= function(){}的方式订阅。
  
  
  
  ```js
  //navigation-events.js
  window.addEventListener('hashchange', urlReroute);
  window.addEventListener('popstate', urlReroute);
  ```
  
  
  
    hashchange事件监听的是URL中锚点的变化，该变化会导致历史记录栈也发生变化。常见的改变网页锚点变化的方式有以下几种：
  
  - 直接改变浏览器的地址，在后面拼接或者改变 #hash值。
  
  - 通过API修改 location.href或location.hash的值。
  
  - 单击带有锚点的链接。
  
  - 单击浏览器的前进或后退按钮。
  
  
  
    对于pushState，与该API相关的主要有replaceState API和onpopstate事件。pushState是在浏览器的历史记录栈中压入一条新的记录，然后把当前指针就移到这条新的条目上并且激活它，然后改变浏览器的地址。replaceState的用法和pushState一致，只不过它不会在历史记录栈中增加新的条目。onpopstate事件的触发比较有特定：
  
  - 有history.pushState或者history.replaceState的时候不会触发该事件。
  
  - 在history.go、history.back、history.forward调用的时候会触发该事件。
  
  -   有hashchange的时候会触发该事件。
  
  >   注意：在Firefox和Chrome中首次打开页面时不会触发popstate事件，但是在Safari中首次打开页面时会触发popstate事件。

```js
function urlReroute() {
  reroute([], arguments)
}
```

reroute方法是single-spa的核心，这个方法主要有两个作用：（1）如果应用已经启动，就优化需要处理unload、unmount的应用；（2）如果应用未启动，就加载应用。如图6-14所示。

![](./images/mf-06.png)

<center>图6-14</center>

// src/navigation/reroute.js

```js
if (isStarted()) {
    appChangeUnderway = true;
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();
  } else {
    appsThatChanged = appsToLoad;
    return loadApps();
  }
```

在注册过子应用之后，可以使用singleSpa.start()启动应用。

```js
export function start(opts) {
  ...
  if (isInBrowser) {
    reroute();
  }
}
```



1.子应用加载探究

前文提过，single-spa是通过SystemJS加载器加载子应用代码的。在内部，single-spa提供约定声明周期的方法对子应用进行管理。为了方便理解，我们先以React项目为例，看如何把一个普通的SPA应用改造成一个single-spa的子应用。

为了能加载React子应用，需要引入React的适配包——single-spa-react。适配包的主要作用是适配通用的声明周期钩子函数，保证应用可以正确地运行。

先看Webpack配置，在entry配置中把声明周期函数所在地文件作为入口，如图6-15所示。

![mf-07](./images/mf-07.png)

<center>图6-15</center>

entry.js

```js
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component.js";

const reactLifecycles = singleSpaReact({ React, ReactDOM, rootComponent: Root, domElementGetter });

export const bootstrap = [reactLifecycles.bootstrap];

export const mount = [reactLifecycles.mount];

export const unmount = [reactLifecycles.unmount];

function domElementGetter() {
  // 声明div元素用来挂载子应用
  let el = document.getElementById("app1");
  if (!el) {
    el = document.createElement("div");
    el.id = "app1";
    document.body.appendChild(el);
  }
  return el;
}
```

在singleSpaReact的构造函数中，需要传入React的核心库、React-dom、rootComponent和挂载节点的Getter函数。

在domElementGetter方法中，需把指定的React应用挂载到子节点，实例化后会立即把页面挂载到该DOM节点上，如图6-16所示。

![mf-08](./images/mf-08.png)

<center>图6-16</center>

SystemJS是支持多种模块规范的代码加载器，可以支持AMD、CMD、CommonJS、ES6等规范，如图6-17所示。在HTML文件中我们引入了amd.js、 named-exports.js和 use-default.js。

![mf-09](./images/mf-09.png)

<center>图6-17</center>

这些库可以完成的功能如下：

- amd.js：支持AMD规范实现的模块加载。
- named-exports：对AMD模块、全局导入的扩展支持模块按需引入。例如，import {format} from '../tools.js'，而不是 import T from '../tools.js';T.format()。
- use-default：直接返回AMD模块，而不是返回{default: amdModule}。

> 在ES6 module中有相应的default命令，可以把某个方法或者变量导出为默认的。
>
> 比如 ：
>
> export default function(){
>
> ​       return "default function" 
>
> }
>
> 引入的时候就可以使用import func from "文件路径"
>
> func(). //返回 "default function"

通过上面的配置不难发现，各个子应用都与AMD规范相关。为了使SystemJS能够准确地加载子应用，我们应把各个应用打包（Webpack）成AMD规范的。

首先在Webpack的output中进行配置：

```js
libraryTarget: "amd",
```

libraryTarget是指设置library的暴露方式，具体的值有commonjs、commonjs2、umd、this和var等。

- libraryTarget:"assign"。暴露一个未定义的library设置的变量。在node环境下不支持。

- libraryTarget:"var"。暴露一个用var 定义的library设置的变量。在node环境下不支持。

- libraryTarget:"window"。在window对象上定一个library设置的变量。在node环境下不支持。

- libraryTarget:"global"。在global对象上定义一个library设置的变量。受target属性影响，当target为默认值Web时，会在window对象上注册。如果想在global对象上注册，则必须修改target为node。

- libraryTarget:"this"。在当前的this对象上定义一个library设置的变量，如果this对象是window对象，就在window对象。在node环境中，如果未指定require赋值的变量，则不会指向global对象。

- libraryTarget:"commonjs"。在export对象上定义library设置的变量。在node环境下支持，在浏览器中不支持。

- libraryTarget:"commonjs2"。直接用module.export导出export对象，会忽略library设置的变量。在node环境下支持，在浏览器中不支持。

- libraryTarget:"amd"。在define方法上定义library设置的变量，不能用script直接引用，必须通过第三方模块来使用。

  

  2.注意事项

    （1）SystemJS不应该被转译：在single-spa实现的微前端应用中，SystemJS扮演了一个加载器的角色，不应该被其他编译工具干扰，所以在Webpack配置js文件加载时需要排除该文件， 在rules中增加如下配置：

  ```js
  {
    parser: {
    System: false,
    },
   }
  ```

    （2）去掉Webpack中的splitChunks配置，这项配置在第5章中做过相关的介绍，这里再简单介绍一下，有些库包比较大，如果一起打包会导致文件过大，所以应该利用浏览器的并发数，把大文件拆开。

  ```js
  splitChunks: {
    chunks: "all",
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    cacheGroups: {
      vendor: {
        chunks: "all",
        test: path.resolve(__dirname, "../node_modules"),
        name: "duplication-[hash:5]",
        enforce: true
      }
    }
  }
  ```

    在上面的配置中，我们把node_modules中配置最大加载次数为5的都强制打包到 duplication-[hash:5].js中 ，以减少主js文件的大小。

    如果不去掉这项配置，则single-spa是无法正确加载React应用的源文件的。

  

  3.配置Vue项目

    在日常Web开发中，Vue及其全家桶的应用范围越来越大，在PC端和App端都有很好的选择。现在Vue 3.0已进入RC阶段，相信不久就会出GA版。回到主题，single-spa接入Vue应用无论如何也是一个绕不开的话题。

    在接入React的项目时，我们详细介绍了各个部分，所以在本节中接入Vue应用会轻松很多。主要还是有几方面的修改：

    （1）添加工程的入口文件，引入single-spa和Vue的连接库：

  ```js
  yarn add single-spa-vue
  ```

    并进行实例化，然后添加mount和unmout 的声明周期方法。

  ```
  import singleSpaVue from "single-spa-vue";
  import App from "./App.vue";
  
  Vue.config.productionTip = false;
  const vueLifecycles = singleSpaVue({
    Vue,
    appOptions: {
      el: "#app4",
      render: h => h(App)
    }
  });
  export const bootstrap = [vueLifecycles.bootstrap];
  export function mount(props) {
    createDomElement();
    //window.store = props.globalEventDistributor;
    //window.globalEventDistributor = props.globalEventDistributor;
    return vueLifecycles.mount(props);
  }
  
  export const unmount = [vueLifecycles.unmount];
  function createDomElement() {
    // Make sure there is a div for us to render into
    let el = document.getElementById("app4");
    if (!el) {
      el = document.createElement("div");
      el.id = "app4";
      document.body.appendChild(el);
    }
    return el;
  }
  ```

    （2）在Webpack配置（非vue-cli生成的工程）的module/rules中增加如下配置。

  ```js
  {
    parser: {
      System: false
    }
  }
  ```

    如果是vue-cli生成的工程，则需要在vue.config.js的chainWebPack中进行配置。

    （3）在external中配置不打入bundle包中的第三方库，前提是在公共应用中已经把该三方库写入import-maps中。

  

  

  #### 6.3 在Docker中部署前端应用

    Docker是dotCloud 开源的一个基于LXC虚拟化技术的应用容器引擎，可以轻便灵活地隔离环境，进行扩容和运维管理。

  >   LXC，全称Linux Container容器是一种内核虚拟化技术，提供轻量级的虚拟化隔离进程和资源。

    Docker在容器的基础上，进行了进一步的封装，从文件系统、网络连接到进程隔离等，极大地简化了容器的创建和维护，使得 Docker 技术比虚拟机技术更为轻便、快捷。传统虚拟机技术是虚拟出一套硬件后，在其上运行一个完整的操作系统，在该系统上再运行所需的应用进程，而容器内的应用进程是直接运行于宿主内核中的，因为容器没有自己的内核，从这个角度看，容器更加轻量。

    现在Docker的应用越来越多，应用范围也从运维、后端慢慢向前端扩展。到底Docker有哪些优质特性做到如此广泛的应用呢，仔细总结一下可能有如下几条：

  -   新的虚拟化实现，比传统虚拟机更轻量级。

  - 资源利用更高效，因为Docker是直接运行在宿主机上，所以不需要进行硬件抽象。

  - 多环境配置一致，Docker的一个关键优势就是提供统一的环境配置，把应用的环境打成镜像的形式向外提供服务，而不用考虑各个环境的差异。

  - 持续交付和部署的能力，使用 Docker 可以通过定制应用镜像来实现持续集成、持续交付、部署。开发人员可以通过 Dockerfile 来进行镜像构建，并结合持续集成(CI) 系统进行集成测试，而运维人员则可以直接在生产环境中快速部署该镜像，甚至结合持续部署(CD) 进行自动部署。

  - 迁移更简单，该项特性得益于Docker的环境隔离机制。

  

  现在前后端都在强调devops的理念，所以前后端的项目部署都趋向于自动化。接下来我们通过一个简单的案例介绍如何借助Docker实现前端的项目部署。

  在介绍自动化部署之前，先简单回顾一下是以前是如何进行刀耕火种般部署的：

  首先，使用 `yarn install` 或者`npm install` 安装依赖。

  其次，使用`npm/yarn run build`编译、打包生成静态文件。

  最后，把静态文件拷贝到服务器相应的目录下，并配置Nginx，如文件路径、端口、跨域请求等。

  

  这个流程是不是特别的复杂？

    既然要和Docker打交道，那么自然少不了要和Docker命令和Dockerfile打交道，为了提高操作的完整性，这里有必要介绍一下Docker的基本操作和Dockerfile的相关知识。

  Docker为主流操作系统（Linux、macOS和Windows）提供了安装包，请根据自己的操作系统自行下载。

  

  1.Docker架构

    Docker使用C/S架构，Client 通过接口与Server进程通信，实现容器的构建、运行和发布。Client和Server既可以运行在同一台集群，也可以跨主机实现远程通信，如图6-18所示。

  ![](./images/docker-01.png)

  <center>图6-18</center>

  2.Dorcker的核心概念

    镜像、容器与仓库是Docker中最基本、最核心的概念。掌握与理解这三个概念是学习Docker的关键。

  （1）镜像。

    镜像（Image）就是一个含有文件系统的面向Docker引擎的只读模板。任何应用程序运行都需要环境，而镜像就是用来提供这种运行环境的。镜像可以用来创建 Docker 容器，一个镜像可以创建很多容器。Docker 提供了一个很简单的机制来创建镜像或者更新现有的镜像，用户甚至可以直接从其他人那里下载一个已经做好的镜像来直接使用。

  （2）容器。

    Docker 利用容器（Container）独立运行一个或一组应用。容器是从镜像创建的运行实例，它可以被启动、开始、停止和删除。每个容器都是相互隔离的、可保证安全的平台。可以把容器看作一个简易版的 Linux 环境（包括root用户权限、进程空间、用户空间和网络空间等）和运行在其中的应用程序。

    容器的定义和镜像几乎一模一样，也是一堆层的统一视角，唯一区别在于容器的最上面那一层是可读可写的。

  （3）仓库。

    仓库（Repository）是集中存放镜像文件的场所。有时候会把仓库和仓库注册服务器（Registry）混为一谈，并不严格区分。实际上，仓库注册服务器上往往存放着多个仓库，每个仓库中又包含了多个镜像，每个镜像有不同的标签（tag）。

    仓库分为公开仓库（Public）和私有仓库（Private）两种形式。最大的公开仓库是 Docker Hub，存放了数量庞大的镜像供用户下载。国内的公开仓库包括阿里云、网易云、腾讯云、时速云、daoCloud等，可以供用户更稳定快速地访问。当然，用户也可以在本地创建一个私有仓库。

    用户在创建了自己的镜像之后，就可以使用push命令将它上传到公有仓库或者私有仓库，当在另一台机器上使用这个镜像时，只需要使用pull命令从仓库上拉取下来就可以了。

  

3.Docker中关于镜像的基本操作

   现在默认已经安装了Docker引擎，可以使用命令看一下具体的版本号：

  ```do
  ~ docker -v
  Docker version 19.03.8, build afacb8b
  ```

  如果能正常显示版本号，则证明已正确安装了Docker。

​    先用docker images命令查看一下在本地镜像仓库中有哪些镜像（如果是新安装的引擎，则本地镜像为空）：

  ```js
  ~ docker images
  REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
  
  ```

  前面介绍过，镜像文件都存放在镜像仓库中。如果想直接使用现成的镜像文件，则可以使用pull命令从hub中拉取。注意，可以在官方的镜像仓库中查找是否有现成的镜像文件，当然也可以通过docker命令实现，后面会介绍。这就像在前端开发中，为了实现某一个功能在npm仓库中查找三方包一样。

装npm包可以使用npm install xxx或者yarn add xxx，那么应如何拉取镜像呢？Docker中提供的pull命令可以达到这个目的。

在Docker hub中有一个hello-world镜像，可以帮助我们快速上手，如图6-19所示。

  <img src="./images/docker-02.png"/>

<center>图6-19</center>

  ```js
  ~ docker pull hello-world 
  Using default tag: latest
  latest: Pulling from library/hello-world
  0e03bdcc26d7: Pull complete 
  Digest: sha256:4cf9c47f86df71d48364001ede3a4fcd85ae80ce02ebad74156906caff5378bc
  Status: Downloaded newer image for hello-world:latest
  docker.io/library/hello-world:latest
  ```

  拉取一个或多个镜像可使用docker pull命令，如果没有指定镜像标签，则Docker默认使用:latest，上面的示例命令就会拉取最新的镜像文件，等同于docker pull hello-world:latest。Docker使用内存寻址方式来存储镜像文件，镜像文件ID是通过SHA256摘要方式包含其配置和镜像层的。

  接下来通过docker images命令查看本地已存在的镜像文件：

  ```js
  ~ docker images
  REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
  hello-world         latest              bf756fb1ae65        8 months ago        13.3kB
  ```

   列表中包含了仓库名、标签、镜像ID、创建时间 及 所占用的空间。镜像 ID是镜像的唯一标识，一个镜像可以对应多个标签，每个仓库可以包含多个标签，每个标签对应一个镜像。

  运行一下，看看效果：

  ```js
  ~ docker run hello-world
  
  Hello from Docker!
  This message shows that your installation appears to be working correctly.
  
  To generate this message, Docker took the following steps:
   1. The Docker client contacted the Docker daemon.
   2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
      (amd64)
   3. The Docker daemon created a new container from that image which runs the
      executable that produces the output you are currently reading.
   4. The Docker daemon streamed that output to the Docker client, which sent it
      to your terminal.
  
  To try something more ambitious, you can run an Ubuntu container with:
   $ docker run -it ubuntu bash
  
  Share images, automate workflows, and more with a free Docker ID:
   https://hub.docker.com/
  
  For more examples and ideas, visit:
   https://docs.docker.com/get-started/
  ```

   从上面的提示信息可以看出，镜像文件已经正常工作了。如果想让启动的容器在后台应用，可以加上-d参数。

  到目前为止，我们都是通过镜像名称或者加标签的方式来拉取镜像文件，显然这是一种很方便的拉取镜像的方式。如果使用标签拉取，那么当你再次使用docker pull的时候可以确保拉取的是最新的镜像文件。例如，docker pull ubuntu:18.04便可以拉取最新的Ubuntu 18.04镜像。

  当拉取一个镜像时，需要指定Docker Registry的地址和端口号，默认是Docker Hub，除此之外，还需要指定仓库名和标签。仓库名和标签可以唯一确定一个镜像，而标签是可能省略的，如果省略，则默认使用latest作为标签名。另外，仓库名由作者名和软件名组成。

  ```js
  docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]
  ```

  如果拉取非官方的第三方镜像，则需要指定完整仓库名，如下：

  ```js
  docker pull mysql/mysql-server:latest
  ```

​    当不需要本地的某些镜像时，也可以删除该镜像，以节省存储空间。需要注意的是，如果使用该镜像创建的容器未删除，则不允许删除该镜像。

  在Docker中有两个关于删除的命令：docker rm和docker rmi。docker rmi命令可用于删除镜像，docker rm命令可用于删除容器。

  我们先试着删除一下hello-world镜像，看看效果是怎样的：

  ```js
  ~ docker image rm hello-world
  Error response from daemon: conflict: unable to remove repository reference "hello-world" (must force) - container 20e8f92b12f5 is using its referenced image bf756fb1ae65
  ```

通过上面的提示可以看出，并未成功删除hello-world镜像，这是因为在启动hello-world镜像的时候，使用docker run命令基于hello-world镜像创建了一个全新的容器。因此需要先删除容器，再删除hello-world镜像。当然，docker rm命令和docker rmi命令都提供了 -f 命令，可强制删除存在容器的镜像或启动中的容器，示例如下：

  ```js
   ~ docker rmi -f hello-world
  Untagged: hello-world:latest
  Untagged: hello-world@sha256:4cf9c47f86df71d48364001ede3a4fcd85ae80ce02ebad74156906caff5378bc
  Deleted: sha256:bf756fb1ae65adf866bd8c456593cd24beb6a0a061dedf42b26a993176745f6b
  ```

  在Docker中还有一个比较重要的命令就是docker ps，该命令可以查看容器的相关信息，默认只显示正在运行的容器信息，可以查看的信息有CONTAINER ID、NAMES、IMAGES、STATUS和PORTS等，如图6-20所示。

  ![docker-03](./images/docker-03.png)

  <center>图6-20</center>

  有了上面的命令基础之后，下面介绍一下Docker和前端是怎样融合的。

  在构建镜像之前，需要先构造一个Dockerfile文件。Dockerfile 是一个用来构建镜像的文本文件，其中包含了一条条构建镜像所需的命令和说明。

  先来看一个简单的Dockerfile文件描述：

  ```js
  FROM node:12.19.0
  
  # 代表生产环境
  ENV PROJECT_ENV production
  
  # 许多场景下会根据此环境变量使用不同的配置，特别是在Webpack中打包时，会根据此环境变量做出优化
  ENV NODE_ENV production
  
  WORKDIR /code
  ADD . /code
  RUN npm install -g http-server
  RUN npm install && npm run build
  EXPOSE 80
  
  CMD http-server ./public -p 80
  ```

  >   注意：Dockerfile命令是不区分大小写的，但是为了方便和参数区分开，通常使用大写字母 。

  

  下面解释一下每条命令都是用来做什么的，这样再写其他的Dockerfile文件更会更加得心应手。

  From命令表示该镜像是基于什么来构建的，换句话说，是基于 FROM 的镜像。在某些镜像文件中，你看到的可能是From ubuntu或者是 From centos等，这两个就是基于Ubuntu和CentOS来构建镜像的。

  Env命令是用来设置环境变量的，在定义了环境变量之后，在后续的命令中，就可以使用了。设置格式如下：

  ```
  ENV <key> <value>
  ENV <key1>=<value1> <key2>=<value2>.
  ```

  在上面中，我们设置了两个环境变量ROJECT_ENV 和NODE_ENV

  WORKDIR可用来指定工作目录。作用同docker run -w 。用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在。工作目录可以指多个，每个WORKDIR只影响它下面的命令，直到遇见下一个WORKDIR为止。需要注意的是，WORKDIR 指定的工作目录必须是提前创建好的。

  ADD命令，作用与copy命令，用法也一样。与copy命令不同的是，当执行 的<源文件> 为 tar 包时，压缩格式为 gzip、 bzip2 以及 xz 的情况下，会自动复制并解压缩到 <目标路径>。这就带来了一个弊端，在不解压缩的前提下，无法复制 tar包中的 压缩文件。命令镜像构建缓存失效，从而可能使命令镜像构建变得比较缓慢。具体是否使用，可以根据是否需要自动解压缩来决定。

  RUN命令用于执行后面跟着的命令，如RUN npm install -g http-server ，等同于在命令行全局安装http-server。如果是多条命令，则可以使用&&连接，到现在你有没有发现和shell命令写法如出一辙呢？其实在以某个基础镜像构建新的镜像时，就不再使用以该基础镜像的命令行了。再看一个例子：

  ```
  FROM centos
  RUN yum install wget
  RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz"
  RUN tar -xvf redis.tar.gz
  ```

  上面的命令表示以CentOS为基础镜像，在RUN中可以使用yum命令来操作，就像在Ubuntu中使用apt命令一样。

  

​    EXPOSE仅仅只用来声明端口，它有两个作用：

 （1）帮助镜像使用者理解这个镜像服务的守护端口，以便配置映射。

 （2）在运行时如果使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。

  CMD命令，类似于 RUN 命令，用于运行程序，但二者运行的时间点稍有不同。CMD命令 在docker run 时运行，RUN 命令是在 docker build时执行。为启动的容器指定默认要运行的程序，当程序运行结束时，容器也结束。CMD 命令指定的程序可被 docker run 命令行参数中指定要运行的程序所覆盖。如果 Dockerfile 中存在多个 CMD 命令，仅最后一个生效。

  

  **实例**

  在了解了上面的命令之后，下面通过一个简单的实例构建一个简单的镜像，显示一个静态HTML文件并在页面显示“Docker is running”。为了演示效果，我们不引入后台服务，只通过前端服务器进行构建。

Dockerfile的描述如下：

  ```dockerfile
  FROM node:12.19.0
  ADD ./index.html /
  RUN npm install -g http-server
  EXPOSE 9001
  CMD http-server -p 9001
  ```

该镜像构建在node@12.19.0的基础上，安装前端HTTP服务器http-server（可以从npm官网安装），并暴露9001端口。

  在Dockerfile的同级目录下建一个静态html文件。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Docker test</title>
  </head>
  <body>
      <h3>Docker is running </h3>
  </body>
  </html>
  ```

  一切就绪，现在开始通过 Dockerfile 构建一个 test:v1。

  ```shell
  $ docker build -t test:v1 .
  ```

  > 注意：最后的 ***\*.\**** 代表本次执行的上下文路径， 指的是 Docker 在构建镜像时，如果要使用本机的文件，则docker build 命令在得到这个路径之后，会在路径下查找文件并打包。

  

  打包的过程如图6-21所示。

  <img src="./images/docker-04.png" alt="docker-04" style="zoom:67%;" />

<center>图6-21</center>  

  从上面的提示可以看出，镜像打包成功了，并且image ID为 9c1922490751， tag为v1。我们先看一下本地仓库的镜像情况，并确认一下新容器，如图6-22所示。

  ```shell
  docker images
  ```

<img src='./images/docker-06.png'/>

<center>图6-22</center> 

  确认镜像没有问题之后，运行下面的命令看看能否实现我们最初的目标，如图6-23所示。

  ```shell
  docker run -p 9001:9001 test:v1
  ```

  <img src="./images/docker-05.png" style="zoom:67%;float:left" />

  

  







<center>图6-23</center> 



6.4 用WebAssembly提高前端性能

6.4.1 WebAssembly概述

2018年7月，WebAssembly 1.0标准正式发布。WebAssembly的诞生意义非凡，它提供了一种可能性，使各种语言编写的代码都可以以接近原生的速度在 Web 端运行。它使得Web能力有了进一步的延伸，解锁了前端开发的新技能，使Web开发进入一个新阶段。现在的Web端不仅有HTML、CSS和JavaScript，还可以加入C、C++、Rust、Go、Dart、Kotlin等开发语言，把这些语言开发的代码转换成.wasm模块，然后把.wasm模块转成base64，然后在浏览器里面执行。.wasm模块中的字节码既可以编译成机器码后执行，也可以使用解释器直接执行，兼容性和性能兼有。

​    WebAssembly是一种新兴的网页虚拟机标准，是一个可移植、体积小、加载快并且兼容 Web 的全新格式。为什么该技术能成为Web端性能优化的关键技术之一呢？下面介绍它的产生背景和过程。

  众所周知，计算机只能识别机器码，而编译器可以把编程语言编写的程序转变成机器码。根据编译方式的不同，编程语言可以分为解释型语言和编译型语言。

  解释型语言每次执行程序时都需要一边转换一边执行，即代码执行到哪里，就将哪里的代码转换成机器码，对于用不到的代码则不进行任何处理。因为每次执行程序都需要重新转换代码，所以解释型语言的执行效率低、速度慢。

  编译型语言在执行时是先用编译器把整个源代码全部编译成目标代码，然后直接在支持目标代码的平台上运行，而且可以无限次运行，这样在执行时就不再需要编译器了。比如，Java代码会被编译成class文件。

​    解释器和编译器各有利弊，具体如下：

  解释器的优点是启动和执行的速度更快，不需要等待整个编译过程完成就可以运行代码。也就是说，解释型语言可以从第一行代码就开始“翻译”，对于Web 开发人员来说，能够快速执行代码并且看到结果是非常过瘾的一件事情。

  解释器的缺点是每次执行代码都需要解释，也就是说，解释器不得不一次又一次的“干活”，而这势必会影响代码的执行效率。

  编译器的问题则恰好相反，它需要花更多的时间对整个源代码进行编译，然后生成目标文件。即便代码中有循环，它的执行速度也很快，因为它不需要重复编译。

  

  1.JIT编译器

   JavaScript 一开始是解释型语言，为了提高它的执行速度， Google 公司于 2009 年在v8引擎 （JavaScript的解释器）中引入了即时编译 （Just-In-Time ，JIT）编译器。 有了它，JavaScript的性能才有了大幅提升。  

  JIT编译器结合了解释器和编译器的优点，它在 JavaScript 引擎中增加了一个监视器（也叫分析器）。监视器监控着代码的运行情况，记录代码一共运行了多少次、是如何运行的等信息。如果某段代码运行了数次，就把这段代码标记成“warm”。如果某段代码运行了很多次，就把这段代码标记成“hot”。

2.基线编译

​    如果一段代码被标记成“warm”，那么 监视器就就把它发送到JIT 编译器去编译，并把编译结果存储起来。代码段的每一行代码都被编译成一个“桩”（stub），同时给这个桩分配一个“行号 + 变量类型”的索引。如果监视器监视到了需要执行同样的代码和同样的变量类型，就直接把这个已编译的版本推送给浏览器，从而提高执行速度。除此之外，还可以通过优化编译器来更有效地执行代码。

3.优化编译器

   如果一段代码段被标记成“ hot”，那么监视器就把它发送到优化编译器去编译，生成一段更高效的代码并存储起来。

  在引入JIT 编译器之后，虽然JavaScript的执行速度提高了20~50倍，但是JIT  编译器带来的性能提升很快就到了天花板。实际上，JIT 编译器的问题如下：

​    （1）JIT 编译器是基于运行期进行分析和编译的，而 JavaScript 是一个弱类型的语言，所以大部分时间，JIT 编译器都在推测 JavaScript 中的类型，比如下面代码实现的两个参数的相加。

  ```js
  function add(a, b) {
    return a+b
  }
  var result = add(1, 2)
  ```

  当JIT 编译器分析到这块段代码时，会把add方法编译为

  ```js
  function add(int a, int b) {
    return a+b
  }
  ```

  如果换成了

  ```js
  var result = add(“hello”, “world”)
  ```

   则JIT 编译器只能重新编译。整数加法和字符串连接是两个完全不同的操作，会被编译成不同的机器码。

  JIT 编译器处理这个问题的方法是编译多基线桩。如果一个代码段是单一形态的（即总是以同一类型被调用），则只生成一个桩。如果一个代码段是多形态的（即在调用的过程中，类型不断变化），则会为操作所调用的每一个类型组合生成一个桩。

​    在WebAssembly之前，已有许多大厂不断尝试在浏览器中直接运行C或C++程序。如1995年的NPAPI（Netscape Plugin API）,微软在浏览器直接嵌入可以运行本地代码的ActiveX控件，甚至2010年Google也开发了一种名叫NaCL（Native Clients）,遗憾的是这些技术实现都太过复杂导致推广受阻，最后都不了了之。

  受上面项目失败的影响，Google公司另辟蹊径，尝试将Java转换为JavaScript，因此推出了GWT（Google Web Toolkit），开创了将其他语言转为JavaScript代码的先河。之后的CoffeeScript、Dart和TypeScript等语言都以输出JavaScript代码为最终目标。

  Mozilla创建了Emscripten项目，尝试通过LLVM工具链将C或C++语言编写的程序转译为JavaScript代码，利用LLVM编译器前端编译C/C++，生成LLVM特有的跨平台中间代码，最终再将LLVM跨平台中间语言代码转译为JavaScript的asm.js子集。

  2015年6月，谋智公司在asm.js的基础上发布了WebAssembly项目，随后谷歌、微软、苹果等各大主流的浏览器厂商均大力支持。WebAssembly不仅拥有比asm.js更高的执行效能，而且由于使用了二进制编码等一系列技术，使得WebAssembly编写的模块体积更小且解析速度更快。

  

  到目前为止，桌面浏览器对WebAssembly的支持情况如下，除IE外，其他主流浏览器都已经支持WebAssembly，如图6-24所示。

  ![wa01](./images/wa01.png) 

<center>图6-24</center>   

   WebAssembly可以把Go、Java等语言编写的程序转换为JavaScript语言，那么对于前端而言，在特定场景下，使用WebAssembly可以为应用开发提供一种解决方案：

 （1）计算密集型的应用，对于高度并行且精度较高的算法，可以使用WebAssembly在CPU上直接运行。

  （2）  区块链应用，Ethereum已经在核心库中加入 了WebAssembly，叫作ewasm，用来确定子集重新设计以太坊智能合约执行层的提议。

  （3）IoT。

  （4）多媒体应用。

  （5）Web游戏。

  （6）深度学习。

  

  6.4.2 WebAssembly案例

   本节我们通过两个简单的例子，讲解把Go语言程序编译成WebAssembly的操作过程，并详细介绍如何利用WebAssembly和DOM交互，抛砖引玉，希望能引起更多的程序员去探索Go语言，探索WebAssembly，拓展前端的技能圈。

  既然是以Go语言为蓝本，我们还是有必要对Go语言做简单的介绍。

  Go语言是由Google开发的一种编译型语言，同时它又是强类型的，天然支持并发性、垃圾回收，总体说来，它具有以下优点：

  （1）静态类型检查，有过动态语言开发经验的同学会深有感触静态检查有多么的重要，可以在编译时进行语法检查，能避开很多不必要的错误。

  （2）语言级别的并发支持，这个是Go语言骨子里的东西，因为Go语言本身支持goroutine和管道，可以并行执行并支持goroutine之间安全的数据通信，避免了像其他语言里共享内存访问引起的问题。

  （3）丰富的标准库，Go语言内置了很多的标准库，特别是网络库，功能强大。

  （4）编译速度快。官方编译器在期初是用C语言写的，后面使用Go进行了重写。并且可以跨平台编译成目标二进制文件。

  （5）类型系统简单。由于Go语言的作者都是C语言出身，所以和C的语言结构比较相似。

 除此之外，Go语言还内置了强大的工具链，拥有高性能HTTP Server、defer机制等。

  

  Go语言可以做的应用大致可归结为以下几类：

  服务器编程。C和C++适合做的事情，用Go来做也合适。

  分布式系统开发，及其他辅助系统开发。如百度和京东的消息系统、京东商城、小米的运维监控系统和日志搜索系统，以及腾讯游戏。在国外更是有很多成功的Go项目，如nsq消息队列、k8s为Docker应用部署、规划、更新、维护服务。Doozer分布式同步工具，类似ZooKeeper。groupcache、memcahe作者写的用于Google下载系统的缓存系统。还有很多，大家可以自行搜索。

  Web编程。这块的应用目前最为广泛。Web开发在当前仍然是热门职位，所以，Go语言的Web开发框架也不会缺席，beego、buffalo、echo、gin、iris、revel。在国内以beego为口碑最佳。

 云平台，目前国外很多云平台在采用Go开发，CloudFoundy的部分组建。

  >  注：本章节并非介绍Go语言的入口，所以暂不介绍Go语言的安装、环境配置等基本操作，我们直接从实际操作入手。

  第1步，新建一个Go工程，工程目录大致如图6-25所示。

  <img src="./images/wa02.png" alt="wa02" style="zoom:67%;" />

<center>图6-25</center>   

  bin：存放编译后的可执行文件。

  pkg：存放编译后的包文件。

  src：存放项目源文件。

  intro：自定义目录，用来测试第一个WebAssembly。

  

 第2步，在src目录下，建立一个go文件，命名为main.go。

  ```go
  package main
  import "fmt"
  
  func main() {
  	fmt.Println("Hello, WebAssembly!")
  }
  
  ```

main.go是主程序的入口，主入口程序有两个比较明显的特征，一个是声明的main方法，编译器会把这个名字的包编译成二进制可执行文件，如果没有这个方法，程序就无法执行；另一个是在第一行声明的包名

  ```go
  package main
  ```

  在Go语言中，每行代码都要归属到某一个包中，main.go也不例外。包定义了一组编译过的代码，与命名空间比较类似，可用来间接地访问包内声明。

  第3步，导入fmt包。这个包提供了完整格式化的功能，在main方法中，我们只打印“Hello, WebAssembly!”这一句话。

  前面介绍过，我们可以把Go代码编译为WebAssembly。想要实现编译其实很简单。

  先试试下面的命令：

  ```shell
  GOOS=js GOARCH=wasm go build -o test.wasm main.go
  ```

  这里需要说明的是GOOS和GOARCH这两个环境变量的作用。 在Go里面，可以将Go代码编译成各个平台的目标结果。比如GOOS，可以指定为Windows、Linux，Android、illumos、Solaris，netbsd、js等。GOARCH表示系统架构，可以指定为Arm, Amd64,wasm等。

  -o 表示 output，是输出文件，输出文件名紧跟该选项，如果想把文件直接编译到某个目录下，则可以指定具体的目录。例如，想要编译到当前的test文件夹中，可以指定为'./test/test.wasm'。在上面的命令中，输入的文件名为test.wasm。最后的选项为需要编译的源文件。

  现在我们有了wasm文件，还有一个比较重要的步骤就是需要在HTML中引入Go提供的js库。值得欣喜的是，Go语言开发者已经帮我们准备好了，就位于$GOROOT/misc/wasm下，只要正确配置GOPATH，剩下的只需执行一条命令即可：

  ```shell
  cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
  ```

  通过该命令就可以把核心库文件拷贝到当前目录或者指定目录了。

  

  至此，准备工作就做好了。需要html的的时候了。为了和Go语言的源代码分开，下面新建一个intro目录，把wasm文件和js核心库文件拷贝到该目录下，并在HTML文件中准备以下内容：

  ```html
  <!doctype html>
  <html>
      <head>
          <meta charset="utf-8"/>
          <title> wasm 介绍</title>
           <script type="text/javascript" src="./wasm_exec.js"></script>
      </head>
      <body>
          <h1>Chapter6</h1>
          <h3>compile Go to webassembly</h3>
         <script>
             const go = new Go();
             WebAssembly.instantiateStreaming(fetch("./test.wasm"), go.importObject).then((result) => {
                 go.run(result.instance);
             });
         </script>
      </body>
  </html>
  ```

   代码中使用的WebAssembly.instantiateStreaming方法可以直接从流式底层源编译和实例化WebAssembly模块，正常的流程是先转换成ArrayBuffer，再进行实例化。如果要分步实现，则支持数字相加之后再平方的代码初始化是这样的：

  ```html
  WebAssembly.compile(new Uint8Array(`
    00 61 73 6d  01 00 00 00  01 0c 02 60  02 7f 7f 01
    7f 60 01 7f  01 7f 03 03  02 00 01 07  10 02 03 61
    64 64 00 00  06 73 71 75  61 72 65 00  01 0a 13 02
    08 00 20 00  20 01 6a 0f  0b 08 00 20  00 20 00 6c
    0f 0b`.trim().split(/[\s\r\n]+/g).map(str => parseInt(str, 16)) 
  )).then(module => {
    const instance = new WebAssembly.Instance(module)
    const { add, square } = instance.exports
    console.log('3 + 6 =', add(3, 6))
    console.log('3^2 =', square(3))
    console.log('(9 + 1)^2 =', square(add(9 + 1)))
  })
  ```

[WebAssembly.compile](http://webassembly.org/docs/js/#webassemblycompile) 可以用来编译 wasm 的二进制源代码，它接受 BufferSource 格式的参数，返回一个 Promise，所以我们使用Uint8Array把字符串转换成 ArrayBuffer，即把字符串先分割成数组，再将普通数组转成 8 位无符号整数的数组。

  ```js
  new Uint8Array(
    `...`.trim().split(/[\s\r\n]+/g).map(str => parseInt(str, 16))
  )
  ```

  了解了上面的处理方式，就不难理解为什么通过instantiateStreaming加载wasm代码比较高效了。

  根据规范，instantiateStreaming接收两个参数：

  ```go
  dictionary WebAssemblyInstantiatedSource {
     required WebAssembly.Module module;
     required WebAssembly.Instance instance;
  };
  
  Promise<InstantiatedSource> instantiateStreaming(source [, importObject])
  ```

  **source**： 一个Response或者Promise对象。

  **importObject**： 包含一些想要导入新创建Instance中值的对象，这样在wasm的模块中就可以访问到js对象。

  instantiateStreaming返回一个Promise，通过resolve返回的对象包含两个对象，module和instance，module表示编译完成的WebAssembly模块. 这个Module能够再次被实例化（WebAssembly.Instance）或 通过[postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage)共享。instance包含WebAssembly所有公开方法（Exported WebAssembly functions），这些函数基本上只是webassembly中Javascript的包装器。 被调用时，用户侧在后台得到一些技能加持，将参数转换为wasm可以使用的类型(例如将Javascript的number转换为Int32类型的)，将参数传给wasm模块内部的函数，当函数被调用，结果转换并回传给Javascirpt。

 此时还是无法执行html文件，因为前端跨域还需要一个服务器。继续在src目录下新建一个server.go。新建go服务器时我们需要两个关键包：flag包和http包。

在启动命令行程序（工具、Server）时，有时需要对命令参数进行解析，这时就需要用到flag包。如果要创建HTTP服务，那么http包就是必选项。

下面先介绍一下这两个包的基本用法，以便理解服务器代码。

flag包的基本用法

常用的定义命令行 flag 参数的方法有两种，第一种：

```go
flag.Type(flag 名, 默认值, 帮助信息) *Type
```

Type 可以是 Int、String或Bool 等，返回值为一个相应类型的指针。例如，我们要定义姓名、年龄两个命令行参数，则可以按如下方式定义：

```go
name := flag.String("name", "houyw", "姓名")
age := flag.Int("age", 36, "年龄")
```

需要注意的是，此时 name和age均为对应类型的指针，而不是具体的值。

第二种：

```go
flag.TypeVar(Type 指针, flag 名, 默认值, 帮助信息)
```

TypeVar 可以是 IntVar、StringVar或BoolVar 等，其功能是将 flag 绑定在一个变量上。例如，我们要定义姓名、年龄两个命令行参数，则可以按如下方式定义：

```go
var name string
var age int
flag.StringVar(&name, "name", "houyw", "姓名")
flag.IntVar(&age, "age", 36, "年龄")
```

还有一个比较重要flag.parse()，通过以上两种方法定义命令行 flag 参数后，必须调用 flag.Parse() 对命令行参数进行解析。

启动一个HTTP服务，可以调用ListenAndServe来实现。

通过这两个简单的包即可实现一个简单的server.go:

```go
package main

import (
	"flag"
	"log"
	"net/http"
)

var (
	listen = flag.String("listen", ":9002", "listen address")
	dir    = flag.String("dir", "../intro", "directory to serve")
)

func main() {
	flag.Parse()
	log.Printf("listening on %q...", *listen)
	err := http.ListenAndServe(*listen, http.FileServer(http.Dir(*dir)))
	log.Fatalln(err)
}

```

万事俱备，现在启动服务，如图6-26所示。

```go
go run server.go
```

<img src="./images/wa03.png" alt="wa03" style="zoom:50%;" />

<center>图6-26</center>

终于成功了。

提到Web开发，Dom操作是常规操作，getElementById、getElementsByClass是核心API，那么在WebAssembly中是如何实现这种最基本的交互呢。下面我们再通过一个例子实现。

Dom操作需要导入另一个js相关的包，即syscall/js。该包提供了操作Dom的底层API：

```go
import (
	"fmt"
	"syscall/js"
	"time"
)
```

js.Global()` 返回一个 `js.Value` 类型的结构体，它指代 JS 中的全局对象，在浏览器环境中即为 `window` 对象。可以通过其 `Get()` 方法获取 `window` 对象中的字段，也是 `js.Value` 类型，包括其中的函数对象，并使用其 `Invoke()方法调用 JS 函数。

```
| Go                     | JavaScript             |
| ---------------------- | ---------------------- |
| js.Value               | [its value]            |
| js.Func                | function               |
| nil                    | null                   |
| bool                   | boolean                |
| integers and floats    | number                 |
| string                 | string                 |
| []interface{}          | new array              |
| map[string]interface{} | new object             |
```

```go
win := js.Global()
doc := win.Get("document")
body := doc.Get("body")
```

在执行上面的代码后，变量win就指向window对象，可以像普通的JavaScript对象一样在该对象上挂载属性或者方法。变量doc指向document对象，body指向body对象。

现在，我们使用set方法给window对象上挂载一个方法MyGoFunc，这样在html页面中就可以直接调用这个方法了。

```go
win.Set("MyGoFunc", MyGoFunc())
```

在main.go中定义一个MyGoFunc方法。

```go
func MyGoFunc() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return map[string]interface{}{
			"hello":  "myGoFunc invoked ",
			"name": "houyw",
		}
	})
}
```

Go 中的函数必须是 func(args []js.Value) 形式的，它使用 args 参数接收JavaScript调用的参数。稍后我们在HTML页面中测试效果。

在常规的DOM操作中，我们总是使用document.getElementById来获得DOM元素，下面看看在syscall/js中应该怎么做。在上面的代码中，变量doc指向document对象，如果要获得

```html
<button id="test">click me </button>
```

中的Dom元素，则可以使用doc的Get方法：

```go
btn := doc.Call("getElementById", "test")
```

绑定事件可以像普通的DOM对象一样，如图6-27所示。

```go
var callback js.Func
callback = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
  fmt.Println("click invoke")
  fmt.Println(args)
  btn.Set("innerHTML", "changed by go")
  return nil
})
btn.Call("addEventListener", "click", callback)
```

<img src="./images/wa04.png" alt="wa04" style="zoom:67%;" />

<center>图6-27</center>

在事件执行过程中，把原来显示的“click me”变成了“changed by go”。下面测试一下在window对象上绑定的方法MyGoFunc，看是否能调用到，如图6-28所示。

```html
<button onclick="handleGoFunc()">func defined in go</button>
function handleGoFunc() {
	console.log(MyGoFunc())
}
```

<img src="./images/wa05.png" alt="wa04" style="zoom:67%;" />

<center>图6-28</center>

没错，这就是我们想要的结果。

如何动态创建一个元素呢？使用doc.call调用底层的Dom方法，并传入元素名，接着就是常规操作，设置样式，最后把新建的元素追加到父节点上。

```go
newDiv := doc.Call("createElement", "div")
newDiv.Set("innerHTML", "create new div when page onload")
newDiv.Set("style","border: 1px solid red")
body.Call("appendChild", newDiv)
```

