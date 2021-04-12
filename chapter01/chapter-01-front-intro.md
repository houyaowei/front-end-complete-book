## 第1章 前端工程核心

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

package.json做为web工程的入口到底有多少配置是和我们的日常相关？又有什么配置会和其他三方工具有交集？怎么和三方工具配合能给日常开发提供便利？下面我们一点一点来剖析这个文件。

先使用npm或者yarn生成一个最简单的package.json文件

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
- version：项目版本，必须字段。遵守语义化版本 2.0.0规范。格式为： 主版本号.次版本号.修订号。主版本号表示做了不兼容的 API 修改，次版本号表示做了向下兼容的功能性新增，修订号表示做了向下兼容的bug修复。
- main：入口文件
- license: 项目遵守的许可证
- scripts： 可运行的npm命令
- keywords：关键词
- author：作者
- description: 项目描述

我们需要对name字段做以下说明：

- 长度须小于等于214个字符，不能以"."或者"_"开头，不能包含大写字母。

- 名字可以作为参数被传入require("")，用来导入模块，所以尽量语义化。

- 字段不能与其他模块名重复，可以使用**npm view <packageName>**查询是否重复

  如果不重复，就提示404

  ![](./images/pj-1.png)

<center>图1-1</center>      

如果npm上有对应的包，会显示包的详细信息

![](./images/pj-2.png)

