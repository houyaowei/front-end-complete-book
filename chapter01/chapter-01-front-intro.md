## 第1章 前端开发基础

先省略，还没想好内容。

主要涉及到：

1. 重温package.json。

2. 配置babel7。

3. 走过不能错过的ES规范。

4. 使用Deno换一种方式开发。

   


#### 1.1 重温package.json

如果问任何一位前端开发“你对package.json文件熟悉吗？”，你可能会得到一个斩钉截铁的回答，“很熟悉啊，每个前端项目都有这个文件，配置项目启动、打包命令，声明依赖的npm包。” 这样的配置很适合常见的web工程。如果你打开一个npm包的package.json，那么你可能会发现，比常见的web工程的配置要多一些，我们就以vue@2.6.12版本为例，看下它的package.json都包含了哪些配置。

```json
{
  "name": "vue",
  "version": "2.6.12",
  "description": "",
  "main": "dist/vue.runtime.common.js",
  "module": "dist/vue.runtime.esm.js",
  "unpkg": "dist/vue.js",
  "jsdelivr": "dist/vue.js",
  "typings": "types/index.d.ts",
  "files": [],
  "sideEffects": false,
  "scripts": {},
  "gitHooks": {},
  "lint-staged": {},
  "repository": {},
  "keywords": [],
  "author": "Evan You",
  "license": "MIT",
  "bugs": {},
  "homepage": "https://github.com/vuejs/vue#readme",
  "devDependencies": {},
  "config": {
    "commitizen": {
      "path": ""
    }
  }
}

```

这么多的配置项不知道和你预想的有没有差距？

package.json做为web工程的入口到底有多少配置是和我们的日常相关？哪些配置是和npm包相关的？又有什么配置会和其他三方工具有交集？怎么和三方工具配合能给日常开发提供便利？下面我们一点一点来剖析这个文件。

先使用npm或者yarn生成一个最简单的package.json文件:

> 备注：笔者npm版本为 6.12.0

```shell
yarn init -y
```

```json
{
  "name": "package-json-intro",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "description": ""
}
```

这是一个JSON对象，每一项都是该项目的配置。各个配置代表的意思如下：

- name：项目名称，必须字段。 
- version：项目版本，必须字段。
- main：入口文件
- license: 项目遵守的许可证
- scripts： 可运行的npm命令
- keywords：关键词
- author：作者
- description: 项目描述

package.json中有两个字段比较特殊，name和version，规范要求是必须字段。需要对这两个字段做下详细说明。先看下name字段：

- 长度须小于等于214个字符，不能以"."或者"_"开头，不能包含大写字母。

- 名字可以作为参数被传入require("")，用来导入模块，所以尽量语义化。

- 字段不能与其他模块名重复，可以使用**npm view <packageName>**查询是否重复

  如果不重复，就提示404

  ![](./images/pj-1.png)

<center>图1-1</center>      

如果npm上有对应的包，会显示包的详细信息:

![](./images/pj-2.png)

<center>图1-2</center>

再看下version字段：

- 遵守语义化版本 2.0.0（ SemVer）规范。格式为： **主版本号.次版本号.修订号**。主版本号表示做了不兼容的 API 修改，次版本号表示做了向下兼容的功能性新增，修订号表示做了向下兼容的bug修复。
- 如果某个版本改动比较大、并且不稳定，可能无法满足预期的兼容性需求时，还是要先发布先行版本。
- 先行版本号可以加到**主版本号.次版本号.修订号**的后面，通过 `-` 号连接以点分隔的标识符和版本编译信息：内部版本(alpha)，公测版本(beta)，候选版本rc（即 Release candiate），如图1-3所示的vue发布的版本号：

![](./images/pj-3.png)

<center>图1-3</center>

- 查看npm包的版本信息，以vue包为例：

  查看最新版本：npm view vue version

  查看所有版本：npm view vue versions

keywords： 包关键字，会对包中的 `description` 字段和 `keywords` 字段进行匹配，写好 `package.json`中的 `description` 和 `keywords` 将有利于增加包的曝光率。

依赖包：

npm包声明会添加到dependencies或者devDependencies中，dependencies中的包指定了项目在生产运行所必须的包。devDependencies中声明的是开发阶段需要的包，如webpack，eslint，babel等，用来辅助开发，打包上线时并不需要这些包。所以大家要根据包的实际用处声明到适当的位置。

scripts脚本：

package.json内置脚本入口，是stage-value键值对配置，key为可运行的命令，通过npm run <stage>执行命令。除了运行基本的scripts命令，还可以结合pre和post完成前置、后续操作，该操作可以类比单元测试用的setUp和tearDown。我们先看一组scripts：

```javascript
"scripts": {
    "dev": "node index.js",
    "predev": "node beforeIndex.js",
    "postdev": "node afterIndex.js"
 },
```

这三个文件中都只有一句console语句：

```javascript
//index.js
console.log("scripts : index.js")

//beforeIndex.js
console.log("scripts: before index.js ")

//afterIndex.js
console.log("scripts: after index.js ")
```

现在我们只执行`npm run dev`,看下效果是什么样的：

```shell
$ node beforeIndex.js
scripts: before index.js 
$ node index.js
scripts : index.js
$ node afterIndex.js
scripts: after index.js 
```

这三个script都执行了，执行的顺序是 `predev-> dev -> postdev`。如果scripts命令存在一定的先后关系，采取这种pre&post scripts不失为一种好的方案。

files

files是一个数组配置，用来描述作为依赖包安装时所描述的文件列表。当npm包release时，files指定哪些文件会被推送到npm服务器，如果指定的是文件夹，那么该文件夹下面的所有的文件都会被提交。

如果有文件不想提交，可以在.npmignore中说明。我们看下vue包中的配置：

```json
"files": [
    "src",
    "dist/*.js",
    "types/*.d.ts"
 ],
```

![](./images/pj-4.png)

<center>图1-4</center>

入口文件main：

用来指定加载的入口文件，browser 、 node 环境均可使用。如果项目发布成了`npm` 包，用户安装后并且使用require('my-module')` 返回的就是 `main` 字段中所列出文件的 `module.exports` 属性。如果不指定该字段，node会尝试加载根目录的`index.js、index.json或index.node`，如果都没有找到，就会报错，只能通过require('my-module/dist/xxx.js')这种方式加载。

module配置：

定义 npm 包的 ESM 规范的入口文件，browser 环境和 node 环境均可使用。

browser配置：

npm 包在 browser 环境下的入口文件。

不知道读者有没有发现，main、module、browser这三项配置都是和入口文件相关，



我们之所以把main、module、browser三者放在一起介绍，是因为这几项间还是有差别的，特别是在不同的使用场景下。

在web环境下，如果使用loader加载的是ESM（ES module），那么这三项配置加载的顺序是browser > module > main，如果使用require加载的commonjs模块，加载的顺序就变成了module > main；如果是在node环境中，加载commonjs模块，那么只有main字段有效；