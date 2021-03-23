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

