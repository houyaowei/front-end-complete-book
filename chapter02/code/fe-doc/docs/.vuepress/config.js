module.exports = {
  title: '前端资源文档',  // 设置网站标题
  description : 'fe doc',
  base : '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }] 
  ],
  themeConfig : {
    nav : [
        { text: 'W3c', link: '/guide/w3c/' },
        { text: '前端牛人', link: '/guide/superman/' },
        { text: '社区网站', link: '/guide/community/' }
    ],
    sidebar: [
      ['/', '介绍'],
      ['/guide/web/', 'web'],
      ['/guide/ts/', 'TS'],
      ['/guide/w3c/', 'W3C'],
      ['/guide/superman/','前端牛人'],
      ['/guide/community/','社区'],
      ['/guide/examples/','嵌入vue组件'],
    ],
    sidebarDepth: 2,
    lastUpdated: 'Last Updated',
  }
}