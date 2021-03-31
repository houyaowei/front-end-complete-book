## 第3章 构建工具实战

前端发展到今天，工程化在前端开发中越来越扮演着重要的角色，特别是在前端组件陡增、开发规范日益完善、越来越追求开发效率的要求中，怎么做好工程化是摆在每个高级前端开发人员特别是前端架构师面前一个比较有挑战的任务。在本章中，我们将详细地介绍目前在开发中比较常见的几种构建工具，通过实例带大家了解下怎么处理日常构建问题。主要通过以下几节给大家做具体分析：

1. webpack5新特性介绍。

2. 新锐构建工具vite实战。

3. rollup从0到1怎么构建一个库。

4. parcel实战。

   

### 3.1 webpack5新特性介绍

webpack4于2018年2月发布，这个版本引入了大量非常实用的特性和性能提升，主要包含对node低版本的舍弃，最低支持Node 8.9.4，从node官网公布的数据来看，Node V6都已经支持了93%的ES6特性，所以方便用ES6写出更健壮的代码。再者就是mode属性的支持，

```
"scripts": {
  "dev": "webpack --mode development",
  "build": "webpack --mode production"
}
```

当然mode也可以在webpack的配置文件中进行配置。通过mode, 轻松设置打包环境。如果将 mode 设置成 development，你将获得良好的开发阶段体验。这得益于webpack针对开发模式提供的特性：

- 浏览器调试工具支持
- 模块缓存，避免在没更改的时候构建
- 注释、开发阶段的详细错误日志和提示
- 快速和优化的增量构建机制

如果mode设置成了 production, webpack将会专注项目的部署，包括以下特性：

- 开启所有的优化代码
- 更小的bundle大小
- 去除掉只在开发阶段运行的代码
- Scope hoisting和Tree-shaking

除了上述的特性，v4还优化了不少的插件，可以在**optimization.splitChunks** 和 **optimization.runtimeChunk**完成大部分的优化项，是不是方便了很多？当然还有更多的特性支持，像webassembly开箱即用，更多module支持（javascript/esm，javascript/dynamic，json）。

v4版本从刚开始到2020年10月10日发布的V5版本经历2年多的时间在没有重大更新的情况下，推出了很多功能。作为发布webpack5这个大版本来说，新特性自然不会缺席，现在我们就开始捋一下有哪些比较实用的功能。

webpack5主要更新了：

- 通过持久化硬盘缓存能力提升构建性能
- 通过更好的算法来改进长期缓存
- 通过更好的 Tree Shaking 能力和代码的生成逻辑来优化bundle的大小
- 改善 web 平台的兼容性
- 清除了内部结构，在 Webpack4 没有重大更新而引入一些新特性时所遗留下来的一些奇怪的 state
- 通过引入一些重大的变更为未来的一些特性做准备，使得能够长期的稳定在 Webpack5 版本上

先通过一个简单的例子看下bundle包有什么明显的变化，先看下两个webpack（v4 和v5的配置保持一致）的基本配置

```
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: {
    index: './src/scripts/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  }
}
```

这个是最基本的配置，在entry文件中输入简单的控制台输出。

```js
console.log("hello,webpack4 ")
```

> 可以通过  **npm ls webpack** 命令查看已经安装包的版本

![webpack5](./images/wp-01.png)

<center>图4-1</center>

![webpack5](./images/wp-02.png)

<center>图4-2</center>

接下来在package.json中配置script：

```js
"scripts": {
    "build": "rm -rf dist/ && webpack --config config/webpack.config.js --progress"
 }
```

有了配置后，我们开始编译这两个工程:

```js
yarn run build
```

先看两个版本打包后文件大小

v5

```
asset index.js 1.26 KiB [emitted] (name: index)
```

v4

```js
index.js   6.26 KiB      index  [emitted]  index
```

只从文件大小来看，明显缩小了很多。因为在webpack5的版本中去掉了很多模块管理代码，代码一下子清爽了很多，如下代码。

```js
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/index.js":
/*!******************************!*\
  !*** ./src/scripts/index.js ***!
  \******************************/
/***/ (() => {

eval("console.log(\"hello,webpack5\")\n\n//# sourceURL=webpack://webpack5/./src/scripts/index.js?");

/***/ })
```

下面看下另一个比较实用的配置：splitChunks和module size。

在v4版本中，通常在optimization会这样配置：

```
optimization: {
    splitChunks: {
      cacheGroups: {
          commons: {
            chunks: 'all',
            name: 'commons',
            minChunks: 1,
            minSize: 10,
            maxSize: 20
          }
      }
    }
  }
```

与显示单个数字和具有不同类型的尺寸相比，模块现在有了更好的方式表示不同size的能力。 现在，SplitChunksPlugin知道如何处理这些不同的size，并将它们用于minSize和maxSize。 默认情况下，仅处理javascript大小。

```js
optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'all',
          name: 'commons',
        }
      },
      minSize: {
        javascript: 0,
        style: 0,
      },
      //最大的文件 超过之后继续拆分
      maxSize: {
        javascript: 1,
        style: 3000,
      }
    }
  }
```

####  持久化缓存

在webpack5中增加了一个显示指定缓存的配置

```
cache: {
    type: 'filesystem',
    // 自定义缓存目录，
    cacheDirectory: path.resolve(__dirname, '.cache_file'),
    buildDependencies: {
      // 添加项目配置作为构建依赖项，以便配置更改时缓存失效
      config: [_cacheFileName],
      // 如果还有构建依赖其他内容，在此处添加
      //注意，配置中引用的webpack、加载器和所有模块都会被自动添加
    }
  },
```

开启cache选项，可以有效地提升webpack打包速度。缓存将默认存储在 `node_modules/.cache/webpack`（使用 node_modules 时）或 `.yarn/.cache/webpack`（当使用 Yarn PnP 时）中。

 yarn PnP是个什么高科技呢？介绍这个前，我们先介绍下人们在处理npm包依赖所做的努力，到笔者写稿为止，npmjs官网已经有**1,566,922**个npm包，现在的前端工程非常依赖这些功能各异的包。在npm3之前，node_modules中的包一直是以包嵌套的方式存在，导致目录结构非常的深，在npm3之后就变成了扁平结构，由原来的A依赖B，B依赖C，变成了A依赖B、C的结构，B和C会安装到同级目录。

但是依赖平铺却无法解决node_modules包非常臃肿的问题，一个中大型的项目，动辄上百兆。这样就导致了三个问题，一个是占用大量的磁盘空间，二是会占用不必要的带宽，三就是依赖管理方式效率太低，引用依赖时慢，安装依赖时也慢。

前两个问题不难理解，第三个原因需要解释一下。这又牵涉到两个问题，node包引用的解析和安装依赖的过程。

node包引用的过程是这样的：在require一个核心模块或者本地相对路径，会直接使用该文件，否则就要从当前目录下寻找node_modules，如果没有则到父目录查找，以此类推直到系统根目录。找到 `node_modules` 目录之后，再在该目录中寻找名为 `moduleName.js` 的文件或是 `moduleName` 的子目录，这个过程牵涉到代价不小的IO操作。

安装依赖时，现阶段 `yarn install` 操作会执行以下 4 个步骤：

1. 将依赖包的版本区间解析为某个具体的版本号
2. 下载对应版本依赖的 tar 包到本地离线镜像
3. 将依赖从离线镜像解压到本地缓存
4. 将依赖从缓存拷贝到当前目录的 `node_modules` 目录

这个过程也同样涉及大量的文件 I/O，导致安装依赖时效率不高。

后来yarn和npm都开始支持缓存，才让这种情况有所缓解。但是还不够彻底。如何才能比较彻底的解决呢，这就是要介绍的Yarn PnP。PnP全称 `Plug'n'P` ，直译就是“即插即用”，核心思想就是在每台机器上，单独创建一个包目录，来管理所有依赖的 npm 包，既然是中心化的管理思路，那么一台机器上的包就不再需要重复安装了，项目运行的时候，先对依赖包从这个中心化目录进行 resolve，然后再进行启动。

接下来我们看下是怎么用的。

首先，全局安装yarn（至少需要1.12版本）

```
npm install -g yarn
```

也需要在package.json配置，也可以通过yarn --pnp开启（yarn --disable-pnp关闭），

```json
// package.json
{
  ...
  "installConfig": {
    "pnp": true
  }
}
```

我们先把node_modules删掉，再执行**yarn install** , 发现不再有node_modules生成，而是多了一个.pnp.js文件。这是一张静态映射表，该表中包含了以下信息：

- 当前项目包含了哪些依赖包的哪些版本
- 依赖包是如何互相关联的
- 依赖包在文件系统中的具体位置

这个 `.pnp.js` 文件是如何生成，Yarn 又是如何利用它的呢？

在安装依赖时，在第 3 步完成之后，Yarn 并不会拷贝依赖到 `node_modules` 目录，而是会在 `.pnp.js` 中记录下该依赖在缓存中的具体信息。这样就避免了大量的 I/O 操作同时项目目录也不会有 `node_modules` 目录生成。

同时 `.pnp.js` 还包含了一个特殊的 resolver，Yarn 会利用这个特殊的 resolver 来处理 `require()` 请求，该 resolver 会根据 `.pnp.js` 文件中包含的静态映射表直接确定依赖在文件系统中的具体位置，从而避免了现有实现在处理依赖引用时的 I/O 操作。

从 PnP 的实现方案可以看出，同一个系统上不同项目引用的相同依赖的相同版本实际都是指向的缓存中的同一个目录。这带来了几个最直观的好处：

- 安装依赖的速度得到了空前的提升
- CI 环境中多个 CI 实例可以共享同一份缓存
- 同一个系统中的多个项目不再需要占用多份磁盘空间

#### 真实内容哈希

当output中的filname使用 `[contenthash]` 时，webpack4仅使用文件内部结构的哈希。webpack5是文件内容真实哈希，如果是仅修改注释或重命名变量，webpack5是可以监测到文件变化的，而webpack4监听不到变化。

#### 命名代码块 ID 

webpack5中默认在开发模式下启用了新命名的module ID算法，该算法提供了chunks（和文件名）开发人员可读的引用方式。 module ID由其相对于上下文的路径确定。 chunk ID由module的内容确定，例如：src_demo1_data_js.js，因此在开发调试chunk不再需要这样使用： 

```
import(/* webpackChunkName: "name" */ "module")
```

而是直接

```
import("module") 
```

当然，也可以在生产环境安全的前提下使用 ，需要在optimization 设置`chunkIds: "named"` 。如果你不喜欢在开发中改变文件名，你可以通过 `chunkIds: "natural"` 来使用旧的数字模式。

#### 支持全新的 Node.js 生态特性

这部分主要包含两部分，第一就是Yarn PnP，该特性在前面已经做了解释。再者就是支持 package.json 中的 `exports` 和 `imports` 字段。

package.json中的exports字段允许先声明再使用，比如“import  crypto-test” 或“import  crypto-test/sub”之类的。 这种实现方式替换了导入模块时默认返回包的index.js文件。

比如说这样的配置

```
{
  "exports": {
    ".": "./main.js",
    "./sub/path": "./secondary.js",
    "./prefix/": "./directory/",
    "./prefix/deep/": "./other-directory/",
    "./other-prefix/*": "./yet-another/*/*.js"
  }
}
```

对应的导出结果是这样的

| 模块标识                             | 查找文件结果                                 |
| :----------------------------------- | :------------------------------------------- |
| `.` 不能省略，和原配置main的含义相同 | `package/main.js`                            |
| `package/sub/path`                   | `package/secondary.js`                       |
| `package/prefix/some/file.js`        | package/directory/some/file.js`              |
| `package/prefix/deep/file.js`        | `package/other-directory/file.js`            |
| `package/other-prefix/deep/file.js`  | `package/yet-another/deep/file/deep/file.js` |
| `package/main.js`                    | Error                                        |

如果没有对应的配置，就会报错，如上面的**`package/main.js`**.

我们先定义一个实例module，目录命名为encrypt-test, 并新建一个package.json，name和目录名保持一致。

```
{
  "name": "encrypt-test"
}
```

我们下看下目录结构

![webpack5](./images/wp-03.png)

<center>图3-3</center>

接下来建一个主文件encrypt.js, 输入示例代码：

```js
module.exports = function(){
  console.log("packages/encrypto.js")
}
```

在根目录下建立子目录libs，并建立子包需要的文件trim.js

```js
module.exports = function(str){
  return str.replace(/\s+/g,"")
}
```

现在在package.json中配置exports

```js
{
  "name": "encrypt-test",
  "exports": {
    ".": {
      "browser" : {
        "default": "./encrypt.js"
      },
      "require": "./encrypt.js",
      "import": "./encrypt.js"
    },
    "./trim" : {
      "browser" : {
        "default": "./libs/trim.js"
      }
    }
  }
}
```

先配置一个**.**，这个是必须的，代表main字段配置。browser代码支持浏览器，require代表require()方式引入，import代表"import xx from ..."引用方式。

有了上面的配置，就可以在js文件中以如下方式引用改包了

```js
import encryptTest from "encrypt-test";
import trim from "encrypt-test/trim";
```

#### 经过优化的构建目标(target) 

Webpack 5 允许传递一个目标列表，并且支持目标的版本。例如：

```
target: "node14"   
target: ["web", "es2020"]
```

####  Web 平台特性支持

###### 图片导入

Webpack 5 已经对资源模块提供了内置支持,这些模块可以在输出文件夹生成一个文件。

导入图片时，不再像以前借助file-loader、url-loader、raw-loader, 在webpack5中简单配置即可。

```js
module.exports = {
  output: {
    assetModuleFilename: 'images/[name].[hash:5][ext]',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        type: 'asset',
      },
    ],
  },
  experiments: {
    asset: true,
  },
};
```

###### 异步引入

wepback4是这样异步引入代码的

```js
import('./entry').then(res => {
  console.log(res);
});
```

但是，无法处理被导入的模块是async/await实现的。

```js
// async.js
let output;
async function main() {
  const dynamic = await import('./data');
  output = dynamic + 'from aysnc';
}
main();
export default output;

// index.js
import output from './async';
console.log(output); // undefined

```

在webpack5中修复了这个问题，开启topLevelAwait 就可以实现，并且无需外面包裹 async，所以就变成了下面的样子

```js
// async.js
const dynamic = await import('./data');
const output = dynamic 'from aysnc';
export default output;
```

###### webassembly更方便支持

我们先把两个数相加的工具方法生成一个wasm文件utils.wasm，如果对webassembly不是很熟悉，请先移步到本书的6.6节了解相关的东西。

```go
func add(a,b int) int {
	return a+b
}
```



在webpack4中不能同步地加载，否则会报错，更不能把wasm当成主chunk。

```
import('path/utils.wasm').then(_ => {
   console.log(_.add(4, 6));
});
```

用了webpack5之后，只要开启 syncWebAssembly和syncWebAssembly后，就可以像导入一个普通的模块那样使用了

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
};

// index.js
import { add } from './utils'
console.log(add(4, 6))
```

###### webpack-dev-server改进

webpack5中使用dev server更加方便，在装完npm包，不需要要在webpack配置文件中引入该插件，只要在package.json的scripts中加上 serve 参数即可

```js
webpack serve --config config/webpack.config.js --open
```



#### 模块联邦

Webpack5之前可以通过 DLL 或者 Externals 做代码共享，但是不足的是还做不到跨项目和应用共享，更别说要做到热拔插了。webpack5中的模块联邦就是为了解决这种问题而诞生的。通过该机制，可以让构建后的代码库**动态的**、**运行时的**跑在另一个代码库中。通过细化功能模块、组件复用、共享第三方库、线上加载npm包等方式，可以更好的服务于多页应用、微前端等开发模式。

webpack5提供了一个叫做ModuleFederationPlugin的插件实现该机制，需要配置一下几个参数：

name：必传且唯一，第三方引用关键名称。

library: 声明一个挂载在全局下的变量名，其中name即为umd的name

filename: 构建后的chunk名称，通过

Exposes: 作为被引用方最关键的配置项，用于暴露对外提供的modules模块

shared: 声明共享的第三方资源

我们接下来通过一个简单的实例来实战一把。新建两个工程App1和APP2，在APP2中暴露一定的模块在APP1中使用。先看下App2，

```
├── package.json
├── public
|  └── index.html
├── src
|  ├── app.js
|  ├── components
|  └── index.js
├── webpack.config.js
└── yarn.lock
```

配置webconfig.config.js（省略部分配置），端口暴露为3001

```js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3001,
  },
  output: {
    publicPath: "http://localhost:3001/", 
  },
  module: {
    省略
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      library: { type: 'var', name: 'app2' },
      filename: 'remoteEntry.js',
      exposes: {
        './Counter': './src/components/Counter',
      },
      shared: ['react', 'react-dom'],
    })
  ],
};


```

需要注意的是filename，这个是暴露出去的chunk名称，也就是可以通过这个name进行远程访问。接下来，再在src/components声明一个要暴露出去的展示组件。

```
import React from 'react';

function Counter(props) {
  return (
    <>
      <p>Count: {props.count}</p>
      <button onClick={props.onIncrement}>Increment</button>
      <button onClick={props.onDecrement}>Decrement</button>
    </>
  );
}
```

App2工程新建完毕。现在我们看下App1的配置。先看webpack.config.js，设置端口为3000

```js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
  },
  output: {
    publicPath: "http://localhost:3000/",
  },
  module: {
    省略
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      library: { type: 'var', name: 'app1' },
      remotes: {
        appAlias: 'app2',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

在这里特别需要注意的是在ModuleFederationPlugin中设置remote，指定依赖的远程库，并给远程库起一个别名appAlias。

还需要在index.html中引入远程库

```
<script src="http://localhost:3001/remoteEntry.js"></script>
```

下面我们在APP1中新建一个组件用例测试一下远程组件是否真的生效。在src下新建一个app.js

```react
const Counter = React.lazy(() => import('appAlias/Counter'));

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <React.Suspense fallback='Loading Counter...'>
        <Counter
          count={count}
          onIncrement={() => setCount(count + 1)}
          onDecrement={() => setCount(count - 1)}
        />
      </React.Suspense>
    </>
  );
}
```

万事俱备，现在可以把两个应用启动一下看看效果了。

![效果](./images/wp-4.png)

<center>图3-4</center>

### 3.2 vite构建实战

2021年2月17日，vite2.0发布了，在前端圈引起了 不小的轰动。至于引起轰动的原因恐怕要数官网上介绍的这几点原因：

- 去掉打包步骤，快速的冷启动
- 及时的模块热更新，不会随着模块变多而使得热更新变慢
- 真正的按需编译

vite是基于浏览器native的ES module进行开发的、bundleless思想。所以解Vite前，需要先了解Bundle和Bundleless。

Bundle和Bundleless是两种开发方式，自 2015 年 ESM 标准发布后，这两种开发方式就逐渐明确。

日常开发中我们一般都会使用Webpack对代码进行编译、打包生成bundle文件，为什么需要这么做呢，简单来说就是一下几点：

- 很多应用都是运行在HTTP/1.1上，并且各浏览器有连接限制。
- 浏览器不支持的模块系统不能直接运行，如commonjs
- 新的语法浏览器不识别
- 代码依赖关系与顺序管理

但是，在项目达到一定的规模时，基于 Bundle 的构建优化的收益变得越来越有限，无法实现质的提升。webpack 之所以变慢，主要的原因还是在于他将各个资源打包整合在一起形成 bundle，项目规模越大，资源也就越多。是不是有种方案可以不用打包直接可以在浏览器中执行代码？这就是bundleless。

<img src="./images/vite-03.png" alt="bundle" style="zoom:50%;" />

<center>图3-5</center>

在 Bundleless 的模式下，应用不再需要构建一个完整的 bundle。修改文件时也不需要重新生成bundle文件，浏览器也只需要重新加载单个文件即可。 只需要刷新即可即时生效的体验，如果有 HotModuleReplace等相关技术加持，最终实现完美的开发体验。

实现 Bundleless 一个很重要的基础能力是模块的动态加载能力，实现这个功能主要的思路会有两个：

- 使用System.js 之类的 ES 模块加载器，这样做的好处是具有很好的模块兼容性。
- 直接利用标准的 ES Module。该module实现已经标准化，并且各个浏览器厂商也已纷纷支持(edge79, firefox 67, chrome63, safari11.1,opera50, 这是几个浏览器支持ES module的最低版本 )。我详细以后前端同时整体架构在各种标准化的基础上也会变得更加简单。

可以用一个表格对两种模式进行下对比。

|          | Bundle                          | Bundleless                       |
| -------- | ------------------------------- | -------------------------------- |
| 启动时间 | 时间较长                        | 短，只启动Server 按需加载        |
| 构建时间 | 随项目体积线性增长              | 构建时间复杂度O(1)               |
| 加载性能 | 打包后加载对应Bundle            | 请求映射的本地文件               |
| 缓存能力 | 缓存利用率一般，受split方式影响 | 缓存利用率近乎完美               |
| 文件更新 | 重新打包                        | 重新请求单个文件                 |
| 调试体验 | 需要SourceMap                   | 不强依赖SourceMap,可单文件调试   |
| 生态     | 比较完善                        | 目前相对不成熟，但是方案越来越多 |

基于ES module的构建，其实vite并不是首创，同样的实践在之前以后类似的轮子，如esbuild，snowpack，es-dev-server等。这部分我们将通过一个实例来介绍一下vite是如何进行开发的。

同常见的开发工具一样，vite 提供了用 npm 或者 yarn 一建生成项目结构的方式。我们使用 yarn来生成一个React项目：

```js
yarn create vite-app vite-project
cd vite-project
yarn install
```

目录结果是这样的：

```js
├── index.html
├── node_modules
├── package.json
├── src
|  ├── App.css
|  ├── App.jsx
|  ├── api
|  |  ├── request.js
|  |  ├── serviceApi.js
|  |  └── urlConfig.js
|  ├── constants
|  |  └── statusCode.js
|  ├── contanier
|  |  ├── home
|  |  └── main
|  ├── favicon.svg
|  ├── index.css
|  ├── logo.svg
|  ├── main.jsx
|  ├── routers
|  |  ├── history.js
|  |  └── index.js
|  └── utils
├── vite.config.js
└── yarn.lock
```

index.html为页面入口，main.jsx为系统主入口，vite.config.js为配置文件，该文件可以类比vue项目的vue.config.js。

在项目开始前，我先引入几个项目核心库: 核心库react-router-dom和history, UI库ant design，ajax库axios，css预处理器Less。

第一步先配置下组件库，因为在后面的组件中我们会用到UI组件。我们考虑在配置文件中引入，而不是在main.jsx中，这是因为如果是在main.jsx中引入的话，项目build的时候构建工具会把整个css文件全部引入，这样是没有必要的，所以尝试按需加载。

vite按需加载需要借助插件vite-plugin-imp ，

```js
yarn add vite-plugin-imp -D
```

在vite.config.js中配置插件

```js
import vitePluginImp from 'vite-plugin-imp'
 plugins: [
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/lib/${name}/style/index.less`,
        },
      ],
    })
  ],
   css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      }
    }
  }
```

css预处理器来提取公用css变量及css函数并放在一个文件中, 所以确认增加以上配置。并且配置 `javascriptEnabled`为 `true`，支持 less 内联 JS。

还有一个比较实用的功能就是自动刷新，vite也没有掉队。借助插件@vitejs/plugin-react-refresh，

```js
import reactRefresh from '@vitejs/plugin-react-refresh'
plugins: [
   reactRefresh()
]
```

短路径配置

```js
resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src') 
    }
 },
```

代理配置

```js
server : {
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
```

环境参数配置

在日常开发中，经常会遇到有些代码或者配置是要区分环境的。在webpack中可以在scripts中定义NODE_ENV或者在webpack.config.js中定义DefinePlugin实现。

在vite中可以通过在scripts中定义mode实现：

```js
"dev": "vite --mode development",
```

 ```js
//环境值
const env = process.argv[process.argv.length - 1]
console.log("当前环境：", env) // development
 ```



我们先在container目录下建两个组件： home和main，当path为"/"是渲染home组件，当path为"/main"是渲染main组件，

```react
// container/home/home.jsx
import { Button } from 'antd'
function Home() {
  return (
    <div>
      <div>Home, from router</div>
      <Button type="primary">submit</Button>
    </div>
  );
}
//container/main/index.jsx
function Main() {
  return (
    <div>
      Main, from router
    </div>
  );
}
```

有了组件，我们开始配置router，在routers目录下建立index.js

```js
import Home  from "@/contanier/home"
import Main from "@/contanier/main"
export default [
  {
    path: "/",
    component: Home
  },
  {
    path: "/main",
    component: Main 
  }
]
```

定义配置后，需要在app.jsx中遍历这个数组，生成路由配置

```react
//app.jsx
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "./routers"
function App() {
  const [count, setCount] = useState(0)
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          // 省略部分代码
          <Switch>
            {
              routes.map(route => <Route exact key={route.path} path={route.path}>
                <route.component />
              </Route>)
            }
          </Switch>
        </header>
      </div>
    </Router>    
  )
}
```

先启动下项目看看效果

```
yarn run dev

vite v2.1.2 dev server running at:
  > Local:    http://localhost:3000/
  > Network:  http://192.168.1.6:3000/
  > Network:  http://192.168.192.196:3000/

  ready in 1982ms.
```

![home](./images/vite-04.png)

<center>图3-6</center>

然后再输入http://localhost:3000/main

![home](./images/vite-05.png)

<center>图3-7</center>

有了页面组件，就要考虑ajax请求的事儿了，要么页面是没有灵魂的。在api目录下建立request.js，先对axios做一层封装，配置request和response拦截器，这也是前端开发里面的通用做法。

```js
import axios from "axios";
import StatusCode from "@/constants/statusCode";

const instance = axios.create({
  baseURL: "",
  timeout: 50000,
  xsrfCookieName: "xsrf-token",
});
//请求拦截器，如果说hearder中需要增加什么参数，可以在这里统一处理
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 添加一个响应拦截器，对每次返回的数据进行拦截，并进行业务判断
instance.interceptors.response.use(
  (response) => {
    return Promise.reject(response.data);
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

axios拦截器为我们的日常开发提供了很多便利，如果需要在每个请求中增加相同的参数，可以在request拦截器中进行配置。如果是统一处理返回的数据，如无权限，404，没有登录等这种通用场景，可以同一再response的拦截器处理。

以上是vite配合React开发的基本配置，大家可以上手一试。



### 3.3 Rollup实战

Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码。当你用ES2015及其以后的规范来编写应用或者库时，它也可以对它有效的打包来，打包成为一个单独文件供浏览器和 Node.js 使用。从这个角度讲，它和browserify、webpack、gulp有几分相似。

为了更好说明rollup的应用场景，我们先简单比较一下rollup和webpack：

- webpack天然支持code spliting和HRM,但是rollup却不支持。
- Rollup打包出来的代码体积更小，webpack4版本的bundle中有大量的模块适配代码。
- Rollup 是基于 ES2015 模块的，它相比于webpack 所使用的 CommonJS 模块更加具有效率，另外 Rollup也支持 *tree-shaking*（ES 模块中支持 ），这意味着在最终的 bundle中只有我们实际需要的代码。
- webpack更适合做应用开发，Rollup更适合打包库

下面通过一个简单的加解密例子说明下Rollup的用法。

目录基本是这样的：

```js
├── node_modules
├── package-lock.json
├── package.json
├── rollup.config.js
├── src
|  ├── scripts
|  |  ├── main.js
|  |  ├── modules
|  |  └── utils
|  └── styles
└── yarn.lock
```

先使用yarn命令生成package.json

```js
yarn init -y 
```

再新建一个rollup.config.js,这是rollup要求的配置文件，在package.json中指定该配置启动

```js
//package.json
"build": "cross-env NODE_ENV=production rollup --config",
```

```js
module.exports={
  input: "src/scripts/main.js",
  output: {
    file: "dist/encrypt.min.js",
    format: "umd",
    name: "encrypt",
    sourceMap: 'inline'
  }
}
```

先初始化一个基本的rollup配置，指明入口文件和输出文件。input比较好理解，指的是rollup启动时需要执行的文件。我们需要对output中的字段进行下说明，它允许传入一个对象或一个数组，当为数组时，依次输出多个文件：

- file：输出文件的详细路径。
- format：Rollup 支持多种输出格式。因为要兼容其他模式，在这里指定为”UMD“格式。还有其他的格式可以选择，cjs（commonjs）,esm(ES module), system, amd,iife。
- name：输出文件名。
- sourceMap ：如果有 sourcemap 的话，那么调试代码时会比较轻松，这个选项会在生成文件中直接添加 sourcemap。

接下来先介绍几款插件，要不然改工程依然无法正常运行。

首先是babel插件rollup-plugin-babel，这个插件详细大家比较熟悉了，主要作用就是编译ES6的语法为ES5，让浏览器可以识别。

```js
yarn add @rollup/plugin-babel -D
```

在rollup.config.js中增加plugin配置

```js
//rollup.config.js
import babel from "@rollup/plugin-babel";
plugins: [
  babel()
]
```

还需要增加babel配置，在.babel文件中增加

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false  //Enable transformation of ES6 module syntax to another module type
      }
    ]
  ]
}
```



第二个插件是*rollup-plugin-node-resolve*，默认包后的`bundle.js`仍然会在`Node.js`中工作。为了解决这个问题，将我们的代码与依赖的第三方库进行合并才能解决这个问题。

```js
import resolve from "@rollup/plugin-node-resolve";
plugins: [
	resolve()   
]
```

第三个是commonjs插件，rollup.js编译源码中的模块引用默认只支持ES6+的模块方式`import/export`。然而有大量npm模块是基于`CommonJS`模块方式，这就导致了大量 npm模块不能直接编译使用

```js
import commonjs from "@rollup/plugin-commonjs";
plugins: [
	commonjs()   
]
```

第四个就是json插件，在咱们的实例中，我们会根据package.json生成加密、解密的密钥,

```js
const hash = require("content-hash");
function generatorKey() {
    let es = hash.encode("swarm-ns", fs.readFileSync("../../../package.json"))
    key = Buffer.from(es.substring(0,16), 'utf8');
    iv = Buffer.from(es.substring(2,18),'utf8');
}
```

在rollup中加载json文件需要插件协助，@rollup/plugin-json

```js
import json from '@rollup/plugin-json';
plugins: [
	json()   
]
```

有了上面的插件，rollup的基本构建就已经成型，下面我们看下具体的加解密代码。

```js
const crypto = require('crypto');
const fs = require("fs")
const hash = require("content-hash");
const util = require("../utils/util")

//128-cbc需要定义16位的key和iv
let key = '';
let iv = '';
//加密方式
const DEFAULT_CRYPTO_TYPE = 'aes-128-cbc';
const UTF8_TYPE = 'utf8';
const HEX_FORMAT = 'hex';

/**
 * 加密方法
 * @param {*} src ，需要加密的字符串
 */
function encrypt(src) {
    let sign = '';
    const cipher = crypto.createCipheriv(DEFAULT_CRYPTO_TYPE, key, iv);
    sign += cipher.update(util.trim(src), UTF8_TYPE, HEX_FORMAT);
    sign += cipher.final(HEX_FORMAT);
    return sign;
}

/**
 * 解密方法
 * @param {*} sign ,需要解密的字符串
 */
function decrypt(sign) {
    let src = '';
    const cipher = crypto.createDecipheriv(DEFAULT_CRYPTO_TYPE, key, iv);
    src += cipher.update(sign, HEX_FORMAT, UTF8_TYPE);
    src += cipher.final(UTF8_TYPE);
    return src;
}

function generatorKey() {
    let es = hash.encode("swarm-ns", fs.readFileSync("../../../package.json"))
    key = Buffer.from(es.substring(0,16), 'utf8');
    iv = Buffer.from(es.substring(2,18),'utf8');
}

generatorKey()

module.exports = {
    encrypt,
    decrypt   
}
```

这个加密工具方法中 ，我们使用128位aes-128-cbc加密方法，该加密方法17位的key和iv向量，为了不暴露key和iv，我们在generatorKey方法中，通过生成package.json文件的内容hash值来计算出。

我们先测试一下，看加解密是否能起作用

```js
const sign = encrypt('hello world');
console.log(sign);
console.log("加密后的长度：" +sign.length)
// 解密
const src= decrypt(sign);
console.log(src); 
```

经过测试，符合我们的预期效果

```
f09a42f0e4b7c667f3ba26e0d5d6e0b3
加密后的长度：32
helloworld
```

平时我们见到的工具包，以压缩文件居多，目的主要有两个，一来可以减少文件体积，二者可以隐藏代码实现。我们也按照这样的思路来，先安装插件 rollup-plugin-uglify，并在配置文件中进行配置

```js
import { uglify } from "rollup-plugin-uglify";
plugins: [
	process.env.NODE_ENV === "production" && uglify()
]
```

下面开始最终打包，

```js
yarn run build

$ cross-env NODE_ENV=production rollup --config
src/scripts/main.js → dist/encrypt.min.js..
created dist/encrypt.min.js in 2.6s
✨  Done in 5.84s.
```





### 3.4 parcel实战

目前有很多前端打包工具可以选择，像前面几节咱们介绍的webpack、vite和rollup，还包括咱们马上要介绍的parcel，还有老牌的Grunt和gulp，甚至新秀esbuild、swc等等。

需要打包工具都是围绕着配置和plugin开始构建的，在配置文件中总要安装一堆的npm包，配置文件更是需要手动配置入口文件，输出文件，开发服务器配置，proxy代理，loader配置，优化配置等等，这一串配置下来，动辄就到100行了。这些配置不仅繁琐而且耗时。parcel被设计成零配置的：只需要将它指向应用程序的入口点，它就能正常工作。

parcel可以利用多核处理器编译多种语言及其工具链，并且速度极快，它获取所有文件和依赖项并进行转换，然后将他们合并为较小的bundle包。并且parcel让编译的包更好低移植，可以为不同的环境、web 服务器或应用程序构建代码。

parcel将一个入口点作为输入，在parcel中定义了各种资源类型，它们知道如何处理特定的资源类型。资源文件被解析，它的依赖关系被提取，并转换成最终的编译形式。这创建了一个资源树。

一旦资源树被构建，资源就被放入一个bundle树中。为入口资源创建一个bundle，并为动态导入的资源创建子bundle，这回导致代码拆分的发生。当导入不同类型的资源的时候就会创建子bundle，例如如果你在js中导入css文件，它就会打包成对应js的兄弟bundle。如果一个资源需要多个bundle，它会被打包到最近的共同父bundle中，因此它不会被包含多次。

在构建bundle树之后，每一个包都有特定的文件类型的包装器写入文件。

下面通过构建一个实例来说明parcel在日常开发中需要的组件是如何配置的。

先新建一个package.json，并安装parcel核心包(本节实例基于2.0.0-beta.2)

```
yarn init -y
yarn add parcel
```

在package.json的同级目录下新建index.html和app.js, 在index.html中引入app.js, 了解一点web开发都知道，这是最直接、最方便的加载js文件的方式

```
<!DOCTYPE html>
<html lang="en">
<head>
  <title>parcel practise</title>
</head>
<body>
  <div class="app"></div>
  <script src="./app.js"></script>
</body>
</html>
```

为了验证方便，我们先输入最简单的一句：

```
//app.js
document.writeln("hello,parcel<br>")
```

在package.json的scripts配置中也是非常简单

```
 "start": "parcel index.html",
```

![parcel-01](./images/parcel-01.png)

<center>图3-8</center>

是我们预想的结果。这种开发方式确实能让人眼前一亮，没有任何配置，不用指定loader就可以运行。

我们接着看下是不是能识别import和ES语法，

```js
// src/scripts/index.js
export default {
  getCreateTime: ()=> {
    let d = new Date()
    return d.getFullYear()+  "-"+ (d.getMonth()+1) + "-"+ d.getDate()
  }
}
```

```js
// src/utils/index.js
const _package = require("../../package.json")
export default {
  projectName: "parcel project",
  getAuthor: function(){
    return "houyw"
  },
  getVersion: ()=>{
    return _package.version
  }
}
```

```js
// src/models/person.js
export default class Person {
  constructor(name,age){
    this.name = name;
    this.age = age;
  }
  getName(){
    return this.name
  }
  getAge(){
    return this.age
  }
}
```

下面我们把这几个例子都import到app.js中测试下，

```js
import name from "./src/utils/index"
import ss from "./src/scripts/index"
import Person from "./src/models/person"
import "./style.css"

const p = new Person("houyw",23)
console.log("class.name", p.getName())
console.log("class.name", p.getAge())
console.log("project name :", name.projectName)
console.log("project version :", name.getVersion() )
console.log("project create at:", ss.getCreateTime())
console.log("project created by:", name.getAuthor())
```

修改代码后，parcel的服务会自动重启。

![parcel-02](./images/parcel-02.png)

<center>图3-9</center>

从测试结果来看，parcel并不需要配置babel就可以将ES6转成ES5。这是因为在parcel中已经预置了babel编译 @parcel-transform-babel，更多的内置都插件可以在node_modules/@parcel目录下找到。

web开发中处理css文件是无论如何也不会少的。在parcel中，也提供比较清爽的处理方式：

```js
import "./style.css"
```

对sass的支持是怎样的呢？再style.css同级目录新建style.scss，并修改原来的样式引入

```scss
.app {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  border: 1px solid #ccc;

  .title {
    color: red;
  }
}
```

服务重新启动后，页面报错

![parcel-03](./images/parcel-03.png)

<center>图3-10</center>

这是因为parcel没有预置sass预处理器，需要我们手动安装

```js
yarn add scss -D
```

重新编译，正常运行。

接下来我们看下代理配置，这个配置在开发阶段经常用到，主要有两个方面的作用，第一是如果有单独的后端开发服务器 API，并且希望在同域名下发送 API 请求 ，那么这个配置会很有用。第二个也是最常见的解决开发环境的跨域问题。在开发过程中, 开发环境一般都是http://localhost, 但是如果请求的接口不在本地, 那么就要面对跨域请求的问题了。

parcel中配置proxy有两种方式，第一中是新建**.proxyrc**文件，该文件中是以json的方式定义proxy

```json
{
  "/api": {
    "target" : "http://demo.test.com:8000/",
    "pathRewrite" : {
      "^/api" : ""
    }
  }
}
```

这个代理表示的意思如果发起 **http://localhost:8080/api/getUsers** 会被代理到**ttp://demo.test.com:8000/getUsers**。

另外一种代理就是如果是配置比较复杂，可以使用.proxyrc.js文件，然后引入**http-proxy-middleware**

```js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "http://demo.test.com:8000/",
      pathRewrite: {
        "^/api": "",
      },
    })
  );
};
```

下面看下在parcel中怎么定义环境变量和在代码中怎么获取环境变量。

Parcel 使用[dotenv](https://github.com/motdotla/dotenv)支持从`.env`文件加载环境变量，默认会安装dotenv包，所以可以通过新建 **.env.${NODE_ENV}** 这样的文件来定义环境变量，开发环境的可以如下面在.env.development中定义。

```
NODE_ENV='development'
```

应用启动时默认加载development中定义的环境变量。相应的逻辑可以在parcel的源码中看到,具体的路径为src/utils/env.js

```
const config = require('./config');
const dotenv = require('dotenv');

async function loadEnv(filepath) {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const dotenvFiles = [
    `.env.${NODE_ENV}.local`,
    `.env.${NODE_ENV}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== 'test' && '.env.local',
    '.env'
  ].filter(Boolean);

  await Promise.all(
    dotenvFiles.map(async dotenvFile => {
      const envPath = await config.resolve(filepath, [dotenvFile]);
      if (envPath) {
        dotenv.config({path: envPath});
      }
    })
  );
}
```

经过前面几个实验给人的感觉，0配置的parcel给人很好的开发体验，让前端开发避免陷入前端无穷配置的泥淖中，专注业务。但是有些问题还是会给实际的业务开发带来写不便， parcel现在稳定版本还是1.12.4，该分支也有至少1年的时间没有维护，并且很多关键的特性是缺失的，比如说公共文件提取，scope Hoisting，tree shake等。

从parcel 在GitHub上的提交记录上看，该团队在着力开发2.0的代码，并且在2.0中也加入了使用配置，如显式proxy，scope Hoisting, 可扩展的API接口，SourceMap，Optimizer等等。但是要想成立主力分支现在看来还为时尚早，和三方包的集成也存在很多问题，parcel团队还需要很多的时间修复问题并保持feature的稳定。

所以建议大家长期关注并实验，积累parcel的最佳实践。不要急于用来上手项目，毕竟产品不等于试验品。

期待parcel的稳定版早日到来，也期待这新版本让前端在开发的路上如释重负。



