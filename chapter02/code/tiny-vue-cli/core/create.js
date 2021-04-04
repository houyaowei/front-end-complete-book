/**
 * main entry
 */
const path = require('path')
const inquirer = require('inquirer')
const RequireModulesAPI = require('./requireModulesAPI')
const clearConsole = require("./utils/clearConsole")
const Creator = require('./Creator')
const Generator = require('./generator')
const executeCommand = require("./utils/executeCommand")

/**
 * 导入要提示的模块
 */
function getPromptModules() {
  return [
    'babel',
    'router',
    'vuex',
    'linter',
  ].map(file => require(`./requireModules/${file}`))
}

async function create(name) {
  const _creator = new Creator();
  // 获取各个模块的交互提示语
  const _promptModules = getPromptModules()
  const _promptAPI = new RequireModulesAPI(_creator)
  //执行注入各模块的提示语
  _promptModules.forEach(m => m(_promptAPI))

  //先把控制台清空
  clearConsole()

  const _answers = await inquirer.prompt(_creator.getFinalPrompts())
  //默认加入vue和webpack
  _answers.features.unshift('vue', 'webpack')

  //默认package.json配置
  const pkg = {
    name,
    version: '0.1.0',
    dependencies: {},
    devDependencies: {},
  }
  // generator init
  const generator = new Generator(pkg, path.join(process.cwd(), name))
  
  //执行generator的render方法，由_injectFileMiddleware方法记录中间件
  _answers.features.forEach(feature => {
    require(`./generator/${feature}`)(generator, _answers)
  })

  await generator.generate()

  // 安装依赖
  // TODO,npm包安装失败
  await executeCommand('npm install', path.join(process.cwd(), name)).catch(e=> {
    console.log("execute npm install failed")
  })
  console.log('\n项目创建成功, 执行下列命令开始开发：\n')
  console.log(`cd ${name} \n npm run dev`)
}

module.exports = create;