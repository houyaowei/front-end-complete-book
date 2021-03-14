module.exports = {
  title: '前端组件接口文档',  // 设置网站标题
  description : 'fe doc',
  base : '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }] /
  ],
  themeConfig : {
    nav : [
        { text: '接口定义', link: '/apiword' },
        { text: '接口字段定义', link: '/api' },
        { text: '附录：错误码', link: '/error' }
    ],
    sidebar: {
      '/android/': ["android1"],
        "/ios/":["ios1",],
        "/web/":["web1",],
        },
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
    },
    sidebarDepth : 2
  }