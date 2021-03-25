## 第3章 构建工具实战

前端发展到今天，工程化在前端开发中越来越扮演着重要的角色，特别是在前端组件陡增、开发规范日益完善、越来越追求开发效率的要求中，怎么做好工程化是摆在每个高级前端开发人员特别是前端架构师面前一个比较有挑战的任务。在本章中，我们将详细地介绍目前在开发中比较常见的几种构建工具，通过实例带大家了解下怎么处理日常构建问题。主要通过以下几节给大家做具体分析：

1. webpack5新特性介绍。
2. 新锐构建工具vite实战。
3. parcel实战。
4. rollup从0到1怎么构建一个库。



3.1 webpack5新特性介绍

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

 持久化缓存

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

也需要在package.json配置

```json
// package.json
{
  ...
  "installConfig": {
    "pnp": true
  }
}
```



